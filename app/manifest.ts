import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DTF Genetics — Dream the Future",
    short_name: "DTF Genetics",
    description:
      "DTF Genetics combines original cannabis genetics, Teaching Healthy Cultivation education, grow tools, games, and community resources.",
    start_url: "/",
    display: "standalone",
    background_color: "#07150d",
    theme_color: "#07150d",
    icons: [
      {
        src: "/favicon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
