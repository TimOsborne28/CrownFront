import { afterEach, describe, expect, it, vi } from "vitest";
import { cartographicPreview } from "../../../src/client/components/map/CartographicPreview";
import { buildTerrainRGBA } from "../../../src/client/render/gl/utils/ColorUtils";
import type { MapData } from "../../../src/core/game/GameMapLoader";
import type { MapManifest } from "../../../src/core/game/TerrainMapLoader";

afterEach(() => vi.restoreAllMocks());

const manifest = {
  name: "Test realm",
  map16x: { width: 3, height: 2, num_land_tiles: 3 },
} as MapManifest;

function canvasHarness() {
  const image = { data: new Uint8ClampedArray(24) };
  const context = {
    createImageData: vi.fn(() => image),
    putImageData: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => "data:image/png;base64,realm"),
  };
  vi.spyOn(document, "createElement").mockReturnValue(
    canvas as unknown as HTMLCanvasElement,
  );
  return { image, context, canvas };
}

describe("map-picker cartographic previews", () => {
  it("paints the shipped overview through the exact gameplay terrain encoder", async () => {
    const { image, context, canvas } = canvasHarness();
    const terrain = new Uint8Array([0x80, 0xc0, 0x98, 0x40, 0x20, 0x9f]);
    const map16xBin = vi.fn().mockResolvedValue(terrain);
    const data = { map16xBin } as unknown as MapData;
    expect(await cartographicPreview("overview-colors", data, manifest)).toBe(
      "data:image/png;base64,realm",
    );
    expect(canvas.width).toBe(3);
    expect(canvas.height).toBe(2);
    expect([...image.data]).toEqual([...buildTerrainRGBA(terrain, 3, 2)]);
    expect(context.putImageData).toHaveBeenCalledWith(image, 0, 0);
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/png");
  });

  it("shares in-flight overview work between duplicate map cards", async () => {
    canvasHarness();
    const map16xBin = vi.fn().mockResolvedValue(new Uint8Array(6));
    const data = { map16xBin } as unknown as MapData;
    const first = cartographicPreview("overview-cache", data, manifest);
    expect(cartographicPreview("overview-cache", data, manifest)).toBe(first);
    await first;
    expect(map16xBin).toHaveBeenCalledTimes(1);
  });

  it("evicts failed requests so a later visit can retry", async () => {
    canvasHarness();
    const map16xBin = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(new Uint8Array(6));
    const data = { map16xBin } as unknown as MapData;
    await expect(
      cartographicPreview("overview-retry", data, manifest),
    ).rejects.toThrow("offline");
    await expect(
      cartographicPreview("overview-retry", data, manifest),
    ).resolves.toContain("data:image/png;");
    expect(map16xBin).toHaveBeenCalledTimes(2);
  });

  it("rejects inconsistent overview dimensions instead of painting invented terrain", async () => {
    const data = {
      map16xBin: vi.fn().mockResolvedValue(new Uint8Array(5)),
    } as unknown as MapData;
    await expect(
      cartographicPreview("overview-invalid", data, manifest),
    ).rejects.toThrow("Invalid overview terrain");
  });
});
