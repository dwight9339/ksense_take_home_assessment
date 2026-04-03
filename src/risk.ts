import { Patient, SubmissionPayload } from "./types";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseBloodPressure(value: unknown): { systolic: number; diastolic: number } | null {
  if (typeof value !== "string" || value.trim() === "") return null;

  const parts = value.split("/");
  if (parts.length !== 2 || parts[0] === "" || parts[1] === "") return null;

  const systolic = Number(parts[0]);
  const diastolic = Number(parts[1]);

  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null;

  return { systolic, diastolic };
}

export function scoreBloodPressure(value: unknown): number {
  const parsed = parseBloodPressure(value);
  if (!parsed) return 0;

  const {systolic, diastolic } = parsed;
  let score = 0;

  if (systolic >= 120 && systolic <= 129 && diastolic < 80) score = 1;
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) score = 2;
  if (systolic >= 140 || diastolic >= 90) score = 3;

  return score;
}

export function scoreTemperature(value: unknown): number {
  const temp = toNumber(value);
  if (temp === null) return 0;
  if (temp <= 99.5) return 0;
  if (temp <= 100.9) return 1;
  return 2;
}

export function scoreAge(value: unknown): number {
  const age = toNumber(value);
  if (!age) return 0;
  let score = 0;

  if (age >= 40 && age <=65) score = 1;
  if (age > 65) score = 2;

  return score;
}

export function hasDataQualityIssue(patient: Patient): boolean {
  return (
    parseBloodPressure(patient.blood_pressure) === null ||
    toNumber(patient.temperature) === null ||
    toNumber(patient.age) === null
  );
}

export function buildSubmissionPayload(patients: Patient[]): SubmissionPayload {
  const highRisk = new Set<string>();
  const fever = new Set<string>();
  const dataQuality = new Set<string>();

  for (const patient of patients) {
    const id = patient.patient_id;
    console.log(`patient: ${JSON.stringify(patient)}`);
    if (!id) continue;

    const bpScore = scoreBloodPressure(patient.blood_pressure);
    const tempScore = scoreTemperature(patient.temperature);
    const ageScore = scoreAge(patient.age);

    const totalRisk = bpScore + tempScore + ageScore;

    const temp = toNumber(patient.temperature);

    console.log(`bpScore: ${bpScore}, tempScore: ${tempScore}, ageScore: ${ageScore}, totalRisk: ${totalRisk}`)

    if (totalRisk >= 4) {
      highRisk.add(id);
      console.log("high risk");
    }

    if (temp !== null && temp >= 99.6) {
      fever.add(id);
      console.log("fever")
    }

    if (hasDataQualityIssue(patient)) {
      dataQuality.add(id);
      console.log("data quality issue");
    }
  }

  return {
    high_risk_patients: [...highRisk].sort(),
    fever_patients: [...fever].sort(),
    data_quality_issues: [...dataQuality].sort()
  };
}