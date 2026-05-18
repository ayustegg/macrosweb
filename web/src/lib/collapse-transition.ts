/** Shared expand/collapse easing for in-app panels (calendar, macro detail, etc.). */
export const COLLAPSE_GRID =
  "grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]";

export const COLLAPSE_INNER =
  "min-h-0 overflow-hidden transition-[opacity,transform] duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]";

export function collapseInnerClass(open: boolean) {
  return open
    ? "opacity-100 translate-y-0"
    : "pointer-events-none opacity-0 -translate-y-1";
}
