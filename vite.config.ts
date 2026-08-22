import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://tsyvghzguxolfrjlgpob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_juP2maudejTBENpnDmitsQ_4VENZ9zK";
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || "tsyvghzguxolfrjlgpob";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
    },
  },
});
