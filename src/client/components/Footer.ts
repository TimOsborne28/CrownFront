import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { currentGameVersion } from "../GameVersion";

@customElement("page-footer")
export class Footer extends LitElement {
  private readonly gameVersion = currentGameVersion();

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <footer class="crownfront-footer">
        <div class="crownfront-footer-legal">
          <span data-i18n="main.copyright">© OpenFront and Contributors</span>
          <a href="/source" data-i18n="crownfront.source">Modified source</a>
          <span class="footer-version">${this.gameVersion}</span>
        </div>
        <p data-i18n="main.subtitle">
          Unofficial modified edition. Not endorsed by OpenFront.
        </p>
        <lang-selector></lang-selector>
      </footer>
    `;
  }
}
