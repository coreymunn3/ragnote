import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wysenote - AI-Powered Knowledge Base",
    short_name: "Wysenote",
    description: "AI-powered Personal Knowledge Base - View your notes offline",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-light-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-light-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-dark-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-dark-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "education", "utilities"],
  };
}
