import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Memma & Maman | Parfums d'inspiration" },
      { name: "description", content: "Toutes les réponses à vos questions sur nos parfums d'inspiration, les commandes, livraisons et retours Memma & Maman." },
    ],
  }),
  component: FAQ,
});

const QA = [
  {
    q: "Vendez-vous de vrais parfums de marques de luxe ?",
    a: "Non. Memma & Maman ne vend aucun parfum officiel de marque, ni contrefaçon. Nous proposons exclusivement des parfums d'inspiration (aussi appelés « dupes ») : des fragrances originales, créées par nos partenaires parfumeurs, qui reprennent les accords olfactifs de grands classiques de la parfumerie à un prix accessible.",
  },
  {
    q: "Qu'est-ce qu'un parfum d'inspiration ?",
    a: "Un parfum d'inspiration reproduit l'univers olfactif d'un parfum de niche ou de luxe (les mêmes familles, les mêmes notes de tête, de cœur et de fond) tout en étant une création indépendante. Le flacon, le nom et la marque sont différents — seule l'inspiration olfactive est commune.",
  },
  {
    q: "Vos parfums sont-ils légaux ?",
    a: "Oui, totalement. Nos fragrances sont formulées en Europe, respectent la réglementation IFRA et cosmétique européenne (règlement CE 1223/2009), et ne reproduisent ni le nom, ni le flacon, ni l'identité visuelle d'aucune marque protégée. Il s'agit de créations légitimes, transparentes et déclarées.",
  },
  {
    q: "Pourquoi vos prix sont-ils aussi bas ?",
    a: "Nous ne payons ni licence de marque de luxe, ni campagnes publicitaires massives, ni distribution en boutiques prestige. L'essentiel du budget passe dans la qualité de la fragrance — pas dans son marketing.",
  },
  {
    q: "Quelle est la tenue d'un parfum d'inspiration ?",
    a: "Nos parfums sont composés en eau de parfum (EDP) avec une belle concentration en huiles essentielles. La tenue varie selon la peau, mais dépasse en moyenne 6 à 8 heures, avec un sillage élégant.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Nos commandes sont expédiées sous 24 à 48 h ouvrées. Comptez ensuite 2 à 4 jours ouvrés en France métropolitaine.",
  },
  {
    q: "La livraison est-elle offerte ?",
    a: "Oui, la livraison est offerte dès 50 € d'achat en France métropolitaine. En dessous, elle est facturée 4,90 €.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Vous disposez de 14 jours après réception pour nous retourner un produit non ouvert et en parfait état. Les frais de retour sont à votre charge.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Carte bancaire (Visa, Mastercard, American Express), Apple Pay, Google Pay et PayPal, via Stripe. Toutes les transactions sont sécurisées.",
  },
  {
    q: "Puis-je modifier ma commande ?",
    a: "Contactez-nous rapidement à contact@memmaetmaman.com. Si la commande n'est pas encore expédiée, nous ferons notre possible.",
  },
];

function FAQ() {
  return (
    <section className="max-w-3xl mx-auto px-5 md:px-10 py-20">
      <div className="text-center mb-10 animate-rise">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Questions fréquentes</p>
        <h1 className="font-serif text-5xl md:text-6xl">FAQ</h1>
      </div>

      <div className="reveal flex items-start gap-3 border border-primary/30 bg-primary/5 rounded p-5 mb-10">
        <Info size={18} className="text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-semibold text-primary">Bon à savoir —</span> Memma & Maman propose exclusivement
          des <strong>parfums d'inspiration</strong> (dupes), créés en Europe. Nous ne vendons aucun parfum
          officiel de marque de luxe, ni aucune contrefaçon.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {QA.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="reveal border-b border-border"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <AccordionTrigger className="text-left font-serif text-lg md:text-xl hover:text-primary transition-colors">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/70 text-base leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
