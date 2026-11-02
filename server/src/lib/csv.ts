export function convertToCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvValue).join(",");

  const lines = rows.map((row) => {
    return headers.map((header) => escapeCsvValue(row[header])).join(",");
  });

  return [headerLine, ...lines].join("\n");
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }

  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
