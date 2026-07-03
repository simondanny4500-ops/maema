import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { useParallax } from "@/hooks/use-parallax";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Memma & Maman | Parfums d'inspiration" },
      { name: "description", content: "L'histoire de Memma & Maman, maison familiale de parfums d'inspiration formulés en Europe, à prix juste." },
    ],
  }),
  component: About,
});

function About() {
  const imgRef = useParallax<HTMLImageElement>(0.25);

  return (
    <>
      <section className="relative h-[60vh] overflow-hidden">
        <img ref={imgRef} src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative h-full flex items-center justify-center text-center text-white px-5">
          <div className="animate-rise">
            <p className="text-xs uppercase tracking-[0.3em] mb-4">Notre histoire</p>
            <h1 className="font-serif text-5xl md:text-7xl">Une passion, deux générations.</h1>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 md:px-10 py-24 space-y-10 text-lg leading-relaxed text-foreground/80">
        <p className="reveal">
          <span className="font-serif text-3xl text-primary">M</span>emma & Maman est née d'une évidence :
          celle qui unit une mère et sa fille autour d'un rituel qui traverse le temps —
          se parfumer, se sentir belle, s'offrir un moment précieux.
        </p>
        <p className="reveal">
          Nous avons imaginé cette maison comme un écrin de <strong>parfums d'inspiration</strong> :
          des fragrances originales, créées avec nos partenaires parfumeurs européens, qui rappellent
          fidèlement les plus grands classiques de la parfumerie — sans jamais en copier le nom,
          le flacon ou l'identité.
        </p>
        <p className="reveal">
          Nos parfums sont formulés en Europe, respectent la réglementation IFRA et cosmétique
          européenne, et sont proposés à un prix juste — parce que se parfumer avec élégance
          ne devrait jamais être un luxe inaccessible.
        </p>
        <p className="reveal text-sm text-foreground/60 italic">
          Memma & Maman ne commercialise aucun parfum officiel de marque de luxe, ni aucune
          contrefaçon. Toutes nos créations sont indépendantes, légales et déclarées.
        </p>
        <div className="divider-gold reveal" />
        <blockquote className="reveal font-serif text-2xl md:text-3xl italic text-center text-foreground/90 leading-snug">
          « Se parfumer, c'est un acte d'amour. »
        </blockquote>
        <p className="text-center text-sm uppercase tracking-widest text-primary">— Memma & Maman</p>
      </section>
    </>
  );
}
