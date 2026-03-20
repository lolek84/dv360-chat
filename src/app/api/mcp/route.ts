import { NextRequest } from "next/server";
import { gasGet, gasPost } from "@/lib/tools";

const TOOLS = [
  { name: "dv360_list_advertisers", description: "Lista reklamodawców DV360 z filtrowaniem i wyszukiwaniem.", inputSchema: { type: "object", properties: { search_displayName: { type: "string" }, filter_entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_INACTIVE"] }, filter_currencyCode: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_advertiser", description: "Pobierz reklamodawcę po ID.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_create_advertiser", description: "Utwórz nowego reklamodawcę.", inputSchema: { type: "object", properties: { displayName: { type: "string" }, currencyCode: { type: "string" }, domainUrl: { type: "string" }, entityStatus: { type: "string" } }, required: ["displayName"] } },
  { name: "dv360_patch_advertiser", description: "Zaktualizuj reklamodawcę.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, currencyCode: { type: "string" }, entityStatus: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_delete_advertiser", description: "Usuń reklamodawcę.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_list_campaigns", description: "Lista kampanii DV360 z filtrowaniem.", inputSchema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_campaignGoal: { type: "string" }, search_displayName: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_campaign", description: "Pobierz kampanię po ID.", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, advertiserId: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_create_campaign", description: "Utwórz kampanię.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, campaignGoal: { type: "string" }, entityStatus: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["advertiserId","displayName"] } },
  { name: "dv360_patch_campaign", description: "Zaktualizuj kampanię.", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, displayName: { type: "string" }, entityStatus: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_delete_campaign", description: "Usuń kampanię.", inputSchema: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_list_line_items", description: "Lista line items DV360 z filtrowaniem.", inputSchema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_campaignId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_lineItemType: { type: "string" }, by_insertionOrderId: { type: "string" }, search_displayName: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_line_item", description: "Pobierz line item po ID.", inputSchema: { type: "object", properties: { lineItemId: { type: "string" }, advertiserId: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_create_line_item", description: "Utwórz line item.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" }, campaignId: { type: "string" }, insertionOrderId: { type: "string" }, displayName: { type: "string" }, lineItemType: { type: "string" }, entityStatus: { type: "string" }, budget: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["advertiserId","campaignId","displayName"] } },
  { name: "dv360_patch_line_item", description: "Zaktualizuj line item.", inputSchema: { type: "object", properties: { lineItemId: { type: "string" }, displayName: { type: "string" }, entityStatus: { type: "string" }, budget: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_delete_line_item", description: "Usuń line item.", inputSchema: { type: "object", properties: { lineItemId: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_list_creatives", description: "Lista kreacji DV360 z filtrowaniem.", inputSchema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_creativeType: { type: "string" }, search_displayName: { type: "string" }, search_dimensions: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_creative", description: "Pobierz kreację po ID.", inputSchema: { type: "object", properties: { creativeId: { type: "string" }, advertiserId: { type: "string" } }, required: ["creativeId"] } },
  { name: "dv360_create_creative", description: "Utwórz kreację.", inputSchema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, creativeType: { type: "string" }, dimensions: { type: "string" }, entityStatus: { type: "string" } }, required: ["advertiserId","displayName"] } },
  { name: "dv360_patch_creative", description: "Zaktualizuj kreację.", inputSchema: { type: "object", properties: { creativeId: { type: "string" }, displayName: { type: "string" }, creativeType: { type: "string" }, dimensions: { type: "string" }, entityStatus: { type: "string" } }, required: ["creativeId"] } },
  { name: "dv360_delete_creative", description: "Usuń kreację.", inputSchema: { type: "object", properties: { creativeId: { type: "string" } }, required: ["creativeId"] } },
];

type ToolInput = Record<string, string | number | undefined>;

async function executeTool(name: string, input: ToolInput): Promise<unknown> {
  switch (name) {
    case "dv360_list_advertisers":
    case "dv360_list_campaigns":
    case "dv360_list_line_items":
    case "dv360_list_creatives": {
      const resource = name.replace("dv360_list_", "").replace("line_items", "lineItems");
      const p: Record<string, string | number | undefined> = { resource };
      for (const [k, v] of Object.entries(input)) {
        if (!v) continue;
        if (k.startsWith("filter_")) p[`filter[${k.slice(7)}]`] = v;
        else if (k.startsWith("search_")) p[`search[${k.slice(7)}]`] = v;
        else if (k.startsWith("by_")) p[`by[${k.slice(3)}]`] = v;
        else p[k] = v;
      }
      return gasGet(p);
    }
    case "dv360_get_advertiser": return gasGet({ resource: "advertisers", id: input.advertiserId });
    case "dv360_get_campaign":   return gasGet({ resource: "campaigns",   id: input.campaignId,  ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_get_line_item":  return gasGet({ resource: "lineItems",   id: input.lineItemId,  ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_get_creative":   return gasGet({ resource: "creatives",   id: input.creativeId,  ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_create_advertiser": return gasPost({ resource: "advertisers", action: "create", data: input });
    case "dv360_create_campaign":   return gasPost({ resource: "campaigns",   action: "create", data: input });
    case "dv360_create_line_item":  return gasPost({ resource: "lineItems",   action: "create", data: input });
    case "dv360_create_creative":   return gasPost({ resource: "creatives",   action: "create", data: input });
    case "dv360_patch_advertiser": { const { advertiserId, ...data } = input; return gasPost({ resource: "advertisers", action: "patch", id: advertiserId, data }); }
    case "dv360_patch_campaign":   { const { campaignId,   ...data } = input; return gasPost({ resource: "campaigns",   action: "patch", id: campaignId,   data }); }
    case "dv360_patch_line_item":  { const { lineItemId,   ...data } = input; return gasPost({ resource: "lineItems",   action: "patch", id: lineItemId,   data }); }
    case "dv360_patch_creative":   { const { creativeId,   ...data } = input; return gasPost({ resource: "creatives",   action: "patch", id: creativeId,   data }); }
    case "dv360_delete_advertiser": return gasPost({ resource: "advertisers", action: "delete", id: input.advertiserId });
    case "dv360_delete_campaign":   return gasPost({ resource: "campaigns",   action: "delete", id: input.campaignId });
    case "dv360_delete_line_item":  return gasPost({ resource: "lineItems",   action: "delete", id: input.lineItemId });
    case "dv360_delete_creative":   return gasPost({ resource: "creatives",   action: "delete", id: input.creativeId });
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

function mcpResponse(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

async function handleMessage(msg: Record<string, unknown>) {
  const { method, params, id } = msg as { method: string; params?: Record<string, unknown>; id?: unknown };
  switch (method) {
    case "initialize":
      return mcpResponse(id, {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "dv360-mock", version: "1.0.0" },
      });
    case "tools/list":
      return mcpResponse(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = params as { name: string; arguments: ToolInput };
      try {
        const result = await executeTool(name, args || {});
        return mcpResponse(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
      } catch (err) {
        return mcpResponse(id, { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true });
      }
    }
    case "notifications/initialized":
    case "ping":
      return null;
    default:
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

// Streamable HTTP — obsługuje zarówno pojedyncze requesty jak i SSE streaming
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accept = req.headers.get("accept") || "";

    const response = await handleMessage(body);

    // Jeśli klient akceptuje SSE — odpowiedz streamem
    if (accept.includes("text/event-stream")) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          if (response) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
          }
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
        },
      });
    }

    // Standardowa odpowiedź JSON
    return new Response(response ? JSON.stringify(response) : "", {
      status: response ? 200 : 204,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET — SSE endpoint dla starszych klientów
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${proto}://${host}`;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "endpoint", endpoint: `${baseUrl}/api/mcp` })}\n\n`)
      );
      const keepAlive = setInterval(() => {
        try { controller.enqueue(encoder.encode(": keepalive\n\n")); } catch { clearInterval(keepAlive); }
      }, 15000);
      req.signal.addEventListener("abort", () => { clearInterval(keepAlive); controller.close(); });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
    },
  });
}
