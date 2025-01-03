// csvService.ts
import { parse } from "csv-parse";

export async function parseCsv(
  csvBuffer: Buffer
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const records: Record<string, string>[] = [];
    const parser = parse({
      columns: true, // 1行目をヘッダとして扱う
      skipEmptyLines: true,
      trim: true,
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    parser.on("error", (err) => reject(err));
    parser.on("end", () => resolve(records));

    parser.write(csvBuffer);
    parser.end();
  });
}
