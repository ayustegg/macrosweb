import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePullToRefresh } from "./use-pull-to-refresh";

function PtrHarness({
  onRefresh,
  threshold,
}: {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
}) {
  const { containerRef, pullDistance, refreshing, canRelease } =
    usePullToRefresh(onRefresh, { threshold, minRefreshDuration: 0 });
  return (
    <main className="app-shell-main" style={{ overflow: "auto", height: 400 }}>
      <div ref={containerRef} data-testid="ptr-root">
        <span data-testid="pull-distance">{pullDistance}</span>
        <span data-testid="refreshing">{String(refreshing)}</span>
        <span data-testid="can-release">{String(canRelease)}</span>
      </div>
    </main>
  );
}

function fireTouch(
  el: HTMLElement,
  type: "touchstart" | "touchmove" | "touchend",
  clientY: number
) {
  const touch = { clientY, identifier: 0 };
  const init = {
    touches: type === "touchend" ? [] : [touch],
    changedTouches: [touch],
  };
  if (type === "touchstart") fireEvent.touchStart(el, init);
  else if (type === "touchmove") fireEvent.touchMove(el, init);
  else fireEvent.touchEnd(el, init);
}

describe("usePullToRefresh", () => {
  it("returns initial state", () => {
    const onRefresh = vi.fn();
    render(<PtrHarness onRefresh={onRefresh} />);

    expect(screen.getByTestId("pull-distance").textContent).toBe("0");
    expect(screen.getByTestId("refreshing").textContent).toBe("false");
    expect(screen.getByTestId("can-release").textContent).toBe("false");
  });

  it("increases pullDistance while dragging down at scroll top", () => {
    const onRefresh = vi.fn();
    render(<PtrHarness onRefresh={onRefresh} />);
    const root = screen.getByTestId("ptr-root");

    act(() => {
      fireTouch(root, "touchstart", 100);
      fireTouch(root, "touchmove", 200);
    });

    expect(
      Number(screen.getByTestId("pull-distance").textContent)
    ).toBeGreaterThan(0);
  });

  it("triggers onRefresh when released past threshold", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(<PtrHarness onRefresh={onRefresh} threshold={64} />);
    const root = screen.getByTestId("ptr-root");

    act(() => {
      fireTouch(root, "touchstart", 100);
      fireTouch(root, "touchmove", 250);
    });
    expect(screen.getByTestId("can-release").textContent).toBe("true");

    act(() => {
      fireTouch(root, "touchend", 250);
    });

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("refreshing").textContent).toBe("false");
      expect(screen.getByTestId("pull-distance").textContent).toBe("0");
    });
  });

  it("does not trigger refresh when pull is below threshold", async () => {
    const onRefresh = vi.fn();
    render(<PtrHarness onRefresh={onRefresh} threshold={64} />);
    const root = screen.getByTestId("ptr-root");

    act(() => {
      fireTouch(root, "touchstart", 100);
      fireTouch(root, "touchmove", 130);
      fireTouch(root, "touchend", 130);
    });

    await waitFor(() => {
      expect(onRefresh).not.toHaveBeenCalled();
    });
    expect(screen.getByTestId("pull-distance").textContent).toBe("0");
  });

  it("does not pull when scroll parent is scrolled", () => {
    const onRefresh = vi.fn();
    render(<PtrHarness onRefresh={onRefresh} />);
    const scrollParent = document.querySelector(
      ".app-shell-main"
    ) as HTMLElement;
    Object.defineProperty(scrollParent, "scrollTop", {
      value: 50,
      configurable: true,
    });
    const root = screen.getByTestId("ptr-root");

    act(() => {
      fireTouch(root, "touchstart", 100);
      fireTouch(root, "touchmove", 200);
    });

    expect(screen.getByTestId("pull-distance").textContent).toBe("0");
  });
});
