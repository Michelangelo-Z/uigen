import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor with create command shows 'Creating {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "create",
      path: "/App.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor with str_replace command shows 'Editing {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "str_replace",
      path: "/components/Card.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("str_replace_editor with insert command shows 'Inserting into {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "insert",
      path: "/utils/helpers.js",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Inserting into /utils/helpers.js")).toBeDefined();
});

test("str_replace_editor with view command shows 'Viewing {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "view",
      path: "/config.json",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Viewing /config.json")).toBeDefined();
});

test("str_replace_editor with undo_edit command shows 'Undoing edit in {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "undo_edit",
      path: "/components/Button.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Undoing edit in /components/Button.jsx")).toBeDefined();
});

test("str_replace_editor with unknown command defaults to 'Editing {path}'", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "unknown_command",
      path: "/app.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Editing /app.jsx")).toBeDefined();
});

test("file_manager with delete command shows 'Deleting {path}'", () => {
  const tool = {
    toolName: "file_manager",
    state: "call",
    args: {
      command: "delete",
      path: "/components/OldComponent.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Deleting /components/OldComponent.jsx")).toBeDefined();
});

test("file_manager with rename command shows 'Renaming {path}'", () => {
  const tool = {
    toolName: "file_manager",
    state: "call",
    args: {
      command: "rename",
      path: "/old.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("file_manager with unknown command defaults to 'Managing {path}'", () => {
  const tool = {
    toolName: "file_manager",
    state: "call",
    args: {
      command: "unknown",
      path: "/something.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("Managing /something.jsx")).toBeDefined();
});

test("unknown tool name falls back to raw tool name", () => {
  const tool = {
    toolName: "custom_unknown_tool",
    state: "call",
    args: {
      command: "do_something",
      path: "/file.jsx",
    },
  };

  render(<ToolInvocationBadge tool={tool} />);

  expect(screen.getByText("custom_unknown_tool")).toBeDefined();
});

test("state 'result' with result shows green dot and no spinner", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
    args: {
      command: "create",
      path: "/App.jsx",
    },
  };

  const { container } = render(<ToolInvocationBadge tool={tool} />);

  // Check for green dot
  const dot = container.querySelector(".bg-emerald-500");
  expect(dot).toBeDefined();

  // Check that spinner is not present in this badge
  const badge = container.querySelector(".inline-flex");
  const spinner = badge?.querySelector(".animate-spin");
  expect(spinner).toBeNull();

  // Check message is displayed
  expect(badge?.textContent).toContain("Creating /App.jsx");
});

test("state 'call' shows spinner and no green dot", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "create",
      path: "/App.jsx",
    },
  };

  const { container } = render(<ToolInvocationBadge tool={tool} />);

  // Check for spinner
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();

  // Check that green dot is not present
  const dot = container.querySelector(".bg-emerald-500");
  expect(dot).toBeNull();

  // Check message is displayed
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("handles missing args gracefully", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
  };

  render(<ToolInvocationBadge tool={tool} />);

  // Should fall back to tool name
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("handles missing path in args gracefully", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "create",
    },
  };

  const { container } = render(<ToolInvocationBadge tool={tool} />);

  // Should fall back to tool name
  expect(container.textContent).toContain("str_replace_editor");
});

test("handles state 'result' without result property shows spinner", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "create",
      path: "/App.jsx",
    },
  };

  const { container } = render(<ToolInvocationBadge tool={tool} />);

  // Should show spinner because result is undefined
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();

  // Check message is displayed
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("renders badge with correct styling classes", () => {
  const tool = {
    toolName: "str_replace_editor",
    state: "call",
    args: {
      command: "create",
      path: "/App.jsx",
    },
  };

  const { container } = render(<ToolInvocationBadge tool={tool} />);

  const badge = container.querySelector(".inline-flex");
  expect(badge?.className).toContain("items-center");
  expect(badge?.className).toContain("gap-2");
  expect(badge?.className).toContain("mt-2");
  expect(badge?.className).toContain("px-3");
  expect(badge?.className).toContain("py-1.5");
  expect(badge?.className).toContain("bg-neutral-50");
  expect(badge?.className).toContain("rounded-lg");
  expect(badge?.className).toContain("text-xs");
  expect(badge?.className).toContain("font-mono");
  expect(badge?.className).toContain("border");
  expect(badge?.className).toContain("border-neutral-200");
});
