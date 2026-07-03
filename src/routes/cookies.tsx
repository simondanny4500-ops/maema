import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Politique de cookies — Memma & Maman" }] }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalLayout title="Politique de cookies" updated="3 juillet 2026">
      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier enregistré sur votre appareil (ordinateur, tablette ou
        smartphone) lors de votre navigation sur le site www.maema.fr. Les cookies permettent
        notamment d'assurer le bon fonctionnement du site, de mémoriser certaines informations et,
        selon les cas, de mesurer l'audience ou d'améliorer l'expérience utilisateur.
      </p>

      <h2>2. Les cookies utilisés</h2>
      <p><strong>Cookies strictement nécessaires</strong> — indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils permettent notamment la navigation sur le site, la sécurisation des commandes, le fonctionnement du panier, et le traitement des paiements.</p>
      <p><strong>Cookies de mesure d'audience</strong> (si activés) — permettent de mesurer la fréquentation du site afin d'améliorer son contenu et ses performances. Ils ne sont déposés qu'après votre consentement lorsque celui-ci est requis.</p>
      <p><strong>Cookies de services tiers</strong> — certains services utilisés sur le site (par exemple le paiement sécurisé via Stripe) peuvent déposer leurs propres cookies conformément à leur politique de confidentialité.</p>

      <h2>3. Gestion des cookies</h2>
      <p>Lors de votre première visite, un bandeau vous permet d'accepter les cookies, de les refuser lorsqu'ils nécessitent votre consentement, ou de personnaliser vos choix. Vous pouvez également modifier vos préférences à tout moment via les paramètres de votre navigateur ou le gestionnaire de consentement mis à disposition sur le site.</p>

      <h2>4. Contact</h2>
      <p>Pour toute question concernant cette politique : <a href="mailto:aide@maema.fr">aide@maema.fr</a></p>
    </LegalLayout>
  );
}
