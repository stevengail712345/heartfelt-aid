import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://tsyvghzguxolfrjlgpob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_juP2maudejTBENpnDmitsQ_4VENZ9zK";
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || "tsyvghzguxolfrjlgpob";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
  },

  // TanStack Start / prerender configuration. We make prerendering toggleable
  // via the TANSTACK_START_DISABLE_PRERENDER env var so CI can disable it.
  // The server.entry should point to the emitted server file inside the
  // published artifact (we create a shim at dist/server/server.js in the workflow).
  tanstackStart: {
    server: {
      // Adjust this if your build emits a different path for the server bundle.
      entry: './server/server.js',
    },
    prerender: {
      routes: ['/'],
      // Respect CI env var to disable prerender during Pages static builds.
      enabled: process.env.TANSTACK_START_DISABLE_PRERENDER === 'true' ? false : true,
      crawlLinks: true,
    },
  },
});
