import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { assetUrl } from "../../core/AssetUrls";
import "./NavUtilityIcons";

@customElement("play-page")
export class PlayPage extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div id="page-play" class="crownfront-home">
        <div class="crownfront-mobile-bar lg:hidden">
          <button
            id="hamburger-btn"
            class="crownfront-menu-toggle"
            data-i18n-aria-label="main.menu"
            aria-expanded="false"
            aria-controls="sidebar-menu"
            aria-haspopup="dialog"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img
            src=${assetUrl("images/CrownFrontLogo.svg")}
            alt="CrownFront"
            data-i18n-alt="crownfront.title"
          />
          <nav-utility-icons size="mobile"></nav-utility-icons>
        </div>
        <header class="crownfront-title">
          <img
            class="crownfront-crest"
            src=${assetUrl("images/CrownFrontMark.svg")}
            alt=""
            aria-hidden="true"
          />
          <h1 data-i18n="crownfront.title">CrownFront</h1>
          <p class="crownfront-motto" data-i18n="crownfront.subtitle">
            A realm is not given. It is forged.
          </p>
          <p
            class="crownfront-description"
            data-i18n="crownfront.play_description"
          >
            Raise your banner. Build your kingdom. Rule the map.
          </p>
          <p class="crownfront-disclaimer" data-i18n="crownfront.unofficial">
            Unofficial modified edition. Not endorsed by OpenFront.
          </p>
        </header>
        <section class="crownfront-war-table" data-i18n-aria-label="main.play">
          <div class="crownfront-identity">
            <span
              class="crownfront-field-label"
              data-i18n="crownfront.realm_name"
              >Your banner</span
            >
            <username-input></username-input>
          </div>
          <game-mode-selector></game-mode-selector>
          <p class="crownfront-local-hint" data-i18n="crownfront.local_hint">
            Single-player and private lobbies · No account required
          </p>
        </section>
      </div>
    `;
  }
}
