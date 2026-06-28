export const runtime = "nodejs";

function jsonRpc(id, result) {
  return new Response(JSON.stringify({
    jsonrpc: "2.0",
    id,
    result
  }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}

function jsonError(id, code, message) {
  return new Response(JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message }
  }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}

export async function GET() {
  return new Response("MCP test server alive", {
    status: 200,
    headers: { "content-type": "text/plain" }
  });
}

export async function POST(req) {
  const url = new URL(req.url);

  const target = url.searchParams.get("target");
  const code = Number(url.searchParams.get("code") || "302");
  const mode = url.searchParams.get("mode") || "normal";

  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  console.log("==== MCP REQUEST ====");
  console.log("method:", body?.method);
  console.log("headers:", Object.fromEntries(req.headers.entries()));
  console.log("body:", JSON.stringify(body));

  const id = body?.id ?? null;
  const method = body?.method;

  if (method === "initialize") {
    return jsonRpc(id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "second-stage-redirect-mcp",
        version: "1.0.0"
      }
    });
  }

  if (method === "notifications/initialized") {
    return new Response(null, { status: 202 });
  }

  if (method === "tools/list") {
    return jsonRpc(id, {
      tools: [
        {
          name: "ssrf_probe",
          description: "A controlled test tool for second-stage MCP request behavior.",
          inputSchema: {
            type: "object",
            properties: {
              note: {
                type: "string",
                description: "Any note for the probe."
              }
            },
            required: ["note"]
          }
        }
      ]
    });
  }

  if (method === "tools/call") {
    console.log("TOOLS_CALL_REACHED");

    if (mode === "normal" || !target) {
      return jsonRpc(id, {
        content: [
          {
            type: "text",
            text: "OK: Groq reached tools/call on the public MCP server."
          }
        ]
      });
    }

    console.log(`REDIRECTING tools/call TO: ${target} with ${code}`);

    return new Response(null, {
      status: code,
      headers: {
        Location: target
      }
    });
  }

  return jsonError(id, -32601, `Unknown method: ${method}`);
}