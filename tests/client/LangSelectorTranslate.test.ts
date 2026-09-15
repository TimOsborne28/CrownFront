import { html, render } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LangSelector } from "../../src/client/LangSelector";

// applyTranslation/changeLanguage are private; drive them through a cast, the
// same way GameInfoView.test.ts does. Constructing without attaching skips
// connectedCallback's full language bootstrap.
function makeSelector(translations: Record<string, string>): LangSelector {
  const selector = new LangSelector();
  selector.translations = translations;
  selector.defaultTranslations = translations;
  return selector;
}

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  delete window.CROWNFRONT_LOCAL;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LangSelector applyTranslation", () => {
  it("preserves Lit-owned text parts during the legacy translation pass", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const template = (label: string) =>
      html`<span data-i18n="test.hello">${label}</span>`;
    render(template("First label"), container);
    const selector = makeSelector({
      "main.title": "CrownFront",
      "test.hello": "Legacy label",
    });

    (selector as unknown as { applyTranslation(): void }).applyTranslation();

    expect(() => render(template("Second label"), container)).not.toThrow();
    expect(container.textContent).toBe("Second label");
  });

  it("writes resolved data-i18n keys and skips unresolvable ones", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `
      <span data-i18n="test.hello"></span>
      <span data-i18n="test.bogus">untouched</span>
    `;
    const selector = makeSelector({
      "main.title": "OpenFront",
      "test.hello": "Hello",
      // Malformed map value: translateText hands it back as null, which the
      // loop must skip with a warning instead of blanking the node.
      "test.bogus": null as unknown as string,
    });

    (selector as unknown as { applyTranslation(): void }).applyTranslation();

    expect(
      document.querySelector('[data-i18n="test.hello"]')!.textContent,
    ).toBe("Hello");
    expect(
      document.querySelector('[data-i18n="test.bogus"]')!.textContent,
    ).toBe("untouched");
    expect(warn).toHaveBeenCalledWith("Translation key not found: test.bogus");
    expect(document.title).toBe("OpenFront");
  });
});

describe("LangSelector translateText", () => {
  it("warns and returns the key itself when it is not found", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const selector = makeSelector({});

    expect(selector.translateText("missing.key")).toBe("missing.key");
    expect(warn).toHaveBeenCalledWith("Translation key not found: missing.key");
  });

  it("substitutes {placeholders} from params", () => {
    const selector = makeSelector({
      "test.greeting": "Hello {name}, {count} new messages",
    });

    expect(
      selector.translateText("test.greeting", { name: "Sam", count: 3 }),
    ).toBe("Hello Sam, 3 new messages");
  });
});

describe("LangSelector language loading", () => {
  it("flattens fetched translations, warning on non-string non-object values", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          main: { title: "Titre" },
          bogus: [1, 2],
        }),
      })),
    );
    const selector = makeSelector({});

    await (
      selector as unknown as { changeLanguage(lang: string): Promise<void> }
    ).changeLanguage("fr");

    expect(selector.currentLang).toBe("fr");
    expect(selector.translations).toEqual({ "main.title": "Titre" });
    // The array value is dropped, not flattened.
    expect(warn).toHaveBeenCalledWith("Unknown type", "object", [1, 2]);
  });
});

describe("CrownFront language selection", () => {
  const initialize = (selector: LangSelector) =>
    (
      selector as unknown as { initializeLanguage(): Promise<void> }
    ).initializeLanguage();

  const french = {
    main: { title: "OpenFront" },
    common: { back: "Retour" },
    unit_type: { city: "Ville" },
    help_modal: { build_atom_desc: "Bombe atomique" },
    user_setting: {
      build_warship: "Construire un navire de guerre",
      attack_ratio_label: "Ratio d'attaque",
    },
  };

  it("defaults to English locally without fetching the OS language", async () => {
    window.CROWNFRONT_LOCAL = true;
    vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const selector = makeSelector({});

    await initialize(selector);

    expect(selector.currentLang).toBe("en");
    expect(selector.translateText("main.title")).toBe("CrownFront");
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem("lang")).toBeNull();
  });

  it("retains a saved locale while falling back to English themed wording", async () => {
    window.CROWNFRONT_LOCAL = true;
    localStorage.setItem("lang", "fr");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => french })),
    );
    const selector = makeSelector({});

    await initialize(selector);

    expect(selector.currentLang).toBe("fr");
    expect(localStorage.getItem("lang")).toBe("fr");
    expect(selector.translateText("common.back")).toBe("Retour");
    expect(selector.translateText("user_setting.attack_ratio_label")).toBe(
      "Ratio d'attaque",
    );
    expect(selector.translateText("main.title")).toBe("CrownFront");
    expect(selector.translateText("unit_type.city")).toBe("Keep");
    expect(selector.translateText("help_modal.build_atom_desc")).toContain(
      "Wildfire Pot",
    );
    expect(selector.translateText("user_setting.build_warship")).toBe(
      "Build War Galley",
    );
    expect(selector.translations?.["unit_type.city"]).toBeUndefined();
    expect(document.title).toBe("CrownFront");
  });

  it("keeps the language selector functional after English initialization", async () => {
    window.CROWNFRONT_LOCAL = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => french })),
    );
    const selector = makeSelector({});
    await initialize(selector);

    await (
      selector as unknown as { changeLanguage(lang: string): Promise<void> }
    ).changeLanguage("fr");

    expect(selector.currentLang).toBe("fr");
    expect(localStorage.getItem("lang")).toBe("fr");
    expect(selector.translateText("common.back")).toBe("Retour");
    expect(selector.translateText("unit_type.city")).toBe("Keep");
  });

  it("preserves browser-language selection outside the local edition", async () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => french })),
    );
    const selector = makeSelector({});

    await initialize(selector);

    expect(selector.currentLang).toBe("fr");
    expect(selector.translateText("unit_type.city")).toBe("Ville");
  });
});
