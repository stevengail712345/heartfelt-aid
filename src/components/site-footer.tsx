import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Heart className="size-4.5 fill-current" aria-hidden />
            </span>
            <span className="font-display text-xl">Compassion Beyond Borders</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-ink-foreground/70">
            Every donation is a thread that mends a life. We publish one real story at a time,
            in full, with the exact amount still needed — and we tell you when it closes.
          </p>
          <p className="mt-6 text-xs text-ink-foreground/50">
            All amounts shown in US dollars (USD).
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <h2 className="font-display text-base text-ink-foreground">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-ink-foreground/70">
            <li>
              <Link to="/stories" className="hover:text-ink-foreground">
                All stories
              </Link>
            </li>
            <li>
              <Link to="/testimonies" className="hover:text-ink-foreground">
                Testimonies
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-ink-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/transparency" className="hover:text-ink-foreground">
                Where the money goes
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-ink-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <h2 className="font-display text-base text-ink-foreground">Get in touch</h2>
          <ul className="mt-4 space-y-2.5 text-ink-foreground/70">
            <li>hello@compassionbeyondborders.org</li>
            <li>Mon–Fri, 9am–6pm UTC</li>
          </ul>
          <Link
            to="/stories"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Fund a story
          </Link>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Compassion Beyond Borders Foundation.</p>
          <p>Stories are published with the consent of the people in them.</p>
        </div>
      </div>
    </footer>
  );
}
