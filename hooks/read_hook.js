#!/usr/bin/env node

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  const readPath =
    toolArgs.tool_input?.file_path ||
    toolArgs.tool_input?.path ||
    "";

  if (readPath.includes(".env")) {
    console.error("Blocked: cannot read .env files. Use environment variables instead.");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Hook error:", err.message);
  process.exit(1);
});
