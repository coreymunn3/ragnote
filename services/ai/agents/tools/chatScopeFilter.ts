import { ChatScopeObject } from "@/lib/types/chatTypes";
import { MetadataFilters } from "llamaindex";

export class ChatScopeFilter {
  private userId: string;
  private chatScope: ChatScopeObject;

  constructor(userId: string, chatScope: ChatScopeObject) {
    this.userId = userId;
    this.chatScope = chatScope;
  }

  public async buildFilters(): Promise<MetadataFilters | undefined> {
    if (this.chatScope.scope === "note") {
      const versionIds = this.chatScope.noteVersions.map(
        (version) => version.versionId
      );

      return {
        filters: [
          {
            key: "note_version_id",
            operator: "in",
            value: versionIds,
          },
        ],
      };
    }
    // TO DO
    // else if (this.chatScope.scope === "folder") {
    // Get most recent published versions for notes in this folder
    // const validVersionIds = await this.getMostRecentPublishedVersionIds(
    //   this.userId,
    //   this.chatScope.scopeId
    // );
    // return {
    //   filters: {
    //     metadata: {
    //       note_version_id: { $in: validVersionIds },
    //       folder_id: this.chatScope.scopeId
    //     }
    //   }
    // };
    // }

    // TO DO
    // else if (this.chatScope.scope === 'global') {
    //   // Get most recent published versions for all user's notes
    //   const validVersionIds = await this.getMostRecentPublishedVersionIds(userId);

    //   return {
    //     filters: {
    //       metadata: {
    //         note_version_id: { $in: validVersionIds }
    //       }
    //     }
    //   };
    // }
  }
}
