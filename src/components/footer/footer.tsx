import Link from "next/link";
import { BRAND, FOOTER_LINKS } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Desktop */}
        <div className="hidden py-12 md:py-16 lg:block">
          <div className="grid grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-block">
                <span className="text-xl font-bold tracking-wider text-white">
                  {BRAND.name}
                </span>
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                {BRAND.tagline}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Quick Links
              </h3>
              <nav aria-label="Quick links">
              <ul className="space-y-2.5">
                {FOOTER_LINKS.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              </nav>
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Categories
              </h3>
              <nav aria-label="Categories">
              <ul className="space-y-2.5">
                {FOOTER_LINKS.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              </nav>
            </div>

            {/* Contact + Social */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Contact Us
              </h3>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li>{BRAND.email}</li>
                <li>{BRAND.phone}</li>
                <li>{BRAND.address}</li>
              </ul>

              <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Follow Us
              </h3>
              <div className="flex items-center gap-4">
                {FOOTER_LINKS.social.map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {social.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex items-center justify-between border-t border-neutral-800 pt-6">
            <p className="text-xs text-neutral-500">
              &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <p className="text-xs font-medium text-neutral-600">
              {BRAND.slogan}
            </p>
          </div>
        </div>

        {/* Mobile */}
        <div className="py-8 lg:hidden">
          <div className="mb-6">
            <span className="text-lg font-bold tracking-wider text-white">
              {BRAND.name}
            </span>
            <p className="mt-2 text-xs text-neutral-400">{BRAND.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                Quick Links
              </h3>
              <nav aria-label="Quick links">
              <ul className="space-y-2">
                {FOOTER_LINKS.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              </nav>
            </div>

            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                Categories
              </h3>
              <nav aria-label="Categories">
              <ul className="space-y-2">
                {FOOTER_LINKS.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              </nav>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-800 pt-6">
            <p className="text-[11px] text-neutral-500">
              &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
