declare global {
  interface Window {
    CROWNFRONT_LOCAL?: boolean;
  }
}

/** The derivative uses the existing local guest/game server, not OpenFront's API. */
export function isCrownFrontLocal(): boolean {
  return typeof window !== "undefined" && window.CROWNFRONT_LOCAL === true;
}
