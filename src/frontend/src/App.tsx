import { useState } from "react";
import { Crown, Heart, Loader2, Menu, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWatches, useIsAdmin } from "@/hooks/useQueries";
import WatchCarousel from "@/components/WatchCarousel";
import OrderModal from "@/components/OrderModal";
import AdminPanel from "@/components/AdminPanel";
import ChatWidget from "@/components/ChatWidget";
import type { Watch } from "@/backend";

const appId = encodeURIComponent(window.location.hostname || "castle-imperior");

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({
  isAdmin,
  onAdminClick,
}: {
  isAdmin: boolean;
  onAdminClick: () => void;
}) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "";
        if (message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Watches", href: "#watches" },
    { label: "Order", href: "#watches" },
    { label: "Chat", href: "#chat" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gold-dim bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/generated/castle-imperior-logo-transparent.dim_200x200.png"
            alt="Castle Imperior logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-display text-xl font-semibold text-gold tracking-wide hidden sm:block">
            Castle Imperior
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-gold transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-sm text-gold hover:text-gold/80 transition-colors tracking-wide"
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* Auth button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className={`px-5 py-2 text-xs font-semibold tracking-widest uppercase rounded-lg transition-all duration-300 ${
              isAuthenticated
                ? "border border-gold-dim text-gold-muted hover:border-gold hover:text-gold"
                : "gold-gradient text-background hover:opacity-90"
            } disabled:opacity-50`}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Logging in...
              </span>
            ) : isAuthenticated ? (
              "Logout"
            ) : (
              "Admin Login"
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden w-9 h-9 flex items-center justify-center text-gold-muted hover:text-gold transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gold-dim bg-card px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-muted-foreground hover:text-gold transition-colors tracking-wide py-1"
            >
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onAdminClick(); }}
              className="block text-sm text-gold hover:text-gold/80 transition-colors py-1 w-full text-left"
            >
              Admin Panel
            </button>
          )}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); handleAuth(); }}
            disabled={isLoggingIn}
            className={`w-full mt-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase rounded-lg transition-all ${
              isAuthenticated
                ? "border border-gold-dim text-gold-muted"
                : "gold-gradient text-background"
            } disabled:opacity-50`}
          >
            {isLoggingIn ? "Logging in..." : isAuthenticated ? "Logout" : "Admin Login"}
          </button>
        </nav>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.30 0.08 80 / 0.15) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 48px, oklch(0.76 0.12 80 / 0.04) 48px, oklch(0.76 0.12 80 / 0.04) 49px)",
          }}
        />
      </div>

      <div className="relative z-10 space-y-6 max-w-3xl animate-fade-in-up">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold opacity-60" />
            <Crown className="w-5 h-5 text-gold" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold opacity-60" />
          </div>
        </div>

        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light tracking-wider text-foreground leading-none">
          Castle{" "}
          <span className="text-gold italic">Imperior</span>
        </h1>

        <div className="ornament max-w-sm mx-auto">
          <span className="text-xs tracking-widest uppercase text-gold-muted">Est. 2026</span>
        </div>

        <p className="text-base md:text-lg text-muted-foreground font-light tracking-wide max-w-md mx-auto">
          Luxury Timepieces, Crafted for Royalty
        </p>

        <p className="text-sm text-muted-foreground/70 font-light max-w-lg mx-auto leading-relaxed">
          Each watch in our collection is a testament to precision engineering,
          timeless elegance, and the pursuit of horological perfection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#watches"
            className="px-10 py-4 gold-gradient text-background font-semibold tracking-widest uppercase text-sm rounded-lg hover:opacity-90 transition-all duration-300 hover:shadow-gold active:scale-[0.98]"
          >
            Browse Watches
          </a>
          <a
            href="#chat"
            className="px-10 py-4 border border-gold-dim text-gold-muted hover:border-gold hover:text-gold font-semibold tracking-widest uppercase text-sm rounded-lg transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs tracking-widest uppercase text-muted-foreground">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}

// ── Watch Section ─────────────────────────────────────────────────────────────

function WatchSection({ onOrder }: { onOrder: (watch: Watch) => void }) {
  const { data: watches = [], isLoading } = useGetWatches();
  const published = watches.filter((w) => w.published);

  return (
    <section id="watches" className="py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center space-y-3 mb-16">
          <p className="text-xs tracking-widest uppercase text-gold-muted">Our Collection</p>
          <h2 className="font-display text-4xl md:text-6xl text-foreground">
            Timeless Masterpieces
          </h2>
          <div className="ornament max-w-xs mx-auto">
            <span className="text-xs text-gold-muted tracking-widest uppercase">Handcrafted Luxury</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-muted-foreground text-sm">Loading collection...</p>
          </div>
        ) : (
          <div className="pb-16">
            <WatchCarousel watches={published} onOrder={onOrder} />
          </div>
        )}
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { label: "Years of Excellence", value: "25+" },
    { label: "Timepieces Crafted", value: "1,200+" },
    { label: "Satisfied Clients", value: "800+" },
    { label: "Artisan Craftsmen", value: "40+" },
  ];

  return (
    <div className="border-y border-gold-dim bg-card/50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-display text-3xl md:text-4xl text-gold font-light">{stat.value}</p>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gold-dim py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-gold" />
            <span className="font-display text-base text-foreground">Castle Imperior</span>
          </div>
          <p>© {new Date().getFullYear()} Castle Imperior. All rights reserved.</p>
          <span className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-gold fill-gold mx-0.5" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-muted underline underline-offset-2 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [orderWatch, setOrderWatch] = useState<Watch | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const { data: isAdmin = false } = useIsAdmin();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-center" />

      <Navbar isAdmin={isAdmin} onAdminClick={() => setShowAdmin((s) => !s)} />

      <main className="flex-1">
        <Hero />
        <StatsBar />
        <WatchSection onOrder={(w) => setOrderWatch(w)} />

        {/* Admin section */}
        {isAdmin && showAdmin && <AdminPanel />}
      </main>

      <Footer />

      <ChatWidget />

      <OrderModal
        watch={orderWatch}
        open={orderWatch !== null}
        onClose={() => setOrderWatch(null)}
      />
    </div>
  );
}
