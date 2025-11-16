export class ErrorHelper {
  static getData(error: any): string {
    const data =
      "response" in error && "data" in error.response
        ? error.response.data
        : {};

    return JSON.stringify(data);
  }

  static formatStack(error: Error): string {
    const trace = error.stack?.toString() || "";
    const data = this.getData(error);
    const lines = trace.split("\n");
    
    let errorMessage = "";
    const rows: Array<{
      lineColumn: string;
      fileName: string;
      symbol: string;
    }> = [];

    for (const line of lines) {
      // Skip lines containing "(node:" or "node_modules"
      if (line.includes("(node:") || line.includes("node_modules")) {
        continue;
      }

      // Remove "    at " at the beginning of the line
      const cleanedLine = line.replace(/^\s+at\s+/, "");

      // Parse: functionName (full/path/to/file.ts:line:column)
      const match = cleanedLine.match(/^(.+?)\s+\(([^)]+):(\d+):(\d+)\)$/);
      if (!match) {
        // If pattern doesn't match, it might be the first error message line
        if (cleanedLine.trim() && !errorMessage && !rows.length) {
          errorMessage = cleanedLine.trim();
        }
        continue;
      }

      const symbol = match[1];
      const filePath = match[2];
      const lineNum = match[3];
      const column = match[4];

      // Split path to get file name
      const pathParts = filePath.split("/");
      const fileName = pathParts[pathParts.length - 1];

      rows.push({
        lineColumn: `${lineNum}:${column}`,
        fileName: fileName,
        symbol: symbol,
      });
    }

    // Create result
    const formattedRows: string[] = [];

    // Add first error message if exists
    if (errorMessage) {
      formattedRows.push(errorMessage);
    }

    if (rows.length === 0) {
      return formattedRows.join("\n");
    }

    formattedRows.push(`DATA: ${data}`);

    // Calculate maximum width of each column
    const maxLineColumnWidth = Math.max(
      ...rows.map((r) => r.lineColumn.length)
    );
    const maxFileNameWidth = Math.max(...rows.map((r) => r.fileName.length));
    const maxSymbolWidth = Math.max(...rows.map((r) => r.symbol.length));

    // Rows
    for (const row of rows) {
      const formattedRow = [
        row.lineColumn.padEnd(maxLineColumnWidth),
        row.fileName.padEnd(maxFileNameWidth),
        row.symbol.padEnd(maxSymbolWidth),
      ].join(" ");
      formattedRows.push(formattedRow);
    }

    return formattedRows.join("\n");
  }
}
