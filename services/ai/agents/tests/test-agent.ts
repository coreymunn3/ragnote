import { createAgent } from "../index";
import { ChatScopeObject } from "@/lib/types/chatTypes";
import { prisma } from "@/lib/prisma";
import { AiService } from "../../aiService";

async function testAgent() {
  try {
    // Initialize AiService to set up Settings (embeddings, etc.)
    new AiService();

    // TODO: Fill in your test data
    const userId = "d3c13a7b-5630-4e0f-afa5-ef7f560e65b4";
    const chatScope: ChatScopeObject = {
      scope: "note", // or "folder" or "global" when implemented
      scopeId: "09377767-1f1e-4e94-a470-33e88f2b067e", // note ID for note scope, folder ID for folder scope, null for global
      noteVersions: [
        {
          noteId: "09377767-1f1e-4e94-a470-33e88f2b067e",
          versionId: "0ab6d2fa-eb51-4186-89da-0e4b7d22bee1",
        },
      ],
    };

    // Create and test the agent
    const agent = await createAgent("noteChat", userId, chatScope);
    console.log("✅ Agent created successfully");

    const query = "whats in my diet plan?";
    console.log(`💬 Testing query: "${query}"`);

    const response = await agent.run(query);

    console.log("🤖 Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAgent();
