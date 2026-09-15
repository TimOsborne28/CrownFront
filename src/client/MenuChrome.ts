// Track the prestart window too: the in-game body class is set only after join.
let tornDown = false;

export function menuChromeIsTornDown(): boolean {
  return tornDown;
}

export function hideMenuChrome(): void {
  tornDown = true;
}

export function restoreMenuChrome(): void {
  tornDown = false;
}
