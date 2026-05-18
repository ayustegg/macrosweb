import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSignUp = vi.hoisted(() => vi.fn());
const mockSignInWithPassword = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockResetPasswordForEmail = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());
const mockGetUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map([["origin", "http://localhost:3000"]])),
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    get: vi.fn(),
  })),
}));

import {
  signup,
  login,
  requestReset,
  confirmReset,
  logout,
} from "@/features/auth/actions";

const makeFormData = (values: Record<string, string>) => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signup", () => {
  it("signs up a user successfully", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    const result = await signup(
      makeFormData({
        email: "test@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      })
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("test@example.com");
    }
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password1",
    });
  });

  it("returns field errors on password mismatch", async () => {
    const result = await signup(
      makeFormData({
        email: "test@example.com",
        password: "Password1",
        confirmPassword: "Password2",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.confirmPassword).toContain("no coinciden");
    }
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns error on invalid email", async () => {
    const result = await signup(
      makeFormData({
        email: "not-an-email",
        password: "Password1",
        confirmPassword: "Password1",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
    }
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns error when supabase fails", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "Email already registered" },
    });

    const result = await signup(
      makeFormData({
        email: "test@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Email already registered");
    }
  });
});

describe("login", () => {
  it("logs in with valid credentials and profile completed", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          user_metadata: { profile_completed_at: "2025-01-01T00:00:00Z" },
        },
      },
    });

    const result = await login(
      makeFormData({ email: "test@example.com", password: "Password1" })
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profileCompleted).toBe(true);
    }
  });

  it("returns error for wrong credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await login(
      makeFormData({ email: "bad@example.com", password: "wrong" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Email o contraseña incorrectos");
    }
  });

  it("returns validation error for empty fields", async () => {
    const result = await login(makeFormData({ email: "", password: "" }));

    expect(result.ok).toBe(false);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

describe("requestReset", () => {
  it("sends reset email successfully", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestReset(
      makeFormData({ email: "test@example.com" })
    );

    expect(result.ok).toBe(true);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/reset"),
      })
    );
  });

  it("returns error for invalid email", async () => {
    const result = await requestReset(makeFormData({ email: "not-an-email" }));

    expect(result.ok).toBe(false);
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("returns error when supabase fails", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "User not found" },
    });

    const result = await requestReset(
      makeFormData({ email: "unknown@example.com" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("User not found");
    }
  });
});

describe("confirmReset", () => {
  it("updates password successfully", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    await expect(
      confirmReset(
        makeFormData({
          password: "NewPass1",
          confirmPassword: "NewPass1",
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "NewPass1" });
  });

  it("returns error on password mismatch", async () => {
    const result = await confirmReset(
      makeFormData({
        password: "NewPass1",
        confirmPassword: "Different1",
      })
    );

    expect(result.ok).toBe(false);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("returns error when password is too short", async () => {
    const result = await confirmReset(
      makeFormData({
        password: "Ab1",
        confirmPassword: "Ab1",
      })
    );

    expect(result.ok).toBe(false);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("signs out successfully and redirects", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("returns error when sign out fails", async () => {
    mockSignOut.mockResolvedValue({
      error: { message: "Session not found" },
    });

    const result = await logout();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Session not found");
    }
  });
});
