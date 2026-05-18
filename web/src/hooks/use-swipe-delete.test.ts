import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSwipeDelete } from "./use-swipe-delete";

describe("useSwipeDelete", () => {
  it("returns initial state", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete));

    expect(result.current.offsetX).toBe(0);
    expect(result.current.handlers).toBeDefined();
    expect(result.current.handlers.onTouchStart).toBeDefined();
    expect(result.current.handlers.onTouchMove).toBeDefined();
    expect(result.current.handlers.onTouchEnd).toBeDefined();
  });

  it("updates offsetX on touch move (left)", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientX: 50 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    expect(result.current.offsetX).toBeLessThan(0);
    expect(result.current.offsetX).toBeGreaterThanOrEqual(-100);
  });

  it("does not trigger onDelete if offsetX is above threshold", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientX: 50 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("triggers onDelete if offsetX exceeds negative threshold", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientX: -10 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(onDelete).toHaveBeenCalled();
  });

  it("resets offsetX to 0 on touchEnd", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientX: 50 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    expect(result.current.offsetX).not.toBe(0);

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(result.current.offsetX).toBe(0);
  });

  it("respects custom threshold", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useSwipeDelete(onDelete, 120));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientX: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientX: 0 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(onDelete).not.toHaveBeenCalled();
  });
});
