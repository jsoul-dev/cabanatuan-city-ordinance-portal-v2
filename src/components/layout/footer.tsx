import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  "Mga Serbisyo": [
    { href: "/ordinances", label: "Mga Ordinansa" },
    { href: "/chatbot", label: "AI Assistant" },
    { href: "/report", label: "Community Report" },
    { href: "/news", label: "Balita" },
  ],
  "Pamamahala": [
    { href: "/login", label: "Admin Dashboard" },
    {
      href: "https://www.cabanatuancity.gov.ph/",
      label: "LGU Website",
      external: true,
    },
    {
      href: "https://www.facebook.com/lgucabanatuan/",
      label: "Facebook",
      external: true,
    },
  ],
  "Emergency Hotlines": [
    { href: "tel:0444631111", label: "PNP: (044)-463-1111" },
    { href: "tel:0449400161", label: "CDRRMO: (044)-940-0161" },
    { href: "tel:0449583701", label: "BFP Fire: (044)-958-3701" },
    { href: "tel:09088811010", label: "CDRRMO Mobile: 0908-881-1010" },
    { href: "tel:09190813983", label: "Community Affairs: 0919-081-3983" },
  ],
};

/**
 * Site footer — supports both Light Mode and winauth.net Dark Mode.
 * High-contrast text, official Cabanatuan LGU Seal, and official city links.
 */
export function Footer() {
  return (
    <footer
      className="mt-auto border-t border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-white/10 dark:bg-[#050a08] dark:text-neutral-400 transition-colors"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-900 dark:text-white">
              <Image
                src="/lgu-logo.png"
                alt="Cabanatuan City LGU Seal"
                width={22}
                height={22}
                className="h-5.5 w-5.5 object-contain"
              />
              <span>Cabanatuan City</span>
              <span className="text-neutral-400 dark:text-neutral-500">/</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Ordinance Portal
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-500">
              Lungsod ng Cabanatuan, Nueva Ecija
              <br />
              Official Digital Ordinance Portal & AI Citizen Assistant
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 font-mono text-[10px] text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-400 dark:shadow-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>OFFICIAL PORTAL • 89 BARANGAYS</span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-mono text-xs font-semibold tracking-wider text-neutral-900 dark:text-white uppercase mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-600 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
                      {...("external" in link && link.external
                        ? {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-neutral-200 dark:border-white/10 pt-6 text-center">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Pamahalaang Lungsod ng Cabanatuan. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
