import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import artwork from "../../../resources/atlases/crownfront-art.json";
import emojiMeta from "../../../resources/atlases/emoji-atlas-meta.json";
import fxMeta from "../../../resources/atlases/fx-atlas-meta.json";
import { MEDIEVAL_EMOJI_ICONS } from "../../../src/client/render/gl/passes/name-pass/IconProgram";

const read = (...parts: string[]) =>
  readFileSync(join(process.cwd(), ...parts), "utf8");

describe("CrownFront runtime artwork contract", () => {
  it("replaces modern unit emotes without changing communication tokens", () => {
    for (const [emoji, filename] of Object.entries(MEDIEVAL_EMOJI_ICONS)) {
      expect(emojiMeta.emojis).toHaveProperty(emoji);
      expect(read("resources", "images", filename)).toContain(
        "Original CrownFront artwork",
      );
    }
    expect(MEDIEVAL_EMOJI_ICONS["🚂"]).toBe("CaravanIcon.svg");
    expect(MEDIEVAL_EMOJI_ICONS["🏭"]).toBe("FactoryIconWhite.svg");
    expect(MEDIEVAL_EMOJI_ICONS["☢️"]).toBe("NukeIconWhite.svg");
  });
  it("binds the real WebGL passes to the original SVG atlases", () => {
    for (const [pass, atlas] of [
      ["StructurePass.ts", "icon-atlas.svg"],
      ["UnitPass.ts", "unit-atlas.svg"],
      ["fx-pass/FxSpritePass.ts", "fx-atlas.svg"],
      ["name-pass/StatusIconProgram.ts", "status-atlas.svg"],
      ["CrosshairPass.ts", "status-atlas.svg"],
    ]) {
      const source = read(
        "src",
        "client",
        "render",
        "gl",
        "passes",
        ...pass.split("/"),
      );
      expect(source).toContain(`assetUrl("atlases/${atlas}")`);
      const svg = read("resources", "atlases", atlas);
      expect(svg).toContain("Original CrownFront artwork");
      expect(svg).not.toMatch(/<image|<script|\shref=|xlink:href/);
    }
  });

  it("covers every mobile variant without changing world footprints", () => {
    expect(artwork.units.map((unit) => unit.worldSize)).toEqual([
      5, 5, 11, 7, 9, 13, 3, 1, 3, 5, 5, 5,
    ]);
    expect(artwork.units.map((unit) => unit.column)).toEqual(
      Array.from({ length: 12 }, (_, i) => i),
    );
    for (const unit of artwork.units) {
      expect(read("resources", "sprites", `${unit.name}.svg`)).toContain(
        "<path",
      );
    }
    expect(artwork.structures).toHaveLength(6);
  });

  it("keeps all animated effects aligned to the existing atlas metadata", () => {
    expect(artwork.effects.map((effect) => effect.frames)).toEqual([
      9, 9, 10, 4, 4, 14, 6, 4, 5, 5, 3, 10,
    ]);
    let y = 0;
    artwork.effects.forEach((effect, i) => {
      expect(fxMeta.rows[i]).toEqual({
        yOffset: y,
        height: effect.height,
        worldWidth: effect.width,
        worldHeight: effect.height,
      });
      y += effect.height;
      expect(read("resources", "sprites", `${effect.name}.svg`)).toContain(
        "<svg",
      );
    });
    expect(y).toBe(fxMeta.height);
  });

  it("keeps HUD sprite loading on the same original artwork", () => {
    const source = read("src", "client", "hud", "SpriteLoader.ts");
    expect(source).not.toContain('.png"');
    for (const unit of artwork.units.filter(
      (unit) => unit.name !== "shell" && unit.name !== "mirvWarhead",
    )) {
      expect(source).toContain(`sprites/${unit.name}.svg`);
    }
    for (const name of [
      "CityIconWhite",
      "PortIcon",
      "FactoryIconWhite",
      "ShieldIconWhite",
      "SamLauncherIconWhite",
      "MissileSiloIconWhite",
      "BattleshipIconWhite",
      "TradeShipIconWhite",
      "BoatIconWhite",
      "NukeIconWhite",
      "MushroomCloudIconWhite",
      "MIRVIcon",
      "PlutoniumIcon",
    ]) {
      expect(read("resources", "images", `${name}.svg`)).toContain(
        "Original CrownFront artwork",
      );
    }
  });
});
