import { createHash } from "node:crypto";
import { ask } from "./inquest.mjs";

export function renderVerdict(sitting) {
  const { record, charges, finding } = sitting;
  const lines = [];
  lines.push("INQUEST VERDICT");
  lines.push(`Case: ${record.title}`);
  lines.push(`Id: ${record.id}`);
  lines.push(`Network: ${record.network}`);
  lines.push(`Transaction: ${ask(record.txHash)}`);
  lines.push(`Recorded status: ${record.status}`);
  lines.push(`Finding: ${finding === "clean" ? "All charges held." : "One or more charges failed."}`);
  lines.push("");
  lines.push("Charge sheet:");
  for (const charge of charges) {
    const mark = charge.held ? "HELD" : "FAILED";
    lines.push(`- ${charge.id} ${charge.name}: ${mark} (${charge.detail})`);
  }
  if (record.summary) {
    lines.push("");
    lines.push("Note from the record:");
    lines.push(record.summary);
  }
  lines.push("");
  lines.push("This letter uses only facts in the record. Missing fields are marked not in the record.");
  const body = lines.join("\n");
  const seal = createHash("sha256").update(body, "utf8").digest("hex");
  const letter = `${body}\nSeal: ${seal}\n`;
  return { letter, seal, finding };
}
