import { afterEach, describe, expect, it, vi } from "vitest";
import "../../../../src/client/hud/layers/WinModal";
import type { WinModal } from "../../../../src/client/hud/layers/WinModal";
import type { GameView } from "../../../../src/client/view";
import { RankedType } from "../../../../src/core/game/Game";

vi.mock("../../../../src/client/Utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../src/client/Utils")>();
  return {
    translateText: (key: string) => key,
    renderNumber: (value: number | bigint) => String(value),
    renderTroops: actual.renderTroops,
    homeHref: () => "/",
  };
});

vi.mock("../../../../src/client/CrazyGamesSDK", () => ({
  crazyGamesSDK: {
    gameplayStop: vi.fn(),
    happytime: vi.fn(),
  },
}));

describe("CrownFront endgame", () => {
  let modal: WinModal;

  afterEach(() => {
    modal?.remove();
    vi.useRealTimers();
  });

  async function mount(rankedType?: RankedType) {
    modal = document.createElement("win-modal") as WinModal;
    modal.game = {
      myPlayer: () => ({
        isAlive: () => true,
        numTilesOwned: () => 1234,
        troops: () => 50000,
        gold: () => 900n,
      }),
      config: () => ({ gameConfig: () => ({ rankedType }) }),
    } as unknown as GameView;
    document.body.appendChild(modal);
    await modal.updateComplete;
  }

  it("shows the player's realm state without external promotions", async () => {
    await mount();
    expect(modal.textContent).toContain("1234");
    expect(modal.querySelectorAll("dd")[1].textContent?.trim()).toBe("5.00K");
    expect(modal.textContent).toContain("900");
    expect(
      modal.querySelector("iframe, purchase-button, steam-wishlist"),
    ).toBeNull();
  });

  it("keeps exit and continue controls and their reveal delay", async () => {
    vi.useFakeTimers();
    await mount();
    await modal.show();
    expect(modal.isVisible).toBe(true);
    expect(modal.showButtons).toBe(false);
    vi.advanceTimersByTime(3000);
    await modal.updateComplete;
    expect(modal.showButtons).toBe(true);
    expect(
      modal.querySelector('o-button[translationKey="win_modal.exit"]'),
    ).not.toBeNull();
    modal.hide();
    expect(modal.isVisible).toBe(false);
    expect(modal.showButtons).toBe(false);
  });

  it("retains the ranked requeue event for compatible game sessions", async () => {
    vi.useFakeTimers();
    await mount(RankedType.TwoVTwo);
    await modal.show();
    await modal.updateComplete;
    const listener = vi.fn();
    document.addEventListener("matchmaking-requeue", listener, { once: true });
    modal
      .querySelector<HTMLElement>(
        'o-button[translationKey="win_modal.requeue"]',
      )!
      .click();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { mode: "2v2" } }),
    );
  });
});
