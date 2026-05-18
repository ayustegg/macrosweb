import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePullToRefresh } from "./use-pull-to-refresh";

describe("usePullToRefresh", () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  it("returns initial state", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh));

    expect(result.current.pulling).toBe(false);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.handlers).toBeDefined();
  });

  it("does not activate pulling if scrollY > 0", () => {
    const onRefresh = vi.fn();
    window.scrollY = 100;
    const { result } = renderHook(() => usePullToRefresh(onRefresh));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 200 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(false);
  });

  it("activates pulling when dy > threshold/2", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 150 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(true);
  });

  it("does not activate pulling if dy <= threshold/2", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 120 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(false);
  });

  it("triggers onRefresh and sets refreshing when pulling", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(onRefresh));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 160 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(true);

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it("resets pulling to false on touchEnd", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 160 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(true);

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(false);
  });

  it("respects custom threshold", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh, 150));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 130 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.pulling).toBe(false);
  });

  it("does not trigger refresh if not pulling", () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefresh, 80));

    act(() => {
      result.current.handlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchMove({
        touches: [{ clientY: 120 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.handlers.onTouchEnd({} as unknown as React.TouchEvent);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
