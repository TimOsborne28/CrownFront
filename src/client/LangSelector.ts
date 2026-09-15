import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assetUrl } from "../core/AssetUrls";
import { isCrownFrontLocal } from "./CrownFront";
import { desktopSteamLocale } from "./DesktopShell";
import "./LanguageModal";
import { LanguageModal } from "./LanguageModal";
import { formatDebugTranslation } from "./Utils";

import en from "../../resources/lang/en.json";
import metadata from "../../resources/lang/metadata.json";

type LanguageMetadata = {
  code: string;
  native: string;
  en: string;
  svg: string;
};

// Other locales retain their controls; the English-only reskin must not be
// replaced by upstream unit names or contradictory modern instructions.
const CROWNFRONT_ENGLISH_SECTIONS = new Set([
  "crownfront",
  "build_menu",
  "help_modal",
  "tutorial",
  "unit_type",
  "effects",
]);
const CROWNFRONT_ENGLISH_KEYS = new Set([
  "chat.attack.build_warships",
  "chat.attack.mirv",
  "chat.defend.build_posts",
  "chat.misc.build_closer",
  "chat.warnings.mirv_ready",
  "chat.warnings.mirv_soon",
  "chat.warnings.saving_for_mirv",
  "clan_modal.donate_irreversible_hard",
  "cosmetics.hard",
  "desktop_gate.heading",
  "desktop_gate.title",
  "events_display.alliance_nukes_destroyed_incoming",
  "events_display.alliance_nukes_destroyed_outgoing",
  "events_display.atom_bomb_detonated",
  "events_display.hydrogen_bomb_detonated",
  "events_display.missile_intercepted",
  "events_display.no_boats_available",
  "events_display.trade_ship_captured",
  "game_info_modal.atoms",
  "game_info_modal.hydros",
  "game_info_modal.mirv",
  "game_info_modal.naval_trade",
  "game_info_modal.stolen_gold",
  "game_info_modal.train_trade",
  "game_settings.start",
  "game_settings.starting",
  "game_settings.water_nukes",
  "game_starting_modal.title",
  "graphics_setting.fallout_desc",
  "graphics_setting.fallout_label",
  "graphics_setting.layer_nukeable",
  "graphics_setting.nuke_color_desc",
  "graphics_setting.nuke_color_label",
  "graphics_setting.preset_default_desc",
  "graphics_setting.rail_distance_desc",
  "graphics_setting.rail_distance_label",
  "graphics_setting.rail_thickness_desc",
  "graphics_setting.rail_thickness_label",
  "host_modal.title",
  "host_modal.waiting",
  "ios_banner.modal_desc",
  "ios_banner.text",
  "leaderboard.cities",
  "leaderboard.factories",
  "leaderboard.launchers",
  "leaderboard.ports",
  "leaderboard.sams",
  "leaderboard.trainTradeGoldPerMin",
  "leaderboard.warships",
  "main.copyright",
  "main.help",
  "main.solo",
  "main.subtitle",
  "main.title",
  "main.tutorial",
  "map.baikalnukewars",
  "map.warshipwarship",
  "news_box.firefox_warning",
  "player_panel.flip_rocket_trajectory",
  "player_stats_table.nuke_stats",
  "player_stats_table.trains",
  "player_stats_table.trains_external",
  "player_stats_table.unit.mirvw",
  "player_stats_table.unit.trade",
  "player_stats_table.unit.trans",
  "player_stats_table.warship_stats",
  "player_stats_tree.stats_cities_per_game",
  "player_stats_tree.stats_defense_posts_per_game",
  "player_stats_tree.stats_factories_per_game",
  "player_stats_tree.stats_nukes_launched_per_game",
  "player_stats_tree.stats_others_train_gold_per_game",
  "player_stats_tree.stats_ports_per_game",
  "player_stats_tree.stats_trade_arrived_per_game",
  "player_stats_tree.stats_trade_captured_per_game",
  "player_stats_tree.stats_train_gold_per_game",
  "player_stats_tree.stats_transports_landed_per_game",
  "player_stats_tree.stats_transports_landed_short",
  "player_stats_tree.stats_transports_sent_per_game",
  "player_stats_tree.stats_transports_sent_short",
  "player_stats_tree.stats_warships_built_per_game",
  "public_game_modifier.nukes_disabled",
  "public_game_modifier.nukes_disabled_label",
  "public_game_modifier.ports_disabled",
  "public_game_modifier.ports_disabled_label",
  "public_game_modifier.sams_disabled",
  "public_game_modifier.sams_disabled_label",
  "public_game_modifier.water_nukes",
  "public_lobby.starting_game",
  "public_lobby.title",
  "store.custom_currency_purchase_success",
  "store.pack_debt",
  "store.plutonium_amount",
  "store.tribe_boost_confirm",
  "troubleshooting.chromium_tip",
  "update_available.desktop",
  "update_available.message",
  "user_setting.audio_alerts_desc",
  "user_setting.audio_ambience_desc",
  "user_setting.boat_attack",
  "user_setting.boat_attack_desc",
  "user_setting.box_select_warships",
  "user_setting.box_select_warships_desc",
  "user_setting.build_atom_bomb",
  "user_setting.build_atom_bomb_desc",
  "user_setting.build_city",
  "user_setting.build_city_desc",
  "user_setting.build_defense_post",
  "user_setting.build_defense_post_desc",
  "user_setting.build_factory",
  "user_setting.build_factory_desc",
  "user_setting.build_hydrogen_bomb",
  "user_setting.build_hydrogen_bomb_desc",
  "user_setting.build_mirv",
  "user_setting.build_mirv_desc",
  "user_setting.build_missile_silo",
  "user_setting.build_missile_silo_desc",
  "user_setting.build_port",
  "user_setting.build_port_desc",
  "user_setting.build_sam_launcher",
  "user_setting.build_sam_launcher_desc",
  "user_setting.build_warship",
  "user_setting.build_warship_desc",
  "user_setting.nuke_alliance_safety_desc",
  "user_setting.select_all_warships",
  "user_setting.select_all_warships_desc",
  "user_setting.swap_direction",
  "user_setting.swap_direction_desc",
  "win_modal.died",
  "win_modal.nation_won",
  "win_modal.other_team",
  "win_modal.other_won",
  "win_modal.you_won",
  "win_modal.your_team",
]);

