import { describe, it, expect } from "vitest";

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

function formatLabel(dateStr: string, today: string): string {
  const diff = diffDays(dateStr, today);
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === -2) return "Anteayer";
  if (diff === 1) return "Mañana";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

describe("DayNavigator utilities", () => {
  const today = "2026-05-18";

  describe("addDays", () => {
    it("adds days correctly", () => {
      expect(addDays(today, 1)).toBe("2026-05-19");
      expect(addDays(today, -1)).toBe("2026-05-17");
      expect(addDays(today, 7)).toBe("2026-05-25");
    });

    it("handles month boundaries", () => {
      expect(addDays("2026-05-31", 1)).toBe("2026-06-01");
      expect(addDays("2026-06-01", -1)).toBe("2026-05-31");
    });

    it("handles year boundaries", () => {
      expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
      expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    });
  });

  describe("diffDays", () => {
    it("returns 0 for same date", () => {
      expect(diffDays(today, today)).toBe(0);
    });

    it("returns positive diff for future dates", () => {
      expect(diffDays("2026-05-20", today)).toBe(2);
      expect(diffDays("2026-05-25", today)).toBe(7);
    });

    it("returns negative diff for past dates", () => {
      expect(diffDays("2026-05-16", today)).toBe(-2);
      expect(diffDays("2026-05-11", today)).toBe(-7);
    });
  });

  describe("formatLabel", () => {
    it('returns "Hoy" for today', () => {
      expect(formatLabel(today, today)).toBe("Hoy");
    });

    it('returns "Ayer" for yesterday', () => {
      expect(formatLabel("2026-05-17", today)).toBe("Ayer");
    });

    it('returns "Anteayer" for two days ago', () => {
      expect(formatLabel("2026-05-16", today)).toBe("Anteayer");
    });

    it('returns "Mañana" for tomorrow', () => {
      expect(formatLabel("2026-05-19", today)).toBe("Mañana");
    });

    it("formats dates in Spanish locale", () => {
      const label = formatLabel("2026-05-10", today);
      expect(label).toMatch(/10.*may.*2026/i);
    });

    it("formats dates correctly for different months", () => {
      const label = formatLabel("2026-06-15", today);
      expect(label).toMatch(/15.*jun.*2026/i);
    });
  });
});
