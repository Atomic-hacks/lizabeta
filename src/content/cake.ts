/* The Cake Lab. Options are data: add a flavour here and it appears in the
 * studio, in the 3D model and in the 2D fallback with no component edits. */

export type CakeShape = "round" | "heart" | "square";
export type Tiers = 1 | 2 | 3;

export type Swatch = { id: string; name: string; hex: string };

export const shapes: { id: CakeShape; name: string; note: string }[] = [
  { id: "round", name: "Round", note: "The classic" },
  { id: "heart", name: "Heart", note: "Sentimental" },
  { id: "square", name: "Square", note: "Structurally honest" },
];

export const tierOptions: { id: Tiers; name: string; note: string }[] = [
  { id: 1, name: "One tier", note: "Restrained" },
  { id: 2, name: "Two tiers", note: "Correct" },
  { id: 3, name: "Three tiers", note: "Unhinged" },
];

export const sponges: Swatch[] = [
  { id: "vanilla", name: "Vanilla", hex: "#f2e3c2" },
  { id: "chocolate", name: "Chocolate", hex: "#4a2c20" },
  { id: "red-velvet", name: "Red velvet", hex: "#8e2436" },
  { id: "strawberry", name: "Strawberry", hex: "#eab3bb" },
  { id: "funfetti", name: "Funfetti", hex: "#f7eedd" },
];

export const frostings: Swatch[] = [
  { id: "buttercream", name: "Buttercream", hex: "#f6ecd9" },
  { id: "chocolate", name: "Chocolate", hex: "#56382a" },
  { id: "strawberry", name: "Strawberry", hex: "#f0c3c9" },
  { id: "cream-cheese", name: "Cream cheese", hex: "#fbf4e6" },
];

export const frostingColors: Swatch[] = [
  { id: "cream", name: "Cream", hex: "#faf7ff" },
  { id: "blush", name: "Blush", hex: "#f0b8d0" },
  { id: "rose", name: "Rose", hex: "#c2558f" },
  { id: "violet", name: "Violet", hex: "#7b2fb5" },
  { id: "pistachio", name: "Pistachio", hex: "#c8d3b0" },
  { id: "butter", name: "Butter", hex: "#f3d9a4" },
  { id: "sky", name: "Powder blue", hex: "#b7c9f5" },
  { id: "ink", name: "Ink", hex: "#26231f" },
  { id: "gold", name: "Gold leaf", hex: "#e2bd6a" },
];

export type DecorationId =
  | "strawberries"
  | "cherries"
  | "sprinkles"
  | "pearls"
  | "stars"
  | "hearts"
  | "bows"
  | "flowers";

export const decorations: { id: DecorationId; name: string; note: string }[] = [
  { id: "strawberries", name: "Strawberries", note: "Halved, fanned" },
  { id: "cherries", name: "Cherries", note: "Stems on" },
  { id: "sprinkles", name: "Sprinkles", note: "Structurally unnecessary" },
  { id: "pearls", name: "Sugar pearls", note: "Quietly expensive" },
  { id: "stars", name: "Stars", note: "Gold" },
  { id: "hearts", name: "Hearts", note: "Obvious, but correct" },
  { id: "bows", name: "Bows", note: "One per tier" },
  { id: "flowers", name: "Flowers", note: "Edible, allegedly" },
];

export const candleStyles: { id: string; name: string; note: string }[] = [
  { id: "taper", name: "Tapered", note: "Dinner-party formal" },
  { id: "twist", name: "Twisted", note: "Hand-dipped" },
  { id: "spiral", name: "Spiral", note: "Birthday standard" },
  { id: "sparkler", name: "Sparkler", note: "Fire hazard" },
];

export const candleColors: Swatch[] = [
  { id: "ivory", name: "Ivory", hex: "#f6efdd" },
  { id: "violet", name: "Violet", hex: "#7b2fb5" },
  { id: "rose", name: "Rose", hex: "#c2558f" },
  { id: "gold", name: "Gold", hex: "#e2bd6a" },
  { id: "black", name: "Black", hex: "#1b1917" },
];

export type CakeConfig = {
  shape: CakeShape;
  tiers: Tiers;
  sponge: string;
  frosting: string;
  color: string;
  decorations: DecorationId[];
  candleStyle: string;
  candleColor: string;
  candleCount: number;
  message: string;
};

export const defaultCake: CakeConfig = {
  shape: "round",
  tiers: 2,
  sponge: "red-velvet",
  frosting: "cream-cheese",
  color: "#c8a2ff",
  decorations: ["strawberries", "pearls"],
  candleStyle: "twist",
  candleColor: "#7b2fb5",
  candleCount: 5,
  message: "HAPPY BIRTHDAY ELIZABETH",
};

export const CAKE_STORAGE_KEY = "elizabeth.cake.v1";
