#!/usr/bin/env node
/**
 * Post-tool-use hook: detects duplicate server actions in src/actions/.
 * When Claude writes to an actions file, checks if a similar exported
 * function already exists in another file in that directory.
 */
const { readFileSync, readdirSync } = require("fs");
const { join, dirname, basename } = require("path");

function getExports(source) {
  const matches = source.match(/export\s+(?:async\s+)?function\s+(\w+)/g) || [];
  return matches.map((m) => m.replace(/export\s+(?:async\s+)?function\s+/, ""));
}

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

  if (!filePath.includes("src/actions/") || !filePath.match(/\.(ts|tsx|js)$/)) {
    return;
  }

  let modifiedSource;
  try {
    modifiedSource = readFileSync(filePath, "utf-8");
  } catch {
    return;
  }

  const newExports = getExports(modifiedSource);
  if (newExports.length === 0) return;

  const actionsDir = dirname(filePath);
  const currentFile = basename(filePath);
  const duplicates = [];

  try {
    const files = readdirSync(actionsDir).filter(
      (f) => f !== currentFile && f.match(/\.(ts|tsx|js)$/)
    );

    for (const file of files) {
      const source = readFileSync(join(actionsDir, file), "utf-8");
      const existingExports = getExports(source);

      for (const name of newExports) {
        if (existingExports.includes(name)) {
          duplicates.push(`"${name}" already exists in ${file}`);
        }
      }
    }
  } catch {
    return;
  }

  if (duplicates.length > 0) {
    console.error(
      `Duplicate actions detected — reuse existing functions instead:\n` +
        duplicates.map((d) => `  • ${d}`).join("\n")
    );
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Duplicate check hook error:", err.message);
});
