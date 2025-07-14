/**
 * Utility class for extracting plain text from BlockNote JSON content
 * This is used to generate plain_text_content for chunking and embedding
 */
export class NoteTextExtractor {
  /**
   * Extract plain text from BlockNote JSON content
   * @param blockNoteContent - The BlockNote JSON content array
   * @returns Plain text string suitable for chunking and embedding
   */
  static extractPlainText(blockNoteContent: any): string {
    if (!blockNoteContent || !Array.isArray(blockNoteContent)) {
      return "";
    }

    let plainText = "";

    for (const block of blockNoteContent) {
      if (!block) {
        continue;
      }

      // Handle table blocks
      if (block.type === "table") {
        const tableText = this.extractTableContent(block);
        if (tableText.trim()) {
          plainText += tableText.trim() + "\n";
        }
        continue;
      }

      // Handle regular blocks with content array
      if (!block.content || !Array.isArray(block.content)) {
        continue;
      }

      // Extract text from each content item in the block
      let blockText = "";
      for (const contentItem of block.content) {
        if (contentItem.type === "text" && contentItem.text) {
          blockText += contentItem.text;
        }
      }

      // Add block text with appropriate spacing
      if (blockText.trim()) {
        plainText += blockText.trim() + "\n";
      }
    }

    return plainText.trim();
  }

  /**
   * Extract text content from a table block in a structured format
   * @param tableBlock - The table block from BlockNote JSON
   * @returns Formatted table text for embeddings
   */
  private static extractTableContent(tableBlock: any): string {
    if (!tableBlock?.content?.rows || !Array.isArray(tableBlock.content.rows)) {
      return "";
    }

    const rows = tableBlock.content.rows;
    if (rows.length === 0) {
      return "";
    }

    // Extract headers from the first row
    const headerRow = rows[0];
    const headers = this.extractRowCellTexts(headerRow);

    if (headers.length === 0) {
      return "";
    }

    let tableText = "Data Table\n";
    tableText += `Headers: ${headers.join(", ")}\n`;

    // Process data rows (skip the first row which contains headers)
    for (let i = 1; i < rows.length; i++) {
      const dataRow = rows[i];
      const cellTexts = this.extractRowCellTexts(dataRow);

      if (cellTexts.length > 0) {
        const rowPairs = [];
        for (let j = 0; j < Math.min(headers.length, cellTexts.length); j++) {
          if (cellTexts[j].trim()) {
            rowPairs.push(`${headers[j]}: ${cellTexts[j].trim()}`);
          }
        }

        if (rowPairs.length > 0) {
          tableText += `- ${rowPairs.join(", ")}\n`;
        }
      }
    }

    return tableText;
  }

  /**
   * Extract text content from all cells in a table row
   * @param row - A table row object containing cells
   * @returns Array of text content from each cell
   */
  private static extractRowCellTexts(row: any): string[] {
    if (!row?.cells || !Array.isArray(row.cells)) {
      return [];
    }

    const cellTexts: string[] = [];

    for (const cell of row.cells) {
      if (
        cell?.type === "tableCell" &&
        cell.content &&
        Array.isArray(cell.content)
      ) {
        let cellText = "";

        // Extract text from all content items in the cell
        for (const contentItem of cell.content) {
          if (contentItem.type === "text" && contentItem.text) {
            cellText += contentItem.text;
          }
        }

        cellTexts.push(cellText);
      } else {
        cellTexts.push(""); // Empty cell
      }
    }

    return cellTexts;
  }
}
