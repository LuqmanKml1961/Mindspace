import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { themeColors } from "@/lib/theme-colors";

// color_scheme_dark is in the W3C manifest spec but not in Next's type yet.
// Android paints an installed app's navigation bar from these colours.
type Manifest = MetadataRoute.Manifest & {
  color_scheme_dark?: Pick<
    MetadataRoute.Manifest,
    "background_color" | "theme_color"
  >;
};

export default function manifest(): Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: themeColors.light,
    theme_color: themeColors.light,
    color_scheme_dark: {
      background_color: themeColors.dark,
      theme_color: themeColors.dark,
    },
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
