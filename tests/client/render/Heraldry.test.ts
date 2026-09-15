import { afterEach, describe, expect, it, vi } from "vitest";
import { FlagAtlasArray } from "../../../src/client/render/gl/passes/name-pass/FlagAtlasArray";
import {
  heraldicDesign,
  heraldicSvg,
} from "../../../src/client/theme/Heraldry";

afterEach(() => vi.unstubAllGlobals());

describe("original heraldic nameplates", () => {
  it("gives identical faction keys identical arms without changing the key", () => {
    const key = "https://example.invalid/flags/mercia.svg";
    expect(heraldicDesign(key)).toEqual(heraldicDesign(key));
    expect(heraldicSvg(key)).toBe(heraldicSvg(key));
    expect(key).toBe("https://example.invalid/flags/mercia.svg");
  });

  it("distinguishes factions by shapes as well as colors", () => {
    const designs = Array.from({ length: 100 }, (_, i) =>
      heraldicDesign(`kingdom-${i}`),
    );
    expect(new Set(designs.map((d) => d.charge)).size).toBe(6);
    expect(new Set(designs.map((d) => d.division)).size).toBe(4);
    expect(new Set(designs.map((d) => d.field)).size).toBe(5);
  });

  it("never embeds a source image URL or arbitrary source markup", () => {
    const svg = heraldicSvg('https://bad.invalid/"><script>alert(1)</script>');
    expect(svg).toContain('clipPath id="shield"');
    expect(svg).not.toMatch(/<image|<script|bad\.invalid|href=/);
    expect(svg).toContain('width="128" height="85"');
  });

  it("replaces crown cosmetics with original crowns rather than remote logos", () => {
    const crown = heraldicSvg("/flags/logo.svg", true);
    expect(crown).toContain("<circle");
    expect(crown).not.toContain("clipPath");
    expect(crown).not.toContain("/flags/logo.svg");
  });

  it("binds runtime flag layers to local artwork, retaining the original dedup key", () => {
    let loadedUrl = "";
    vi.stubGlobal(
      "Image",
      class {
        set src(value: string) {
          loadedUrl = value;
        }
      },
    );
    const atlas = Object.create(FlagAtlasArray.prototype) as FlagAtlasArray;
    Object.assign(atlas, {
      entries: new Map(),
      nextLayer: 0,
      layerCount: 8,
      cellW: 128,
      cellH: 85,
    });
    const key = "https://remote.invalid/OpenFront.svg";
    atlas.request(key);
    expect(loadedUrl).toMatch(/^data:image\/svg\+xml,/);
    expect(decodeURIComponent(loadedUrl)).not.toContain("OpenFront");
    expect(atlas.getLayer(key)).toBe(-1);
    const source = loadedUrl;
    atlas.request(key);
    expect(loadedUrl).toBe(source);
  });
});
