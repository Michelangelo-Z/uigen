"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  tool: {
    toolName: string;
    state: string;
    result?: unknown;
    args?: Record<string, unknown>;
  };
}

/**
 * Maps a tool invocation to a human-readable message describing what the tool is doing.
 * Examples:
 *  - "Creating /App.jsx"
 *  - "Editing /components/Card.jsx"
 *  - "Deleting /old.jsx"
 */
function getToolMessage(
  toolName: string,
  args?: Record<string, unknown>
): string {
  if (!args) {
    return toolName;
  }

  // Handle str_replace_editor tool
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;

    if (!path) {
      return toolName;
    }

    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
        return `Editing ${path}`;
      case "insert":
        return `Inserting into ${path}`;
      case "view":
        return `Viewing ${path}`;
      case "undo_edit":
        return `Undoing edit in ${path}`;
      default:
        return `Editing ${path}`;
    }
  }

  // Handle file_manager tool
  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;

    if (!path) {
      return toolName;
    }

    switch (command) {
      case "delete":
        return `Deleting ${path}`;
      case "rename":
        return `Renaming ${path}`;
      default:
        return `Managing ${path}`;
    }
  }

  // Fallback to raw tool name for unknown tools
  return toolName;
}

export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const message = getToolMessage(tool.toolName, tool.args);
  const isCompleted = tool.state === "result" && tool.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
