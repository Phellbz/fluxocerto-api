import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (inQuotes) {
      if (char === "\"") {
        const next = content[i + 1];
        if (next === "\"") {
          current += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n") {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    current += char;
  }

  row.push(current);
  rows.push(row);

  return rows;
}

function normalize(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? "" : trimmed;
}

async function main() {
  const csvPath = path.resolve(__dirname, "seed-data", "categories_rows.csv");
  const csvContent = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvContent);

  if (rows.length < 2) {
    throw new Error("CSV vazio ou sem dados.");
  }

  const header = rows[0].map((col) => col.trim());
  const nameIndex = header.indexOf("name");
  const groupNameIndex = header.indexOf("group_name");

  if (nameIndex === -1 || groupNameIndex === -1) {
    throw new Error("CSV não contém as colunas obrigatórias: name, group_name.");
  }

  const existing = await prisma.category.findMany({
    where: { companyId: "c_1" },
    select: { name: true },
  });

  const knownNames = new Set(existing.map((item) => item.name));
  const toCreate: { companyId: string; name: string; groupName: string }[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.length === 1 && row[0].trim() === "") {
      continue;
    }

    const name = normalize(row[nameIndex]);
    const groupName = normalize(row[groupNameIndex]);

    if (knownNames.has(name)) {
      continue;
    }

    knownNames.add(name);
    toCreate.push({
      companyId: "c_1",
      name,
      groupName,
    });
  }

  if (toCreate.length > 0) {
    await prisma.category.createMany({ data: toCreate });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
