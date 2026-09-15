import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { assetUrl } from "../../core/AssetUrls";
import { desktopQuit, requestDesktopQuit } from "../DesktopShell";
import { translateText } from "../Utils";

const pages = [
  ["page-play", "crownfront.home"],
  ["page-single-player", "main.solo"],
  ["page-host-lobby", "main.create"],
  ["page-join-lobby", "main.join"],
  ["page-help", "main.help"],
  ["page-settings", "main.settings"],
] as const;

@customElement("desktop-nav-bar")
export class DesktopNavBar extends LitElement {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("showPage", this.onShowPage);
  }

  disconnectedCallback() {
    window.removeEventListener("showPage", this.onShowPage);
    super.disconnectedCallback();
  }

  private onShowPage = () => this.requestUpdate();

  render() {
    return html`
      <nav
        class="crownfront-nav hidden lg:flex"
        aria-label=${translateText("main.menu")}
      >
        <button
          class="nav-menu-item crownfront-nav-brand"
          data-page="page-play"
        >
          <img
            src=${assetUrl("images/CrownFrontLogo.svg")}
            alt=${translateText("crownfront.title")}
          />
        </button>
        <div class="crownfront-nav-links">
          ${pages.map(
            ([page, key]) => html`
              <button
                class="nav-menu-item crownfront-nav-link ${(window.currentPageId ??
                  "page-play") === page
                  ? "active"
                  : ""}"
                data-page=${page}
                data-i18n=${key}
              ></button>
            `,
          )}
        </div>
        <span class="crownfront-edition" data-i18n="crownfront.local_badge"
          >LOCAL EDITION</span
        >
        ${desktopQuit() === null
          ? null
          : html`
              <button
                class="crownfront-nav-link"
                @click=${() => requestDesktopQuit()}
              >
                ${translateText("main.quit")}
              </button>
            `}
      </nav>
    `;
  }
}
