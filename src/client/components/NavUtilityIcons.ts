import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { desktopQuit, requestDesktopQuit } from "../DesktopShell";
import { translateText } from "../Utils";

@customElement("nav-utility-icons")
export class NavUtilityIcons extends LitElement {
  @property({ type: String }) size: "desktop" | "mobile" = "desktop";

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex items-center gap-1">
        <button
          class="nav-menu-item crownfront-menu-toggle"
          data-page="page-help"
          aria-label=${translateText("main.help")}
          title=${translateText("main.help")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4M12 17.5h.01"
            />
          </svg>
        </button>
        <button
          class="nav-menu-item crownfront-menu-toggle"
          data-page="page-settings"
          aria-label=${translateText("main.settings")}
          title=${translateText("main.settings")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="m9 3-1 3-3 1-2 3 2 3-1 3 3 2 3-1 3 3 3-2 1-3 3-1v-4l-3-1-1-3-3-1-3 1-1-2Z"
            />
          </svg>
        </button>
        ${desktopQuit() === null
          ? null
          : html`
              <button
                class="crownfront-menu-toggle"
                data-i18n-aria-label="main.quit"
                data-i18n-title="main.quit"
                aria-label=${translateText("main.quit")}
                title=${translateText("main.quit")}
                @click=${() => requestDesktopQuit()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  aria-hidden="true"
                >
                  <path d="M9 21H5V3h4M16 7l5 5-5 5M21 12H9" />
                </svg>
              </button>
            `}
      </div>
    `;
  }
}
