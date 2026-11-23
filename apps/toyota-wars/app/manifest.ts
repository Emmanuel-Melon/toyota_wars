import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Toyota Wars",
    short_name: "Toyota Wars",
    description:
      "Armored squad tactics on the open plains, command tanks, designate targets, and survive the warband.",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#1b1a16",
    theme_color: "#1b1a16",
    icons: [{ src: "/placeholder-logo.png", sizes: "any", type: "image/png" }],
  };
}
