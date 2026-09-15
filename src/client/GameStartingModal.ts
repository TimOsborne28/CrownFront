import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assetUrl } from "../core/AssetUrls";
import { translateText } from "./Utils";

@customElement("game-starting-modal")
export class GameStartingModal extends LitElement {
  @state()
  isVisible = false;

  createRenderRoot() {
    return this;
  }

  render() {
    const isVisible = this.isVisible;
    return html`
      <div
        class="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[9998] transition-all duration-300 ${isVisible
          ? "opacity-100 visible"
          : "opacity-0 invisible"}"
      ></div>
      <div
        class="crownfront-modal-surface fixed top-1/2 left-1/2 p-8 z-[9999] w-[min(400px,92vw)] text-center transition-all duration-300 -translate-x-1/2 ${isVisible
          ? "opacity-100 visible -translate-y-1/2"
          : "opacity-0 invisible -translate-y-[48%]"}"
      >
        <img
          class="crownfront-loading-crest"
          src=${assetUrl("images/CrownFrontMark.svg")}
          alt=""
        />
        <h2 class="text-2xl text-bright-white mb-5">
          ${translateText("crownfront.preparing")}
        </h2>
        <p class="text-sm text-bright-white mb-3">
          ${translateText("crownfront.attribution")}
        </p>
        <a
          href="/source"
          class="block mb-4 text-sm text-malibu-blue underline underline-offset-4 hover:text-aquarius"
          >${translateText("crownfront.source")}</a
        >
        <p class="text-sm text-gray-300 mb-4">
          ${translateText("crownfront.unofficial")}
        </p>
        <div
          class="crownfront-loading-track"
          role="progressbar"
          aria-label=${translateText("crownfront.preparing")}
        ></div>
      </div>
    `;
  }

  show() {
    this.isVisible = true;
    this.requestUpdate();
  }

  hide() {
    this.isVisible = false;
    this.requestUpdate();
  }
}
