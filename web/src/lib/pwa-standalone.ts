/** True when opened as installed PWA (iOS or display-mode standalone). */
export function isPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    iosStandalone
  );
}
