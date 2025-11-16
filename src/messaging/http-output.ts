import { Logger } from "@nestjs/common";
import { InfraError, Message } from "./app-message";
import { getHandlers } from "../config";
import { rescue } from "../helpers/rescue";

const logger = new Logger("Pinecone/SendResp");

export type Output<T> = {
  success: boolean;
  code: string;
  data: T | null;
  message: string;
};

export class SendOutput {
  static fail<T>(
    code: string,
    message: string = "",
    data: T | null = null
  ): Output<T> {
    return {
      success: false,
      code,
      message,
      data,
    };
  }

  static success<T>(data: T): Output<T> {
    return {
      success: true,
      data,
      code: "OK",
      message: "",
    };
  }

  static fromMessage<T extends unknown>(
    result: Message<T>,
    presenter?: (data: any) => T
  ): Output<T> {
    switch (result.kind) {
      case "ok":
        return this.success(presenter ? presenter(result.data) : result.data);
      case "reject":
        return this.fail<T>(result.code, result.message, result.data as T);
      case "infra-error":
        this.report(result);

        return this.unhandledError<T>(result.data as T);
    }
  }

  static async fromUsecase<T>(
    usecase: Promise<Message<T>>
  ): Promise<Output<T>> {
    try {
      return this.fromMessage(await usecase);
    } catch (error: any) {
      this.report(error);
      return this.unhandledError<T>(error.data);
    }
  }

  static async from<T>(callback: () => Promise<T>): Promise<Output<T>> {
    try {
      return this.success(await callback());
    } catch (error: any) {
      this.report(error);
      return this.unhandledError<T>(error.data);
    }
  }

  private static unhandledError<T>(data?: T) {
    return this.fail(
      "INTERNAL_ERROR",
      "Something went wrong while processing your request. " +
        "Our team's been notified, but feel free to contact support if this keeps happening.",
      data as T
    );
  }

  private static report(error: Error | InfraError) {
    if (error) {
      const code = 'code' in error ? error.code : 'UNKNOWN_ERROR';
      const data = JSON.stringify('data' in error ? error.data : {});
      const message = [
        `USECASE ERR: ${error.message}`,
        `CODE: ${code}`,
        `DATA: ${data}`,
        `STACK: ${error instanceof Error ? this.formatErrorStack(error) : ""}`,
      ].join(" | ");

      logger.error(message);

      getHandlers("output.report").forEach((handler) =>
        rescue(() => handler(error))
      );
    }
  }

  private static formatErrorStack(error: Error): string {
    const trace = error.stack?.toString() || '';
    const lines = trace.split('\n');
    let errorMessage = '';
    const rows: Array<{ lineColumn: string; fileName: string; symbol: string }> = [];
  
    for (const line of lines) {
      // Skip lines containing "(node:" or "node_modules"
      if (line.includes('(node:') || line.includes('node_modules')) {
        continue;
      }
  
      // Remove "    at " at the beginning of the line
      const cleanedLine = line.replace(/^\s+at\s+/, '');
  
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
      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
  
      rows.push({
        lineColumn: `${lineNum}:${column}`,
        fileName: fileName,
        symbol: symbol
      });
    }
  
    // Create result
    const formattedRows: string[] = [];
  
    // Add first error message if exists
    if (errorMessage) {
      formattedRows.push(errorMessage);
    }
  
    if (rows.length === 0) {
      return formattedRows.join('\n');
    }
  
    // Calculate maximum width of each column
    const maxLineColumnWidth = Math.max(...rows.map(r => r.lineColumn.length));
    const maxFileNameWidth = Math.max(...rows.map(r => r.fileName.length));
    const maxSymbolWidth = Math.max(...rows.map(r => r.symbol.length));
  
    // Rows
    for (const row of rows) {
      const formattedRow = [
        row.lineColumn.padEnd(maxLineColumnWidth),
        row.fileName.padEnd(maxFileNameWidth),
        row.symbol.padEnd(maxSymbolWidth)
      ].join(' ');
      formattedRows.push(formattedRow);
    }
  
    return formattedRows.join('\n');
  }
}
