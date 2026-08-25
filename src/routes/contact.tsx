import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/public-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Compassion Beyond Borders Foundation" },
      {
        name: "description",
        content:
          "Refer a case, ask about a donation, or partner with Compassion Beyond Borders. We reply within two working days.",
      },
      { property: "og:title", content: "Contact Compassion Beyond Borders" },
      {
        property: "og:description",
        content: "Refer a case, ask about a donation, or partner with us.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Contact"
        title="Refer a case, or ask us anything about your donation."
        description="We read every message and reply within two working days."
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_360px]">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => {
              setSending(false);
              (e.target as HTMLFormElement).reset();
              toast.success("Message sent", {
                description: "Thank you — our team will reply within two working days.",
              });
            }, 600);
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Your name
              <input
                required
                maxLength={100}
                name="name"
                className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm font-medium">
              Email address
              <input
                required
                type="email"
                maxLength={255}
                name="email"
                className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary"
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Subject
            <select
              name="subject"
              className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary"
            >
              <option>Refer someone who needs help</option>
              <option>Question about a donation</option>
              <option>Partnership or field verification</option>
              <option>Press and media</option>
              <option>Something else</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Message
            <textarea
              required
              maxLength={1500}
              rows={7}
              name="message"
              className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>

        <aside className="h-fit space-y-5 rounded-xl border border-border bg-secondary/60 p-7">
          <h2 className="font-display text-2xl">Direct lines</h2>
          <p className="flex items-start gap-3 text-sm">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <a href="mailto:contact-us@compassionbeyondboarders.site" className="hover:text-primary hover:underline">
              contact-us@compassionbeyondboarders.site
            </a>
          </p>
          <p className="flex items-start gap-3 text-sm">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            +1 (555) 018-4402
          </p>
          <p className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            Registered office: 14 Nieuwe Gracht, Utrecht, Netherlands
          </p>
          <p className="border-t border-border pt-5 text-sm text-muted-foreground">
            Referring a case? Please include the person's location, the nature of the need,
            and any documentation you already have.
          </p>
        </aside>
      </div>
    </PublicLayout>
  );
}
