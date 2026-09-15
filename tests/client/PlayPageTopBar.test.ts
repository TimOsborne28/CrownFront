import { afterEach, describe, expect, it } from "vitest";
import { PlayPage } from "../../src/client/components/PlayPage";

describe("CrownFront home controls", () => {
  let page: PlayPage;

  afterEach(() => page?.remove());

  async function mount() {
    if (!customElements.get("play-page")) {
      customElements.define("play-page", PlayPage);
    }
    page = document.createElement("play-page") as PlayPage;
    document.body.appendChild(page);
    await page.updateComplete;
  }

  it("keeps mobile menu, help, settings and game-mode controls", async () => {
    await mount();
    expect(
      page.querySelector("#hamburger-btn")?.getAttribute("aria-controls"),
    ).toBe("sidebar-menu");
    expect(page.querySelector("nav-utility-icons")).not.toBeNull();
    expect(page.querySelector("username-input")).not.toBeNull();
    expect(page.querySelector("game-mode-selector")).not.toBeNull();
  });

  it("shows original CrownFront artwork without account or promotional widgets", async () => {
    await mount();
    expect(page.querySelector('img[src$="CrownFrontMark.svg"]')).not.toBeNull();
    expect(
      page.querySelector(
        "nav-account-menu, steam-wishlist, streaming-now, cosmetic-background",
      ),
    ).toBeNull();
    expect(page.querySelector(".crownfront-title")?.textContent).toContain(
      "Unofficial modified edition. Not endorsed by OpenFront.",
    );
  });

  it("can rerender after language text is refreshed", async () => {
    await mount();
    page.querySelector("h1")!.textContent = "CrownFront";
    page.requestUpdate();
    await expect(page.updateComplete).resolves.toBe(true);
    expect(page.querySelector("h1")).not.toBeNull();
  });
});
