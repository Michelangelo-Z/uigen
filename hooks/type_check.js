#!/usr/bin/env node
/**
 * Post-tool-use hook: runs tsc after every TypeScript file edit and feeds
 * type errors back to Claude so it fixes call sites immediately.
 */
const { execSync } = require("child_process");

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  const filePath =
    toolArgs.tool_input?.file_path ||
    toolArgs.tool_input?.path ||
    "";

  if (!filePath.match(/\.(ts|tsx)$/)) {
    return;
  }

  try {
    execSync("npx tsc --noEmit 2>&1", {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    const output = err.stdout || err.stderr || err.message || "";
    if (output.trim()) {
      console.error("TypeScript errors found — please fix them:\n" + output);
      process.exit(2);
    }
  }
}

main().catch((err) => {
  console.error("Type check hook error:", err.message);
});
