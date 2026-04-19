import {
  AlarmBold,
  BagBold,
  BoltBold,
  BookBold,
  CameraBold,
  ChartBold,
  ChatDotsBold,
  CodeBold,
  CrownBold,
  GamepadBold,
  HeartBold,
  LightningBold,
  MapPointBold,
  MusicNoteBold,
  PaletteBold,
  PlanetBold,
  RocketBold,
  SmileCircleBold,
  StarBold,
} from "@solar-icons/react-native";
import type { ComponentType } from "react";

export type IconProps = { size?: number; color?: string };
export type IconComponent = ComponentType<IconProps>;

export const ICON_NAMES = [
  "rocket",
  "star",
  "heart",
  "music",
  "camera",
  "game",
  "book",
  "shop",
  "chat",
  "map",
  "clock",
  "palette",
  "code",
  "chart",
  "crown",
  "lightning",
  "planet",
  "smile",
  "bolt",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_LABELS: Record<IconName, string> = {
  rocket: "ロケット",
  star: "スター",
  heart: "ハート",
  music: "音楽",
  camera: "カメラ",
  game: "ゲーム",
  book: "本",
  shop: "ショップ",
  chat: "チャット",
  map: "マップ",
  clock: "時計",
  palette: "デザイン",
  code: "コード",
  chart: "グラフ",
  crown: "クラウン",
  lightning: "稲妻",
  planet: "宇宙",
  smile: "スマイル",
  bolt: "ボルト",
};

const solarRegistry: Record<IconName, IconComponent> = {
  rocket: RocketBold,
  star: StarBold,
  heart: HeartBold,
  music: MusicNoteBold,
  camera: CameraBold,
  game: GamepadBold,
  book: BookBold,
  shop: BagBold,
  chat: ChatDotsBold,
  map: MapPointBold,
  clock: AlarmBold,
  palette: PaletteBold,
  code: CodeBold,
  chart: ChartBold,
  crown: CrownBold,
  lightning: LightningBold,
  planet: PlanetBold,
  smile: SmileCircleBold,
  bolt: BoltBold,
};

export const iconRegistries = {
  solar: solarRegistry,
} as const;

export type ThemeName = keyof typeof iconRegistries;

export const DEFAULT_THEME: ThemeName = "solar";

export function getIconComponent(
  name: string,
  theme: ThemeName = DEFAULT_THEME,
): IconComponent | null {
  const registry = iconRegistries[theme];
  return (registry as Record<string, IconComponent>)[name] ?? null;
}

export function isValidIconName(name: string): name is IconName {
  return ICON_NAMES.includes(name as IconName);
}
