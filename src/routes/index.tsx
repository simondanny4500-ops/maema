import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";
import { useParallax } from "@/hooks/use-parallax";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";
import hero from "@/assets/hero.jpg";
import catParfums from "@/assets/cat-parfums.jpg";
import catSoins from "@/assets/cat-soins.jpg";
import catMaquillage from "@/assets/cat-maquillage.jpg";
import catCoffrets from "@/assets/cat-coffrets.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const CATEGORIES = [
  { slug: "parfums", name: "Parfums", image: catParfums },
  { slug: "coffrets", name: "Coffrets", image: catCoffrets },
  { slug: "nouveautes", name: "Nouveautés", image: catSoins },
  { slug: "best-sellers", name: "Best Sellers", image: catMaquillage },
];


function BrandStorySection({ image }: { image: string }) {
  const imgRef = useParallax<HTMLImageElement>(0.3);

  return (
    <section className="relative min-h-[85vh] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <img ref={imgRef} src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 md:px-10 text-center text-white reveal">
        <p className="text-xs uppercase tracking-[0.35em] text-[oklch(0.85_0.08_80)] mb-5">
          L'histoire Memma &amp; Maman
        </p>
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Le parfum rare, <em className="text-[oklch(0.85_0.08_80)]">réinventé</em>.
        </h2>
        <p className="mt-8 text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
          Née de la passion d'une mère et de sa fille pour les grandes fragrances,
          Memma & Maman crée avec ses partenaires parfumeurs européens des parfums d'inspiration
          fidèles aux plus beaux classiques — à un prix qui rend enfin le luxe accessible.
        </p>

        <Link
          to="/a-propos"
          className="inline-block mt-10 text-[oklch(0.85_0.08_80)] uppercase text-xs tracking-[0.25em] font-semibold border-b border-[oklch(0.85_0.08_80)] pb-1 hover:pb-2 transition-all"
        >
          En savoir plus
        </Link>
      </div>
    </section>
  );
}

function Home() {
  const heroImgRef = useParallax<HTMLImageElement>(0.25);
  const [heroFade, setHeroFade] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const vh = window.innerHeight;
        setHeroFade(Math.min(1, window.scrollY / (vh * 0.7)));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,price,sale_price,images,is_new")
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(8);
      return data ?? [];
    },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={heroImgRef}
            src={hero}
            alt=""
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-10 min-h-[92vh] flex items-center">
          <div
            className="max-w-xl animate-rise"
            style={{
              opacity: 1 - heroFade,
              transform: `translateY(${heroFade * 40}px)`,
            }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-6">
              Parfums d'inspiration · Édition confidentielle
            </p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-foreground">
              Le parfum,
              <br />
              <span className="italic text-primary">à prix</span> juste.
            </h1>
            <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-md leading-relaxed">
              Des fragrances d'inspiration, créées en Europe, qui rappellent les plus grands classiques
              de la parfumerie — à une fraction du prix, sans compromis sur la tenue.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/boutique"
                className="btn-press group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)]"
              >
                Découvrir la boutique
                <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/promotions"
                className="btn-press inline-flex items-center gap-3 border border-foreground/30 px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:border-primary hover:text-primary"
              >
                Les promotions
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* USP BAR */}
      <section className="border-y border-border/60 bg-[oklch(0.97_0.012_75)] reveal">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, title: "Livraison offerte", sub: "Dès 50 € d'achat" },
            { icon: ShieldCheck, title: "Paiement sécurisé", sub: "CB, Apple Pay, PayPal" },
            { icon: Sparkles, title: "Fragrances européennes", sub: "Formulées & conformes IFRA" },
            { icon: Heart, title: "Sélection cocooning", sub: "Choisie avec soin" },
          ].map((u) => (

            <div key={u.title} className="flex flex-col items-center gap-2">
              <u.icon size={22} className="text-primary" strokeWidth={1.4} />
              <p className="text-sm font-medium">{u.title}</p>
              <p className="text-xs text-muted-foreground">{u.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-24">
        <div className="text-center mb-14 reveal">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Nos univers</p>
          <h2 className="font-serif text-4xl md:text-5xl">Explorer par catégorie</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/boutique"
              search={{ cat: c.slug }}
              className="group relative overflow-hidden aspect-[3/4] block reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                <h3 className="font-serif text-2xl md:text-3xl">{c.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-widest opacity-80 flex items-center gap-2">
                  Découvrir <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
          <div className="text-center mb-14 reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Coup de cœur</p>
            <h2 className="font-serif text-4xl md:text-5xl">Notre sélection</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {featured.map((p, i) => (
              <div key={p.id} className="reveal" style={{ transitionDelay: `${Math.min(i * 90, 360)}ms` }}>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-3 border border-primary text-primary px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Voir toute la boutique
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* BRAND STORY — full-bleed editorial block */}
      <BrandStorySection image={catParfums} />
    </>
  );
}
