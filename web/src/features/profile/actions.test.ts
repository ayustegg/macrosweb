import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, updateUser: mockUpdateUser },
    from: mockFrom,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: vi.fn(), get: vi.fn() })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { completeOnboarding, updateProfile } from "@/features/profile/actions";

const makeFormData = (values: Record<string, string>) => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
};

const validFormData = makeFormData({
  displayName: "Test",
  sex: "male",
  birthDate: "1995-06-15",
  heightCm: "180",
  weightKg: "80",
  activityLevel: "moderate",
  timezone: "America/Mexico_City",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("completeOnboarding", () => {
  it("happy path: creates profile, weight, slots, goal and redirects", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpdateUser.mockResolvedValue({ error: null });

    const profiles = { upsert: vi.fn().mockResolvedValue({ error: null }) };
    const weightLogs = { insert: vi.fn().mockResolvedValue({ error: null }) };
    const mealSlots = { insert: vi.fn().mockResolvedValue({ error: null }) };
    const goals = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "profiles":
          return profiles;
        case "weight_logs":
          return weightLogs;
        case "meal_slots":
          return mealSlots;
        case "goals":
          return goals;
        default:
          return {};
      }
    });

    await expect(completeOnboarding(validFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(profiles.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1", display_name: "Test" })
    );
    expect(weightLogs.insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: "user-1" })
    );
    expect(mealSlots.insert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Desayuno" })])
    );
    expect(goals.insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: "user-1", is_auto: true })
    );
  });

  it("returns error if weight_log insert fails (rollback boundary)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpdateUser.mockResolvedValue({ error: null });

    const profiles = { upsert: vi.fn().mockResolvedValue({ error: null }) };
    const weightLogs = {
      insert: vi.fn().mockResolvedValue({
        error: { message: "DB error on weight_logs" },
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "profiles":
          return profiles;
        case "weight_logs":
          return weightLogs;
        default:
          return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
    });

    const result = await completeOnboarding(validFormData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("DB error on weight_logs");
    }
    expect(profiles.upsert).toHaveBeenCalled();
    expect(weightLogs.insert).toHaveBeenCalled();
  });

  it("returns error if meal_slots insert fails (rollback boundary)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpdateUser.mockResolvedValue({ error: null });

    const profiles = { upsert: vi.fn().mockResolvedValue({ error: null }) };
    const weightLogs = { insert: vi.fn().mockResolvedValue({ error: null }) };
    const mealSlots = {
      insert: vi.fn().mockResolvedValue({
        error: { message: "DB error on meal_slots" },
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "profiles":
          return profiles;
        case "weight_logs":
          return weightLogs;
        case "meal_slots":
          return mealSlots;
        default:
          return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
    });

    const result = await completeOnboarding(validFormData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("DB error on meal_slots");
    }
  });

  it("returns error if profile upsert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpdateUser.mockResolvedValue({ error: null });

    const profiles = {
      upsert: vi.fn().mockResolvedValue({
        error: { message: "DB error on profiles" },
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profiles;
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });

    const result = await completeOnboarding(validFormData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("DB error on profiles");
    }
  });

  it("returns validation error for empty fields", async () => {
    const result = await completeOnboarding(makeFormData({}));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Datos inválidos");
      expect(result.fieldErrors).toBeDefined();
    }
  });
});

describe("updateProfile", () => {
  it("updates profile fields", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const profiles = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profiles;
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const result = await updateProfile(
      makeFormData({ displayName: "NewName", timezone: "UTC" })
    );

    expect(result.ok).toBe(true);
    expect(profiles.update).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: "NewName",
        timezone: "UTC",
      })
    );
  });

  it("returns error for no session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await updateProfile(
      makeFormData({ displayName: "NewName" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("No hay sesión activa");
    }
  });
});
