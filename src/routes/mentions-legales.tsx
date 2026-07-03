import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({ meta: [{ title: "Mentions légales — Memma & Maman" }] }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" updated="3 juillet 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site internet <strong>www.maema.fr</strong> est édité par :
      </p>
      <ul>
        <li><strong>Nom commercial :</strong> Memma &amp; Maman</li>
        <li><strong>Exploitant :</strong> Emma Fady</li>
        <li><strong>Statut juridique :</strong> Entrepreneur individuel – Micro-entreprise</li>
        <li><strong>Adresse :</strong> Colody, 22960 Plédran, France</li>
        <li><strong>E-mail :</strong> <a href="mailto:aide@maema.fr">aide@maema.fr</a></li>
        <li><strong>SIRET :</strong> 105 556 203 00013</li>
      </ul>
      <p>
        <strong>TVA non applicable – article 293 B du Code général des impôts.</strong>
      </p>

      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina, CA 91723,
        États-Unis. Site internet : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.
      </p>

      <h2>3. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est <strong>Emma Fady</strong>. Pour toute question relative au
        site, vous pouvez contacter <a href="mailto:aide@maema.fr">aide@maema.fr</a>.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments présents sur le site www.maema.fr, notamment les textes, photographies,
        illustrations, logos, graphismes, vidéos, bases de données ainsi que leur mise en page sont
        protégés par les dispositions du Code de la propriété intellectuelle. Toute reproduction,
        représentation, modification, diffusion ou exploitation, totale ou partielle, sans autorisation
        écrite préalable de Memma &amp; Maman est strictement interdite.
      </p>

      <h2>5. Disponibilité du site</h2>
      <p>
        Memma &amp; Maman met tout en œuvre afin d'assurer l'accessibilité du site. Toutefois, le site
        peut être momentanément indisponible notamment pour des raisons de maintenance, de mise à jour
        ou en cas d'événements indépendants de sa volonté. La responsabilité de Memma &amp; Maman ne
        pourra être engagée à ce titre.
      </p>

      <h2>6. Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites internet tiers. Memma &amp; Maman ne peut être
        tenue responsable du contenu, du fonctionnement ou de la politique de confidentialité de ces
        sites externes.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Les traitements de données personnelles réalisés sur le site sont décrits dans la{" "}
        <a href="/confidentialite">Politique de confidentialité</a> disponible sur www.maema.fr.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Le site utilise des cookies nécessaires à son fonctionnement. Lorsque des cookies nécessitant
        le consentement de l'utilisateur sont utilisés (par exemple des cookies de mesure d'audience ou
        de marketing), un bandeau d'information permet à l'utilisateur de les accepter, de les refuser
        ou de personnaliser ses choix. Voir notre <a href="/cookies">Politique de cookies</a>.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. Tout litige relatif à leur
        interprétation ou à leur exécution sera soumis aux juridictions compétentes conformément aux
        dispositions légales applicables.
      </p>
    </LegalLayout>
  );
}
