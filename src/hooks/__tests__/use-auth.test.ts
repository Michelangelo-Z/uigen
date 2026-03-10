import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock server-only module to prevent "use server" errors
vi.mock("server-only", () => ({}));

// Mock dependencies BEFORE importing the hook
vi.mock("next/navigation");
vi.mock("@/lib/anon-work-tracker");

// Mock individual action modules
vi.mock("@/actions/index", () => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import * as anonWorkTracker from "@/lib/anon-work-tracker";

const mockRouter = {
  push: vi.fn(),
};

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue(mockRouter as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ===== SIGN IN TESTS =====

test("signIn returns success result on successful authentication", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "new-project-1",
    name: "New Project",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  let signInResult;
  await act(async () => {
    signInResult = await result.current.signIn("user@example.com", "password123");
  });

  expect(signInResult).toEqual({ success: true });
});

test("signIn returns error result on authentication failure", async () => {
  const errorMessage = "Invalid credentials";
  vi.mocked(signInAction).mockResolvedValue({
    success: false,
    error: errorMessage,
  });

  const { result } = renderHook(() => useAuth());

  let signInResult;
  await act(async () => {
    signInResult = await result.current.signIn(
      "user@example.com",
      "wrongpassword"
    );
  });

  expect(signInResult).toEqual({ success: false, error: errorMessage });
  expect(mockRouter.push).not.toHaveBeenCalled();
});

test("signIn creates project from anonymous work and redirects", async () => {
  const anonWork = {
    messages: [{ role: "user", content: "create a button" }],
    fileSystemData: { "/App.jsx": "export default () => <button>Click</button>" },
  };

  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWork);
  vi.mocked(createProject).mockResolvedValue({
    id: "new-project-id",
    name: "Design from...",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(vi.mocked(createProject)).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: anonWork.messages,
      data: anonWork.fileSystemData,
    })
  );
  expect(vi.mocked(anonWorkTracker.clearAnonWork)).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/new-project-id");
});

test("signIn redirects to most recent project when no anonymous work", async () => {
  const projects = [
    {
      id: "project-1",
      name: "Project 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "project-2",
      name: "Project 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue(projects as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(vi.mocked(getProjects)).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/project-1");
  expect(vi.mocked(createProject)).not.toHaveBeenCalled();
});

test("signIn creates new project when user has no existing projects", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "brand-new-project",
    name: "New Design #12345",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(vi.mocked(getProjects)).toHaveBeenCalled();
  expect(vi.mocked(createProject)).toHaveBeenCalledWith(
    expect.objectContaining({
      name: expect.stringMatching(/^New Design #\d+$/),
      messages: [],
      data: {},
    })
  );
  expect(mockRouter.push).toHaveBeenCalledWith("/brand-new-project");
});


test("signIn sets isLoading to false after completion", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "project-1",
    name: "New Design",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(result.current.isLoading).toBe(false);
});

test("signIn sets isLoading to false even on error", async () => {
  vi.mocked(signInAction).mockResolvedValue({
    success: false,
    error: "Invalid credentials",
  });

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "wrongpassword");
  });

  expect(result.current.isLoading).toBe(false);
});

// ===== SIGN UP TESTS =====

test("signUp returns success result on successful registration", async () => {
  vi.mocked(signUpAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "new-project-1",
    name: "New Design",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  let signUpResult;
  await act(async () => {
    signUpResult = await result.current.signUp("newuser@example.com", "password123");
  });

  expect(signUpResult).toEqual({ success: true });
});

test("signUp returns error result on registration failure", async () => {
  const errorMessage = "Email already registered";
  vi.mocked(signUpAction).mockResolvedValue({
    success: false,
    error: errorMessage,
  });

  const { result } = renderHook(() => useAuth());

  let signUpResult;
  await act(async () => {
    signUpResult = await result.current.signUp(
      "existing@example.com",
      "password123"
    );
  });

  expect(signUpResult).toEqual({ success: false, error: errorMessage });
  expect(mockRouter.push).not.toHaveBeenCalled();
});

test("signUp creates project from anonymous work and redirects", async () => {
  const anonWork = {
    messages: [{ role: "user", content: "create a form" }],
    fileSystemData: { "/App.jsx": "export default () => <form></form>" },
  };

  vi.mocked(signUpAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWork);
  vi.mocked(createProject).mockResolvedValue({
    id: "signup-project-id",
    name: "Design from...",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signUp("newuser@example.com", "password123");
  });

  expect(vi.mocked(createProject)).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: anonWork.messages,
      data: anonWork.fileSystemData,
    })
  );
  expect(vi.mocked(anonWorkTracker.clearAnonWork)).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/signup-project-id");
});

