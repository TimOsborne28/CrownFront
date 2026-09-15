import type { MapData } from "../../../core/game/GameMapLoader";
import type { MapManifest } from "../../../core/game/TerrainMapLoader";
import { buildTerrainRGBA } from "../../render/gl/utils/ColorUtils";

const previews = new Map<string, Promise<string>>();
const MAX_CACHED_PREVIEWS = 48;

/**
 * Use the shipped overview terrain, not a painted or cropped substitute.
 * Sharing the GPU terrain encoder keeps islands, shores and relief faithful.
 */
export function cartographicPreview(
  key: string,
  data: MapData,
  manifest: MapManifest,
): Promise<string> {
  const cached = previews.get(key);
  if (cached) return cached;
  const preview = data.map16xBin().then((terrain) => {
    const { width, height } = manifest.map16x;
    if (terrain.length !== width * height || width <= 0 || height <= 0) {
      throw new Error(`Invalid overview terrain for ${key}`);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Map preview canvas unavailable");
    const image = context.createImageData(width, height);
    image.data.set(buildTerrainRGBA(terrain, width, height));
    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  });
  previews.set(key, preview);
  if (previews.size > MAX_CACHED_PREVIEWS) {
    previews.delete(previews.keys().next().value!);
  }
  void preview.catch(() => {
    if (previews.get(key) === preview) previews.delete(key);
  });
  return preview;
}
