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
      if (!block || !block.content || !Array.isArray(block.content)) {
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
}
