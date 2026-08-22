import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://tsyvghzguxolfrjlgpob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_juP2maudejTBENpnDmitsQ_4VENZ9zK";
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || "tsyvghzguxolfrjlgpob";

export default defineConfig({
  plugins: [react()],
  // Point Vite directly to index.html inside the src folder
  root: path.resolve(__dirname, "src"),
  build: {
    // Ensure output goes back to root /dist folder for GitHub Pages
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
  },
});
