import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hideMenuChrome,
  menuChromeIsTornDown,
  restoreMenuChrome,
} from "../src/client/MenuChrome";

afterEach(() => {
  restoreMenuChrome();
  document.body.innerHTML = "";
  document.body.classList.remove("in-game");
});

describe("local menu lifecycle", () => {
  it("tracks teardown before the game-start signal", () => {
    expect(menuChromeIsTornDown()).toBe(false);
    hideMenuChrome();
    expect(document.body.classList.contains("in-game")).toBe(false);
    expect(menuChromeIsTornDown()).toBe(true);
  });

  it("restores correctly after repeated prestart and join callbacks", () => {
    hideMenuChrome();
    hideMenuChrome();
    restoreMenuChrome();
    expect(menuChromeIsTornDown()).toBe(false);
  });

  it("does not depend on the body's game class", () => {
    document.body.classList.add("in-game");
    expect(menuChromeIsTornDown()).toBe(false);
  });

  it("never reactivates legacy promotional components", () => {
    const promos = document.createElement("homepage-promos") as HTMLElement & {
      show: () => void;
    };
    promos.show = vi.fn();
    document.body.appendChild(promos);
    hideMenuChrome();
    restoreMenuChrome();
    expect(promos.show).not.toHaveBeenCalled();
  });
});