test("signUp redirects to most recent project when no anonymous work", async () => {
  const projects = [
    {
      id: "existing-project",
      name: "Existing",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  vi.mocked(signUpAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue(projects as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signUp("newuser@example.com", "password123");
  });

  expect(vi.mocked(getProjects)).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/existing-project");
});

test("signUp creates new project when no existing projects", async () => {
  vi.mocked(signUpAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "new-signup-project",
    name: "New Design",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signUp("newuser@example.com", "password123");
  });

  expect(vi.mocked(getProjects)).toHaveBeenCalled();
  expect(vi.mocked(createProject)).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith("/new-signup-project");
});


test("signUp sets isLoading to false after completion", async () => {
  vi.mocked(signUpAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "project-1",
    name: "New Design",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signUp("newuser@example.com", "password123");
  });

  expect(result.current.isLoading).toBe(false);
});

test("signUp sets isLoading to false even on error", async () => {
  vi.mocked(signUpAction).mockResolvedValue({
    success: false,
    error: "Password too short",
  });

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signUp("newuser@example.com", "short");
  });

  expect(result.current.isLoading).toBe(false);
});

// ===== EDGE CASES =====

test("anonymous work with empty messages falls back to creating new project", async () => {
  const anonWork = {
    messages: [],
    fileSystemData: { "/App.jsx": "export default () => <div>App</div>" },
  };

  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWork);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "project-id",
    name: "New Design #12345",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  // When messages are empty, the hook should create a new project instead of using anonWork
  expect(vi.mocked(createProject)).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: [],
      data: {},
    })
  );
});

test("anonymous work with only messages creates project", async () => {
  const anonWork = {
    messages: [{ role: "user", content: "create button" }],
    fileSystemData: {},
  };

  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWork);
  vi.mocked(createProject).mockResolvedValue({
    id: "project-id",
    name: "Design from...",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(vi.mocked(createProject)).toHaveBeenCalled();
});

test("multiple projects returns first one (most recent)", async () => {
  const projects = [
    {
      id: "first",
      name: "First Project",
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
    },
    {
      id: "second",
      name: "Second Project",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
    {
      id: "third",
      name: "Third Project",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue(projects as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(mockRouter.push).toHaveBeenCalledWith("/first");
});

test("handles error during getProjects call", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockRejectedValue(new Error("Database error"));

  const { result } = renderHook(() => useAuth());

  await expect(async () => {
    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });
  }).rejects.toThrow("Database error");
});

test("handles error during createProject call", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockRejectedValue(new Error("Database error"));

  const { result } = renderHook(() => useAuth());

  await expect(async () => {
    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });
  }).rejects.toThrow("Database error");
});

test("random project name in new project creation has valid format", async () => {
  vi.mocked(signInAction).mockResolvedValue({ success: true });
  vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({
    id: "new-project",
    name: "New Design #50000",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    messages: "[]",
    data: "{}",
  } as any);

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  const callArg = vi.mocked(createProject).mock.calls[0][0];
  expect(callArg.name).toMatch(/^New Design #\d+$/);
  const numberPart = parseInt(callArg.name.split("#")[1], 10);
  expect(numberPart).toBeGreaterThanOrEqual(0);
  expect(numberPart).toBeLessThan(100000);
});

// ===== RETURN VALUE TESTS =====

test("returns object with signIn, signUp, and isLoading", () => {
  const { result } = renderHook(() => useAuth());

  expect(result.current).toHaveProperty("signIn");
  expect(result.current).toHaveProperty("signUp");
  expect(result.current).toHaveProperty("isLoading");
  expect(typeof result.current.signIn).toBe("function");
  expect(typeof result.current.signUp).toBe("function");
  expect(typeof result.current.isLoading).toBe("boolean");
});

test("isLoading is false on initial render", () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isLoading).toBe(false);
});
