export const THEME_SELECTIONS = [
  "Catppuccin Mocha",
  "Catppuccin Latte",
  "Gruvbox Dark",
] as const;
export type ThemeSelection = (typeof THEME_SELECTIONS)[number];

export interface Theme {
  bg_0: string;
  bg_1: string;
  bg_2: string;

  fg: string;

  surface_0: string;
  surface_1: string;
  surface_2: string;

  hover: string;
  hover_destructive: string;

  active: string;

  accent: string;
}

export const CatppuccinMocha: Theme = {
  bg_0: "#11111b", // Crust
  bg_1: "#181825", // Mantle
  bg_2: "#1e1e2e", // Base
  fg: "#cdd6f4", // Text
  surface_0: "#313244", // Surface0
  surface_1: "#45475a", // Surface1
  surface_2: "#585b70", // Surface2
  hover: "#cba6f7", // Mauve
  hover_destructive: "#f38ba8", // Red
  active: "#a6e3a1", // Green
  accent: "#89dceb", // Sky
};
export const CatppuccinLatte: Theme = {
  bg_0: "#dce0e8", // Crust
  bg_1: "#e6e9ef", // Mantle
  bg_2: "#eff1f5", // Base
  fg: "#4c4f69", // Text
  surface_0: "#ccd0da", // Surface0
  surface_1: "#bcc0cc", // Surface1
  surface_2: "#acb0be", // Surface2
  hover: "#8839ef", // Mauve
  hover_destructive: "#d20f39", // Red
  active: "#40a02b", // Green
  accent: "#04a5e5", // Sky
};

export const GruvboxDark: Theme = {
  bg_0: "#282828", // bg0
  bg_1: "#3c3836", // bg1
  bg_2: "#3c3836", // bg1
  fg: "#ebdbb2", // fg
  surface_0: "#504945", // bg2
  surface_1: "#7c6f64", // bg4
  surface_2: "#928374", // gray
  hover: "#b16286", // purple
  hover_destructive: "#cc241d", // red
  active: "#98971a", // green
  accent: "#458588", // blue
};

export function get_theme(theme: ThemeSelection): Theme {
  switch (theme) {
    case "Catppuccin Mocha":
      return CatppuccinMocha;
    case "Catppuccin Latte":
      return CatppuccinLatte;
    case "Gruvbox Dark":
      return GruvboxDark;
    default:
      throw new Error(`Unknown theme: ${theme}`);
  }
}

export function set_theme(theme: ThemeSelection): void {
  const root = document.documentElement;
  const theme_data = get_theme(theme);
  root.style.setProperty("--bg-0", theme_data.bg_0);
  root.style.setProperty("--bg-1", theme_data.bg_1);
  root.style.setProperty("--bg-2", theme_data.bg_2);
  root.style.setProperty("--fg", theme_data.fg);
  root.style.setProperty("--surface-0", theme_data.surface_0);
  root.style.setProperty("--surface-1", theme_data.surface_1);
  root.style.setProperty("--surface-2", theme_data.surface_2);
  root.style.setProperty("--hover", theme_data.hover);
  root.style.setProperty("--hover-destructive", theme_data.hover_destructive);
  root.style.setProperty("--active", theme_data.active);
  root.style.setProperty("--accent", theme_data.accent);
}
