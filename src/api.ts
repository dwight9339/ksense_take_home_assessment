import * as dotenv from "dotenv";
import { PatientsResponse, SubmissionPayload } from "./types";

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || "https://assessment.ksensetech.com/api";

if (!API_KEY) {
  throw new Error("Missing API_KEY in .env");
}

const DEFAULT_HEADERS = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json"
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return (await response.json()) as T;
      }

      if ([429, 500, 503].includes(response.status) && attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 8000);
        await sleep(delay);
        attempt++;
        continue;
      }

      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    } catch (error) {
      if (attempt >= maxRetries) {
        throw error;
      }

      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await sleep(delay);
      attempt++;
    }
  }
}

export async function fetchAllPatients(): Promise<PatientsResponse["data"]> {
  const allPatients = [];
  let page = 1;
  const limit = 20;

  while (true) {
    const url = `${BASE_URL}/patients?page=${page}&limit=${limit}`;
    const result = await requestWithRetry<PatientsResponse>(url, {
      method: "GET",
      headers: DEFAULT_HEADERS
    });

    const patients = Array.isArray(result.data) ? result.data : [];
    allPatients.push(...patients);

    const hasNext = result.pagination?.hasNext;

    if (!hasNext) {
      break;
    }

    page++;
    await sleep(250);
  }

  return allPatients;
}

export async function submitAssessment(payload: SubmissionPayload): Promise<unknown> {
  return requestWithRetry(`${BASE_URL}/submit-assessment`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload)
  });
}