@customElement("lang-selector")
export class LangSelector extends LitElement {
  @state() public translations: Record<string, string> | undefined;
  @state() public defaultTranslations: Record<string, string> | undefined;
  @state() public currentLang: string = "en";
  @state() private languageList: any[] = [];
  @state() private debugMode: boolean = false;
  @state() isVisible = true;

  private debugKeyPressed: boolean = false;
  private languageMetadata: LanguageMetadata[] = metadata;
  private languageCache = new Map<string, Record<string, string>>();

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupDebugKey();
    this.initializeLanguage();
    window.addEventListener(
      "language-selected",
      this.handleLanguageSelected as EventListener,
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "language-selected",
      this.handleLanguageSelected as EventListener,
    );
  }

  private handleLanguageSelected = (e: CustomEvent) => {
    if (e.detail && e.detail.lang) {
      this.changeLanguage(e.detail.lang);
    }
  };

  private setupDebugKey() {
    window.addEventListener("keydown", (e) => {
      if (e.key?.toLowerCase() === "t") this.debugKeyPressed = true;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key?.toLowerCase() === "t") this.debugKeyPressed = false;
    });
  }

  private getClosestSupportedLang(lang: string): string {
    if (!lang) return "en";
    if (lang === "debug") return "debug";
    const supported = new Set(this.languageMetadata.map((entry) => entry.code));
    if (supported.has(lang)) return lang;

    const base = lang.slice(0, 2);
    if (supported.has(base)) return base;
    const candidates = Array.from(supported).filter((key) =>
      key.startsWith(base),
    );
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.length - a.length); // More specific first
      return candidates[0];
    }

    return "en";
  }

  private async initializeLanguage() {
    // On the Steam desktop build, the shell reports the locale the player's
    // Steam is set to. It outranks navigator.language -- which there is the OS
    // locale, and so ignores Steam entirely -- but NOT a saved choice, which
    // stays the last word on every platform.
    //
    // Ordering it this way is what keeps the language following Steam: the
    // shell's value is consulted afresh each launch rather than persisted, so
    // a player who changes their Steam language sees the game follow, while a
    // player who picks a language in-game has that stick.
    const browserLocale = isCrownFrontLocal()
      ? "en"
      : (desktopSteamLocale() ?? navigator.language);
    const savedLang = localStorage.getItem("lang");
    const userLang = this.getClosestSupportedLang(savedLang ?? browserLocale);

    const [defaultTranslations, translations] = await Promise.all([
      this.loadLanguage("en"),
      this.loadLanguage(userLang),
    ]);

    this.defaultTranslations = defaultTranslations;
    this.translations = translations;
    this.currentLang = userLang;

    await this.loadLanguageList();
    this.applyTranslation();
  }

  private async loadLanguage(lang: string): Promise<Record<string, string>> {
    if (!lang) return {};
    const cached = this.languageCache.get(lang);
    if (cached) return cached;

    if (lang === "debug") {
      const empty: Record<string, string> = {};
      this.languageCache.set(lang, empty);
      return empty;
    }

    if (lang === "en") {
      const flat = flattenTranslations(en);
      this.languageCache.set(lang, flat);
      return flat;
    }

    try {
      const response = await fetch(
        assetUrl(`lang/${encodeURIComponent(lang)}.json`),
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch language ${lang}: ${response.status}`);
      }
      const language = (await response.json()) as Record<string, any>;
      const flat = flattenTranslations(language);
      if (isCrownFrontLocal()) {
        for (const key of Object.keys(flat)) {
          if (
            CROWNFRONT_ENGLISH_SECTIONS.has(key.split(".")[0]) ||
            CROWNFRONT_ENGLISH_KEYS.has(key)
          ) {
            // Omission uses the existing English fallback, including its ICU
            // plural rules, rather than formatting English in the chosen locale.
            delete flat[key];
          }
        }
      }
      this.languageCache.set(lang, flat);
      return flat;
    } catch (err) {
      console.error(`Failed to load language ${lang}:`, err);
      return {};
    }
  }

  private async loadLanguageList() {
    try {
      let list: any[] = [];

      const browserLang = new Intl.Locale(navigator.language).language;

      let debugLang: any = null;
      if (this.debugKeyPressed || this.currentLang === "debug") {
        debugLang = {
          code: "debug",
          native: "Debug",
          en: "Debug",
          svg: "xx",
        };
        this.debugMode = true;
      }

      for (const langData of this.languageMetadata) {
        if (langData.code === "debug" && !debugLang) continue;
        list.push({
          code: langData.code,
          native: langData.native,
          en: langData.en,
          svg: langData.svg,
        });
      }

      const currentLangEntry = list.find((l) => l.code === this.currentLang);
      const browserLangEntry =
        browserLang !== this.currentLang && browserLang !== "en"
          ? list.find((l) => l.code === browserLang)
          : undefined;
      const englishEntry =
        this.currentLang !== "en"
          ? list.find((l) => l.code === "en")
          : undefined;

      list = list.filter(
        (l) =>
          l.code !== this.currentLang &&
          l.code !== browserLang &&
          l.code !== "en" &&
          l.code !== "debug",
      );

      list.sort((a, b) => a.en.localeCompare(b.en));

      const finalList: any[] = [];
      if (currentLangEntry) finalList.push(currentLangEntry);
      if (englishEntry) finalList.push(englishEntry);
      if (browserLangEntry) finalList.push(browserLangEntry);
      finalList.push(...list);
      if (debugLang) finalList.push(debugLang);

      this.languageList = finalList;
    } catch (err) {
      console.error("Failed to load language list:", err);
    }
  }

  private async changeLanguage(lang: string) {
    localStorage.setItem("lang", lang);
    this.translations = await this.loadLanguage(lang);
    this.currentLang = lang;
    this.applyTranslation();
  }

  private applyTranslation() {
    const components = [
      "play-page",
      "page-footer",
      "desktop-nav-bar",
      "mobile-nav-bar",
      "nav-utility-icons",
      "single-player-modal",
      "host-lobby-modal",
      "join-lobby-modal",
      "emoji-table",
      "player-stats",
      "team-stats",
      "leaderboard-player-list",
      "leaderboard-clan-table",
      "build-menu",
      "win-modal",
      "game-starting-modal",
      "top-bar",
      "player-panel",
      "replay-panel",
      "help-modal",
      "settings-modal",
      "username-input",
      "game-mode-selector",
      "graphics-preset-selector",
      "user-setting",
      "o-modal",
      "o-button",
      "inventory-modal",
      "store-modal",
      "cosmetic-card",
      "cosmetic-info",
      "cosmetic-preview",
      "inventory-loadout-bar",
      "purchase-button",
      "custom-currency-card",
      "fluent-slider",
      "news-modal",
      "account-modal",
      "game-stats-modal",
      "player-profile-modal",
      "game-info-view",
      "ranking-controls",
      "leaderboard-modal",
      "effects-grid",
      "token-login",
      "tribes-panel",
      "steam-wishlist",
      "steam-wishlist-button",
      "streaming-now",
      "tutorial-panel",
    ];

    document.title = this.translateText("main.title") ?? document.title;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      // Lit owns its comment markers and nested markup. Replacing those with
      // textContent detaches live ChildParts; components translate on rerender.
      if (
        Array.from(element.childNodes).some(
          (node) => node.nodeType !== Node.TEXT_NODE,
        )
      ) {
        return;
      }
      const key = element.getAttribute("data-i18n");
      if (key === null) return;
      const text = this.translateText(key);
      if (text === null) {
        console.warn(`Translation key not found: ${key}`);
        return;
      }
      element.textContent = text;
    });

    const applyAttributeTranslation = (
      dataAttr: string,
      targetAttr: string,
    ): void => {
      document.querySelectorAll(`[${dataAttr}]`).forEach((element) => {
        const key = element.getAttribute(dataAttr);
        if (key === null) return;
        const text = this.translateText(key);
        if (text === null) {
          console.warn(`Translation key not found: ${key}`);
          return;
        }
        element.setAttribute(targetAttr, text);
      });
    };

    applyAttributeTranslation("data-i18n-title", "title");
    applyAttributeTranslation("data-i18n-alt", "alt");
    applyAttributeTranslation("data-i18n-aria-label", "aria-label");
    applyAttributeTranslation("data-i18n-placeholder", "placeholder");

    components.forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        if (typeof (el as any).requestUpdate === "function") {
          (el as any).requestUpdate();
        }
      });
    });
  }

  public translateText(
    key: string,
    params: Record<string, string | number> = {},
  ): string {
    if (this.currentLang === "debug") {
      return formatDebugTranslation(key, params);
    }

    let text: string | undefined;
    if (this.translations && key in this.translations) {
      text = this.translations[key];
    } else if (this.defaultTranslations && key in this.defaultTranslations) {
      text = this.defaultTranslations[key];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    for (const param in params) {
      const value = params[param];
      text = text.replace(`{${param}}`, String(value));
    }

    return text;
  }

  private async openModal() {
    this.debugMode = this.debugKeyPressed;
    await this.loadLanguageList();

    const languageModal = document.getElementById(
      "page-language",
    ) as LanguageModal;

    if (languageModal) {
      languageModal.languageList = [...this.languageList];
      languageModal.currentLang = this.currentLang;
      // Use the navigation system
      window.showPage?.("page-language");
    }
  }

  public close() {
    this.isVisible = false;
    this.requestUpdate();
  }

  render() {
    if (!this.isVisible) {
      return html``;
    }
    const currentLang =
      this.languageList.find((l) => l.code === this.currentLang) ??
      (this.currentLang === "debug"
        ? {
            code: "debug",
            native: "Debug",
            en: "Debug",
            svg: "xx",
          }
        : {
            native: "English",
            en: "English",
            svg: "uk_us_flag",
          });

    return html`
      <button
        id="lang-selector"
        title="Change Language"
        @click=${this.openModal}
        class="border-none bg-none cursor-pointer p-0 flex items-center justify-center transition-transform duration-200 hover:scale-[1.1] active:scale-[0.9] opacity-60 hover:opacity-100 w-[40px] h-[40px] lg:w-[56px] lg:h-[56px]"
      >
        <img
          id="lang-flag"
          class="object-contain pointer-events-none transition-all w-[40px] h-[40px] lg:w-[48px] lg:h-[48px]"
          src=${assetUrl(`flags/${currentLang.svg}.svg`)}
          alt="flag"
          draggable="false"
        />
      </button>
    `;
  }
}

function flattenTranslations(
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, string> = {},
): Record<string, string> {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      flattenTranslations(value, fullKey, result);
    } else {
      console.warn("Unknown type", typeof value, value);
    }
  }
  return result;
}
