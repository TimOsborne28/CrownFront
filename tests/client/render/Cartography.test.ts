import { describe, expect, it } from "vitest";
import defaults from "../../../src/client/render/gl/render-settings.json";
import {
  buildTerrainRGBA,
  encodeCartographicTile,
  encodeTerrainTile,
  hexToRgb,
} from "../../../src/client/render/gl/utils/ColorUtils";

describe("CrownFront cartographic terrain", () => {
  it("uses the renderer's palette for preview defaults and explicit colors", () => {
    const explicit = Object.fromEntries(
      Object.entries(defaults.terrain).map(([key, value]) => [
        key,
        hexToRgb(value),
      ]),
    );
    const terrain = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(buildTerrainRGBA(terrain, 16, 16, explicit)).toEqual(
      buildTerrainRGBA(terrain, 16, 16),
    );
  });

  it("does not change geography, dimensions or transparency", () => {
    const terrain = Uint8Array.from({ length: 256 }, (_, i) => i);
    const before = terrain.slice();
    const pixels = buildTerrainRGBA(terrain, 16, 16);
    expect(terrain).toEqual(before);
    expect(pixels).toHaveLength(16 * 16 * 4);
    for (let i = 3; i < pixels.length; i += 4) expect(pixels[i]).toBe(255);
  });

  it("keeps live rect updates identical to full rebakes at world coordinates", () => {
    const w = 37;
    const h = 29;
    const terrain = Uint8Array.from({ length: w * h }, (_, i) => i % 256);
    const full = buildTerrainRGBA(terrain, w, h);
    const tile = new Uint8Array(4);
    for (let y = 7; y < 13; y++) {
      for (let x = 11; x < 20; x++) {
        const ref = y * w + x;
        encodeCartographicTile(terrain[ref], x, y, tile, 0);
        expect(tile).toEqual(full.slice(ref * 4, ref * 4 + 4));
      }
    }
  });

  it("leaves impassable terrain exactly the background color, without grain", () => {
    const tile = new Uint8Array(4);
    for (let x = 0; x < 25; x++) {
      encodeCartographicTile(0x9f, x, 12, tile, 0);
      expect([...tile]).toEqual([
        ...hexToRgb(defaults.terrain.backgroundColor)!,
        255,
      ]);
      encodeCartographicTile(0xdf, x, 12, tile, 0, {
        backgroundColor: [17, 29, 42],
      });
      expect([...tile]).toEqual([17, 29, 42, 255]);
    }
  });

  it("retains distinct, readable land, shoreline, water and mountain fills", () => {
    const colors = [0x80, 0xc0, 0x20, 0x40, 0x98].map((terrain) => {
      const tile = new Uint8Array(4);
      encodeTerrainTile(terrain, tile, 0);
      return [...tile].join(",");
    });
    expect(new Set(colors).size).toBe(colors.length);
  });
});
