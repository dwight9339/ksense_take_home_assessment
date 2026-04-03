import { fetchAllPatients, submitAssessment } from "./api";
import { buildSubmissionPayload } from "./risk";

async function main(): Promise<void> {
  const patients = await fetchAllPatients();

  console.log(`Fetched ${patients?.length ?? 0} patients`);

  const payload = buildSubmissionPayload(patients ?? []);

  console.log("Submission payload:");
  console.log(JSON.stringify(payload, null, 2));

  const result = await submitAssessment(payload);

  console.log("Submission result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});