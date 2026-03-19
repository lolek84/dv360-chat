export const GAS_URL = process.env.GAS_URL ||
  "https://script.google.com/macros/s/AKfycbzjySTZjBKuQl9lXEQ1-9IRbW8IGxhBESqYTJjEeBSPc9z2yBM5KQMU9qZeG7-BOT_w/exec";

export async function gasGet(params: Record<string, string | number | undefined>) {
  const url = new URL(GAS_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error(`GAS GET ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function gasPost(body: Record<string, unknown>) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`GAS POST ${res.status}: ${await res.text()}`);
  return res.json();
}

export const DV360_TOOLS = [
  { name: "dv360_list_advertisers", description: "Lista reklamodawców DV360.", input_schema: { type: "object", properties: { search_displayName: { type: "string" }, filter_entityStatus: { type: "string", enum: ["ENTITY_STATUS_ACTIVE","ENTITY_STATUS_INACTIVE"] }, filter_currencyCode: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_advertiser", description: "Pobierz reklamodawcę po ID.", input_schema: { type: "object", properties: { advertiserId: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_create_advertiser", description: "Utwórz nowego reklamodawcę.", input_schema: { type: "object", properties: { displayName: { type: "string" }, currencyCode: { type: "string" }, domainUrl: { type: "string" }, entityStatus: { type: "string" } }, required: ["displayName"] } },
  { name: "dv360_patch_advertiser", description: "Zaktualizuj reklamodawcę.", input_schema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, currencyCode: { type: "string" }, entityStatus: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_delete_advertiser", description: "Usuń reklamodawcę.", input_schema: { type: "object", properties: { advertiserId: { type: "string" } }, required: ["advertiserId"] } },
  { name: "dv360_list_campaigns", description: "Lista kampanii DV360.", input_schema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_campaignGoal: { type: "string" }, search_displayName: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_campaign", description: "Pobierz kampanię po ID.", input_schema: { type: "object", properties: { campaignId: { type: "string" }, advertiserId: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_create_campaign", description: "Utwórz kampanię.", input_schema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, campaignGoal: { type: "string" }, entityStatus: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["advertiserId","displayName"] } },
  { name: "dv360_patch_campaign", description: "Zaktualizuj kampanię.", input_schema: { type: "object", properties: { campaignId: { type: "string" }, displayName: { type: "string" }, entityStatus: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_delete_campaign", description: "Usuń kampanię.", input_schema: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] } },
  { name: "dv360_list_line_items", description: "Lista line items DV360.", input_schema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_campaignId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_lineItemType: { type: "string" }, by_insertionOrderId: { type: "string" }, search_displayName: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_line_item", description: "Pobierz line item po ID.", input_schema: { type: "object", properties: { lineItemId: { type: "string" }, advertiserId: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_create_line_item", description: "Utwórz line item.", input_schema: { type: "object", properties: { advertiserId: { type: "string" }, campaignId: { type: "string" }, insertionOrderId: { type: "string" }, displayName: { type: "string" }, lineItemType: { type: "string" }, entityStatus: { type: "string" }, budget: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["advertiserId","campaignId","displayName"] } },
  { name: "dv360_patch_line_item", description: "Zaktualizuj line item.", input_schema: { type: "object", properties: { lineItemId: { type: "string" }, displayName: { type: "string" }, entityStatus: { type: "string" }, budget: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_delete_line_item", description: "Usuń line item.", input_schema: { type: "object", properties: { lineItemId: { type: "string" } }, required: ["lineItemId"] } },
  { name: "dv360_list_creatives", description: "Lista kreacji DV360.", input_schema: { type: "object", properties: { filter_advertiserId: { type: "string" }, filter_entityStatus: { type: "string" }, filter_creativeType: { type: "string" }, search_displayName: { type: "string" }, search_dimensions: { type: "string" }, searchMode: { type: "string", enum: ["contains","prefix","exact"] }, pageSize: { type: "number" } } } },
  { name: "dv360_get_creative", description: "Pobierz kreację po ID.", input_schema: { type: "object", properties: { creativeId: { type: "string" }, advertiserId: { type: "string" } }, required: ["creativeId"] } },
  { name: "dv360_create_creative", description: "Utwórz kreację.", input_schema: { type: "object", properties: { advertiserId: { type: "string" }, displayName: { type: "string" }, creativeType: { type: "string" }, dimensions: { type: "string" }, entityStatus: { type: "string" } }, required: ["advertiserId","displayName"] } },
  { name: "dv360_patch_creative", description: "Zaktualizuj kreację.", input_schema: { type: "object", properties: { creativeId: { type: "string" }, displayName: { type: "string" }, creativeType: { type: "string" }, dimensions: { type: "string" }, entityStatus: { type: "string" } }, required: ["creativeId"] } },
  { name: "dv360_delete_creative", description: "Usuń kreację.", input_schema: { type: "object", properties: { creativeId: { type: "string" } }, required: ["creativeId"] } },
] as const;

type ToolInput = Record<string, string | number | undefined>;

export async function executeTool(name: string, input: ToolInput): Promise<unknown> {
  const p: Record<string, string | number | undefined> = {};

  switch (name) {
    case "dv360_list_advertisers":
    case "dv360_list_campaigns":
    case "dv360_list_line_items":
    case "dv360_list_creatives": {
      const resource = name.replace("dv360_list_", "").replace("line_items", "lineItems");
      p.resource = resource;
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
    case "dv360_get_campaign": return gasGet({ resource: "campaigns", id: input.campaignId, ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_get_line_item": return gasGet({ resource: "lineItems", id: input.lineItemId, ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_get_creative": return gasGet({ resource: "creatives", id: input.creativeId, ...(input.advertiserId ? { "filter[advertiserId]": input.advertiserId } : {}) });
    case "dv360_create_advertiser": return gasPost({ resource: "advertisers", action: "create", data: input });
    case "dv360_create_campaign": return gasPost({ resource: "campaigns", action: "create", data: input });
    case "dv360_create_line_item": return gasPost({ resource: "lineItems", action: "create", data: input });
    case "dv360_create_creative": return gasPost({ resource: "creatives", action: "create", data: input });
    case "dv360_patch_advertiser": { const { advertiserId, ...data } = input; return gasPost({ resource: "advertisers", action: "patch", id: advertiserId, data }); }
    case "dv360_patch_campaign": { const { campaignId, ...data } = input; return gasPost({ resource: "campaigns", action: "patch", id: campaignId, data }); }
    case "dv360_patch_line_item": { const { lineItemId, ...data } = input; return gasPost({ resource: "lineItems", action: "patch", id: lineItemId, data }); }
    case "dv360_patch_creative": { const { creativeId, ...data } = input; return gasPost({ resource: "creatives", action: "patch", id: creativeId, data }); }
    case "dv360_delete_advertiser": return gasPost({ resource: "advertisers", action: "delete", id: input.advertiserId });
    case "dv360_delete_campaign": return gasPost({ resource: "campaigns", action: "delete", id: input.campaignId });
    case "dv360_delete_line_item": return gasPost({ resource: "lineItems", action: "delete", id: input.lineItemId });
    case "dv360_delete_creative": return gasPost({ resource: "creatives", action: "delete", id: input.creativeId });
    default: throw new Error(`Unknown tool: ${name}`);
  }
}
