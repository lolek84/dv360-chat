import { NextRequest } from "next/server";
import { gasGet, gasPost } from "@/lib/tools";

type ToolInput = Record<string, string | number | undefined>;

const TOOLS = [
  {
    name: "dv360_advertisers",
    description: "Zarządzaj reklamodawcami DV360. Akcje: list, get, create, patch, delete.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list","get","create","patch","delete"], description: "Akcja do wykonania" },
        advertiserId: { type: "string", description: "ID reklamodawcy (wymagane dla get/patch/delete)" },
        displayName: { type: "string", description: "Nazwa reklamodawcy" },
        currencyCode: { type: "string", description: "Waluta: PLN, EUR, USD" },
        domainUrl: { type: "string", description: "Domena reklamodawcy" },
        entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_INACTIVE"] },
        search_displayName: { type: "string", description: "Wyszukaj po nazwie (dla list)" },
        filter_entityStatus: { type: "string", description: "Filtruj po statusie (dla list)" },
        searchMode: { type: "string", enum: ["contains","prefix","exact"] },
        pageSize: { type: "number" },
      },
      required: ["action"],
    },
  },
  {
    name: "dv360_campaigns",
    description: "Zarządzaj kampaniami DV360. Akcje: list, get, create, patch, delete.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list","get","create","patch","delete"] },
        campaignId: { type: "string", description: "ID kampanii (wymagane dla get/patch/delete)" },
        advertiserId: { type: "string", description: "ID reklamodawcy" },
        displayName: { type: "string" },
        campaignGoal: { type: "string", description: "CAMPAIGN_GOAL_BRAND_AWARENESS lub CAMPAIGN_GOAL_DRIVE_CONVERSIONS" },
        entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_PAUSED","ENTITY_STATUS_INACTIVE"] },
        startDate: { type: "string", description: "YYYY-MM-DD" },
        endDate: { type: "string", description: "YYYY-MM-DD" },
        search_displayName: { type: "string" },
        filter_advertiserId: { type: "string" },
        filter_entityStatus: { type: "string" },
        searchMode: { type: "string", enum: ["contains","prefix","exact"] },
        pageSize: { type: "number" },
      },
      required: ["action"],
    },
  },
  {
    name: "dv360_line_items",
    description: "Zarządzaj line items DV360. Akcje: list, get, create, patch, delete.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list","get","create","patch","delete"] },
        lineItemId: { type: "string", description: "ID line item (wymagane dla get/patch/delete)" },
        advertiserId: { type: "string" },
        campaignId: { type: "string" },
        insertionOrderId: { type: "string" },
        displayName: { type: "string" },
        lineItemType: { type: "string", description: "LINE_ITEM_TYPE_DISPLAY_DEFAULT lub LINE_ITEM_TYPE_VIDEO_DEFAULT" },
        entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_PAUSED","ENTITY_STATUS_INACTIVE"] },
        budget: { type: "string" },
        startDate: { type: "string" },
        endDate: { type: "string" },
        search_displayName: { type: "string" },
        filter_advertiserId: { type: "string" },
        filter_campaignId: { type: "string" },
        filter_entityStatus: { type: "string" },
        filter_lineItemType: { type: "string" },
        by_insertionOrderId: { type: "string" },
        searchMode: { type: "string", enum: ["contains","prefix","exact"] },
        pageSize: { type: "number" },
      },
      required: ["action"],
    },
  },
  {
    name: "dv360_creatives",
    description: "Zarządzaj kreacjami DV360. Akcje: list, get, create, patch, delete.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list","get","create","patch","delete"] },
        creativeId: { type: "string", description: "ID kreacji (wymagane dla get/patch/delete)" },
        advertiserId: { type: "string" },
        displayName: { type: "string" },
        creativeType: { type: "string", description: "CREATIVE_TYPE_STANDARD, CREATIVE_TYPE_VIDEO, CREATIVE_TYPE_RICH_MEDIA" },
        dimensions: { type: "string", description: "np. 300x250, 728x90" },
        entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_INACTIVE"] },
        search_displayName: { type: "string" },
        search_dimensions: { type: "string" },
        filter_advertiserId: { type: "string" },
        filter_entityStatus: { type: "string" },
        filter_creativeType: { type: "string" },
        searchMode: { type: "string", enum: ["contains","prefix","exact"] },
        pageSize: { type: "number" },
      },
      required: ["action"],
    },
  },
];

async function executeTool(name: string, input: ToolInput): Promise<unknown> {
  const { action, ...rest } = input as { action: string } & ToolInput;

  const resourceMap: Record<string, string> = {
    dv360_advertisers: "advertisers",
    dv360_campaigns:   "campaigns",
    dv360_line_items:  "lineItems",
    dv360_creatives:   "creatives",
  };
  const resource = resourceMap[name];

  const idMap: Record<string, string> = {
    dv360_advertisers: "advertiserId",
    dv360_campaigns:   "campaignId",
    dv360_line_items:  "lineItemId",
    dv360_creatives:   "creativeId",
  };
  const idKey = idMap[name];

  switch (action) {
    case "list": {
      const p: Record<string, string | number | undefined> = { resource };
      for (const [k, v] of Object.entries(rest)) {
        if (!v) continue;
        if (k.startsWith("filter_")) p[`filter[${k.slice(7)}]`] = v;
        else if (k.startsWith("search_")) p[`search[${k.slice(7)}]`] = v;
        else if (k.startsWith("by_")) p[`by[${k.slice(3)}]`] = v;
        else if (k === "searchMode" || k === "pageSize") p[k] = v;
      }
      return gasGet(p);
    }
    case "get": {
      const id = rest[idKey];
      const p: Record<string, string | number | undefined> = { resource, id };
      if (rest.advertiserId && idKey !== "advertiserId") p["filter[advertiserId]"] = rest.advertiserId;
      return gasGet(p);
    }
    case "create":
      return gasPost({ resource, action: "create", data: rest });
    case "patch": {
      const id = rest[idKey];
      const { [idKey]: _, ...data } = rest;
      return gasPost({ resource, action: "patch", id, data });
    }
    case "delete":
      return gasPost({ resource, action: "delete", id: rest[idKey] });
    default:
      throw new Error(`Unknown action: ${action}`);
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
        serverInfo: { name: "dv360-mock", version: "2.0.0" },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accept = req.headers.get("accept") || "";
    const response = await handleMessage(body);

    if (accept.includes("text/event-stream")) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          if (response) controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id" },
      });
    }

    return new Response(response ? JSON.stringify(response) : "", {
      status: response ? 200 : 204,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id" },
    });
  } catch {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${proto}://${host}`;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "endpoint", endpoint: `${baseUrl}/api/mcp` })}\n\n`));
      const keepAlive = setInterval(() => {
        try { controller.enqueue(encoder.encode(": keepalive\n\n")); } catch { clearInterval(keepAlive); }
      }, 15000);
      req.signal.addEventListener("abort", () => { clearInterval(keepAlive); controller.close(); });
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "Access-Control-Allow-Origin": "*" },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id" },
  });
}
