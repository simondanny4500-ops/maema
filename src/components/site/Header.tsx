import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, User, X, Heart, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchOverlay } from "@/components/site/SearchOverlay";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";

const NAV = [
  { to: "/boutique", label: "Boutique" },
  { to: "/promotions", label: "Promotions" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);
  const router = useRouter();

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 500);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // close mobile menu on navigation
    const unsub = router.subscribe("onLoad", () => setOpen(false));
    return unsub;
  }, [router]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_20px_-10px_rgba(120,90,50,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-6 px-5 md:px-10 h-20 md:h-24">
        <button
          type="button"
          className="md:hidden text-foreground/70 hover:text-primary transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="hidden md:flex items-center gap-9 text-sm font-medium tracking-wide">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="link-elegant text-foreground/70 hover:text-primary transition-colors duration-300 relative
                after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-primary
                after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-500"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <Logo className="text-lg md:text-xl" />
        </Link>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-foreground/70 hover:text-primary transition-colors"
            aria-label="Rechercher"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link
            to={user ? "/compte" : "/auth"}
            className="text-foreground/70 hover:text-primary transition-colors"
            aria-label={user ? "Mon compte" : "Se connecter"}
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link
            to="/favoris"
            className="relative hidden sm:inline-flex text-foreground/70 hover:text-primary transition-colors"
            aria-label="Mes favoris"
          >
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/panier"
            className="relative text-foreground/70 hover:text-primary transition-colors"
            aria-label="Panier"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${bump ? "scale-125 text-primary" : "scale-100"}`}
            />
            {count > 0 && (
              <span
                className={`absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center transition-transform duration-300 ${
                  bump ? "scale-125" : "scale-100"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md animate-fade">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-3 px-2 text-foreground/80 hover:text-primary border-b border-border/30"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/favoris"
              className="py-3 px-2 text-foreground/80 hover:text-primary border-b border-border/30 flex items-center justify-between"
            >
              Mes favoris
              {wishlistCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
