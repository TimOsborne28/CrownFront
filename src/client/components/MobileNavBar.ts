import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { assetUrl } from "../../core/AssetUrls";
import { translateText } from "../Utils";

@customElement("mobile-nav-bar")
export class MobileNavBar extends LitElement {
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
    const pages = [
      ["page-play", "crownfront.home"],
      ["page-single-player", "main.solo"],
      ["page-host-lobby", "main.create"],
      ["page-join-lobby", "main.join"],
      ["page-help", "main.help"],
      ["page-settings", "main.settings"],
    ];
    return html`
      <div class="crownfront-drawer">
        <img
          src=${assetUrl("images/CrownFrontLogo.svg")}
          alt=${translateText("crownfront.title")}
        />
        ${pages.map(
          ([page, key]) => html`
            <button
              class="nav-menu-item crownfront-drawer-link ${(window.currentPageId ??
                "page-play") === page
                ? "active"
                : ""}"
              data-page=${page}
              data-i18n=${key}
            ></button>
          `,
        )}
        <p class="crownfront-local-hint" data-i18n="crownfront.local_badge">
          LOCAL EDITION
        </p>
      </div>
    `;
  }
}
