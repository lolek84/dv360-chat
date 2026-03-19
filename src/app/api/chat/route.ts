import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DV360_TOOLS, executeTool } from "@/lib/tools";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a DV360 campaign management assistant with access to a mock Display & Video 360 API.

You help users manage their advertising campaigns by:
- Listing and searching advertisers, campaigns, line items, and creatives
- Creating new entities
- Updating existing entities (patch)
- Deleting entities

Always respond in the same language the user writes in (Polish or English).
When listing results, format them clearly. For tables of data, use markdown tables.
When an action is completed (create/patch/delete), confirm what was done.
If a user asks something vague like "show campaigns", ask which advertiser or show all.

Available resources: advertisers, campaigns, lineItems, creatives.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const anthropicMessages = [...messages];
    let iterations = 0;
    const MAX_ITER = 10;

    while (iterations < MAX_ITER) {
      iterations++;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: DV360_TOOLS as unknown as Anthropic.Tool[],
        messages: anthropicMessages,
      });

      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find((b) => b.type === "text");
        return NextResponse.json({
          role: "assistant",
          content: textBlock?.type === "text" ? textBlock.text : "",
        });
      }

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          if (block.type !== "tool_use") continue;
          try {
            const result = await executeTool(
              block.name,
              block.input as Record<string, string | number | undefined>
            );
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          } catch (err) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: `Error: ${err instanceof Error ? err.message : String(err)}`,
              is_error: true,
            });
          }
        }

        anthropicMessages.push({ role: "assistant", content: response.content });
        anthropicMessages.push({ role: "user", content: toolResults });
        continue;
      }

      break;
    }

    return NextResponse.json({ error: "Max iterations reached" }, { status: 500 });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
