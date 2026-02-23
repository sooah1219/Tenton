import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-tenton-brown text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            aria-label="Facebook"
            className="hover:opacity-80 transition"
          >
            <Facebook size={22} />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
            className="hover:opacity-80 transition"
          >
            <Instagram size={22} />
          </a>
        </div>

        {/* Contact */}
        <div className="text-sm font-medium tracking-wide text-center sm:text-right">
          604-912-0288&nbsp;&nbsp;|&nbsp;&nbsp;1731 Marine Drive, West
          Vancouver, Canada V7V 1J5
        </div>
      </div>
    </footer>
  );
}
