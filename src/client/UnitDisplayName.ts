import { UnitType } from "../core/game/Game";
import { translateText } from "./Utils";

const UNIT_NAME_KEYS: Record<UnitType, string> = {
  [UnitType.TransportShip]: "transport_ship",
  [UnitType.Warship]: "warship",
  [UnitType.Shell]: "shell",
  [UnitType.SAMMissile]: "sam_missile",
  [UnitType.Port]: "port",
  [UnitType.AtomBomb]: "atom_bomb",
  [UnitType.HydrogenBomb]: "hydrogen_bomb",
  [UnitType.TradeShip]: "trade_ship",
  [UnitType.MissileSilo]: "missile_silo",
  [UnitType.DefensePost]: "defense_post",
  [UnitType.SAMLauncher]: "sam_launcher",
  [UnitType.City]: "city",
  [UnitType.MIRV]: "mirv",
  [UnitType.MIRVWarhead]: "mirv_warhead",
  [UnitType.Train]: "train",
  [UnitType.Factory]: "factory",
};

export function unitDisplayName(type: string): string {
  return Object.prototype.hasOwnProperty.call(UNIT_NAME_KEYS, type)
    ? translateText(`unit_type.${UNIT_NAME_KEYS[type as UnitType]}`)
    : type;
}
