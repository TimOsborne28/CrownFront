import { Colord } from "colord";
import { assetUrl } from "../../core/AssetUrls";
import { TrainType, UnitType } from "../../core/game/Game";
import { Theme } from "../theme/ThemeProvider";
import { UnitView } from "../view";
const atomBombSprite = assetUrl("sprites/atombomb.svg");
const hydrogenBombSprite = assetUrl("sprites/hydrogenbomb.svg");
const mirvSprite = assetUrl("sprites/mirv2.svg");
const samMissileSprite = assetUrl("sprites/samMissile.svg");
const tradeShipSprite = assetUrl("sprites/tradeship.svg");
const trainCarriageSprite = assetUrl("sprites/trainCarriage.svg");
const trainLoadedCarriageSprite = assetUrl("sprites/trainCarriageLoaded.svg");
const trainEngineSprite = assetUrl("sprites/trainEngine.svg");
const transportShipSprite = assetUrl("sprites/transportship.svg");
const warshipSprite = assetUrl("sprites/warship.svg");

// Can't reuse TrainType because "loaded" is not a type, just an attribute
const TrainTypeSprite = {
  Engine: "Engine",
  Carriage: "Carriage",
  LoadedCarriage: "LoadedCarriage",
} as const;

type TrainTypeSprite = (typeof TrainTypeSprite)[keyof typeof TrainTypeSprite];

const SPRITE_CONFIG: Partial<Record<UnitType | TrainTypeSprite, string>> = {
  [UnitType.TransportShip]: transportShipSprite,
  [UnitType.Warship]: warshipSprite,
  [UnitType.SAMMissile]: samMissileSprite,
  [UnitType.AtomBomb]: atomBombSprite,
  [UnitType.HydrogenBomb]: hydrogenBombSprite,
  [UnitType.TradeShip]: tradeShipSprite,
  [UnitType.MIRV]: mirvSprite,
  [TrainTypeSprite.Engine]: trainEngineSprite,
  [TrainTypeSprite.Carriage]: trainCarriageSprite,
  [TrainTypeSprite.LoadedCarriage]: trainLoadedCarriageSprite,
};

const spriteMap: Map<UnitType | TrainTypeSprite, ImageBitmap> = new Map();

// preload all images
export const loadAllSprites = async (): Promise<void> => {
  const entries = Object.entries(SPRITE_CONFIG);
  const totalSprites = entries.length;
  let loadedCount = 0;

  await Promise.all(
    entries.map(async ([unitType, url]) => {
      const typedUnitType = unitType as UnitType | TrainTypeSprite;

      if (!url || url === "") {
        console.warn(`No sprite URL for ${typedUnitType}, skipping...`);
        return;
      }

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (err) => reject(err);
        });

        const bitmap = await createImageBitmap(img);
        spriteMap.set(typedUnitType, bitmap);
        loadedCount++;

        if (loadedCount === totalSprites) {
          console.log("All sprites loaded.");
        }
      } catch (err) {
        console.error(`Failed to load sprite for ${typedUnitType}:`, err);
      }
    }),
  );
};

/**
 * The train sprites rely on the train attributes and not only on its type
 */
function trainTypeToSpriteType(unit: UnitView): TrainTypeSprite {
  const trainType = unit.trainType();

  switch (trainType) {
    case TrainType.Engine:
    case TrainType.TailEngine:
      return TrainTypeSprite.Engine;
    case TrainType.Carriage:
    default:
      return unit.isLoaded()
        ? TrainTypeSprite.LoadedCarriage
        : TrainTypeSprite.Carriage;
  }
}

const getSpriteForUnit = (unit: UnitView): ImageBitmap | null => {
  const unitType = unit.type();
  if (unitType === UnitType.Train) {
    const trainType = trainTypeToSpriteType(unit);
    return spriteMap.get(trainType) ?? null;
  }
  return spriteMap.get(unitType) ?? null;
};

export const isSpriteReady = (unit: UnitView): boolean => {
  const unitType = unit.type();
  if (unitType === UnitType.Train) {
    const trainType = trainTypeToSpriteType(unit);
    return spriteMap.has(trainType);
  }
  return spriteMap.has(unitType);
};

const coloredSpriteCache: Map<string, HTMLCanvasElement> = new Map();

/**
 * Load a canvas and replace grayscale with border colors
 */
export const colorizeCanvas = (
  source: CanvasImageSource & { width: number; height: number },
  colorA: Colord,
  colorB: Colord,
  colorC: Colord,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const colorARgb = colorA.toRgb();
  const colorBRgb = colorB.toRgb();
  const colorCRgb = colorC.toRgb();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    if (data[i + 3] === 0) continue;
    // SVG rasterization antialiases the edges between our grayscale bands.
    // Match the GPU thresholds instead of leaving those edge pixels gray.
    if (r > 230 && g > 230 && b > 230) {
      data[i] = 247;
      data[i + 1] = 232;
      data[i + 2] = 196;
    } else if (r > 153 || (r > 86 && r <= 115)) {
      data[i] = colorARgb.r;
      data[i + 1] = colorARgb.g;
      data[i + 2] = colorARgb.b;
    } else if (r <= 115) {
      data[i] = colorBRgb.r;
      data[i + 1] = colorBRgb.g;
      data[i + 2] = colorBRgb.b;
    } else {
      data[i] = colorCRgb.r;
      data[i + 1] = colorCRgb.g;
      data[i + 2] = colorCRgb.b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

function computeSpriteKey(
  unit: UnitView,
  territoryColor: Colord,
  borderColor: Colord,
): string {
  const owner = unit.owner();
  const type = `${unit.type()}-${unit.trainType()}-${unit.isLoaded()}`;
  const key = `${type}-${owner.id()}-${territoryColor.toRgbString()}-${borderColor.toRgbString()}`;
  return key;
}

export const getColoredSprite = (
  unit: UnitView,
  theme: Theme,
  customTerritoryColor?: Colord,
  customBorderColor?: Colord,
): HTMLCanvasElement => {
  const territoryColor: Colord =
    customTerritoryColor ?? unit.owner().territoryColor();
  const borderColor: Colord = customBorderColor ?? unit.owner().borderColor();
  const spawnHighlightColor = theme.spawnHighlightColor();
  const key = computeSpriteKey(unit, territoryColor, borderColor);
  if (coloredSpriteCache.has(key)) {
    return coloredSpriteCache.get(key)!;
  }

  const sprite = getSpriteForUnit(unit);
  if (sprite === null) {
    throw new Error(`Failed to load sprite for ${unit.type()}`);
  }

  const coloredCanvas = colorizeCanvas(
    sprite,
    territoryColor,
    borderColor,
    spawnHighlightColor,
  );

  coloredSpriteCache.set(key, coloredCanvas);
  return coloredCanvas;
};
