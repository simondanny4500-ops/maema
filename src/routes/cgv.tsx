import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/cgv")({
  head: () => ({ meta: [{ title: "Conditions Générales de Vente — Memma & Maman" }] }),
  component: CGV,
});

function CGV() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updated="3 juillet 2026">
      <h2>Article 1 – Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (ci-après les « CGV ») ont pour objet de définir
        les droits et obligations de Memma &amp; Maman, exploitée par Emma Fady, micro-entrepreneur, et
        de tout consommateur effectuant un achat sur le site www.maema.fr. Toute commande passée sur le
        site implique l'acceptation pleine et entière des présentes CGV. Les présentes CGV sont
        accessibles à tout moment sur le site Internet.
      </p>

      <h2>Article 2 – Identité du vendeur</h2>
      <ul>
        <li><strong>Nom commercial :</strong> Memma &amp; Maman</li>
        <li><strong>Entrepreneur :</strong> Emma Fady</li>
        <li><strong>Adresse :</strong> Colody, 22960 Plédran, France</li>
        <li><strong>E-mail :</strong> <a href="mailto:aide@maema.fr">aide@maema.fr</a></li>
        <li><strong>Site internet :</strong> www.maema.fr</li>
        <li><strong>Statut :</strong> Micro-entrepreneur</li>
        <li><strong>SIRET :</strong> 105 556 203 00013</li>
        <li><strong>TVA :</strong> TVA non applicable – article 293 B du CGI</li>
      </ul>

      <h2>Article 3 – Produits</h2>
      <p>
        Memma &amp; Maman commercialise exclusivement des parfums authentiques destinés à une
        clientèle de particuliers. Les produits proposés sont décrits avec le plus grand soin. Les
        photographies, illustrations et visuels présents sur le site sont fournis à titre indicatif.
        Certaines photographies sont réalisées par Memma &amp; Maman tandis que d'autres proviennent
        des fournisseurs ou fabricants. En conséquence, de légères différences de présentation, de
        packaging ou d'étiquetage peuvent exister selon les séries de fabrication sans que cela
        n'affecte la conformité du produit. Tous les produits vendus sont neufs et livrés dans leur
        emballage d'origine sous blister, sauf mention contraire indiquée sur la fiche produit.
      </p>

      <h2>Article 4 – Disponibilité</h2>
      <p>
        Les offres de produits sont valables tant qu'elles sont visibles sur le site et dans la limite
        des stocks disponibles. En cas d'indisponibilité après validation d'une commande, Memma &amp;
        Maman informera le client dans les meilleurs délais. Le client pourra alors choisir :
      </p>
      <ul>
        <li>le remboursement intégral des sommes versées ;</li>
        <li>le remplacement par un produit équivalent lorsque cela est possible ;</li>
        <li>ou attendre le réapprovisionnement du produit.</li>
      </ul>

      <h2>Article 5 – Prix</h2>
      <p>
        Les prix affichés sur le site sont exprimés en euros (€). Ils sont indiqués toutes taxes
        comprises lorsque la TVA est applicable. Lorsque l'entreprise bénéficie du régime de franchise
        en base de TVA, la mention suivante s'applique : <strong>TVA non applicable – article 293 B du
        Code général des impôts.</strong> Les frais de livraison sont indiqués avant la validation
        définitive de la commande. À ce jour, les frais standards de livraison sont fixés à 4,90 € pour
        la France métropolitaine. Memma &amp; Maman se réserve le droit de modifier ses prix à tout
        moment. Toutefois, le prix appliqué reste celui affiché au moment de la validation de la
        commande.
      </p>

      <h2>Article 6 – Commande</h2>
      <p>
        Le client sélectionne les produits qu'il souhaite acheter. Avant validation, un récapitulatif
        complet de la commande lui est présenté. La commande devient définitive après validation du
        panier, acceptation des présentes CGV, et paiement effectif de la commande. Une confirmation
        est ensuite envoyée par courrier électronique. Memma &amp; Maman se réserve le droit de refuser
        ou d'annuler toute commande en cas notamment de suspicion de fraude, d'utilisation frauduleuse
        d'un moyen de paiement, d'informations manifestement erronées, ou de comportement abusif d'un
        client.
      </p>

      <h2>Article 7 – Paiement</h2>
      <p>
        Le paiement est exigible immédiatement lors de la commande. Les paiements sont entièrement
        sécurisés par Stripe. Les moyens de paiement acceptés sont notamment la carte bancaire (Visa,
        Mastercard…), Apple Pay (si disponible), Google Pay (si disponible), et le paiement en
        plusieurs fois lorsque cette option est proposée par Stripe et que le client y est éligible.
        Aucun paiement par PayPal n'est accepté. Les données bancaires ne transitent jamais par les
        serveurs de Memma &amp; Maman.
      </p>

      <h2>Article 8 – Livraison</h2>
      <p>
        Les livraisons sont effectuées exclusivement en France métropolitaine. Les commandes sont
        généralement expédiées sous 24 à 48 heures ouvrées, hors périodes exceptionnelles. Les
        livraisons sont assurées par Mondial Relay et Chronopost. Les délais de transport sont donnés à
        titre indicatif. Memma &amp; Maman ne pourra être tenue responsable des retards imputables au
        transporteur. En cas d'erreur d'adresse communiquée par le client, les frais liés à une
        nouvelle expédition seront intégralement à sa charge. Si un colis est retourné à Memma &amp;
        Maman faute d'avoir été récupéré dans les délais impartis par le transporteur ou le point
        relais, le client pourra demander une nouvelle expédition après règlement des nouveaux frais de
        livraison.
      </p>

      <h2>Article 9 – Droit de rétractation</h2>
      <p>
        Conformément aux articles L.221-18 et suivants du Code de la consommation, le client
        consommateur dispose d'un délai de quatorze (14) jours calendaires à compter de la réception de
        sa commande pour exercer son droit de rétractation, sans avoir à motiver sa décision. Pour
        exercer ce droit, le client doit adresser sa demande à l'adresse électronique{" "}
        <a href="mailto:aide@maema.fr">aide@maema.fr</a> ou utiliser le{" "}
        <a href="/retractation">formulaire de rétractation</a> mis à sa disposition sur le site. Les
        produits doivent être retournés dans leur état d'origine, complets, non utilisés et
        accompagnés de leur emballage d'origine. Les frais de retour sont à la charge du client. Le
        remboursement est effectué dans un délai maximal de quatorze (14) jours suivant la récupération
        des produits ou la réception d'une preuve d'expédition, selon la première de ces deux dates.
      </p>

      <h2>Article 10 – Produits ouverts ou descellés</h2>
      <p>
        Pour des raisons d'hygiène et de protection de la santé, les produits qui ont été ouverts,
        utilisés ou descellés après la livraison et qui ne peuvent plus être remis en vente dans des
        conditions normales ne pourront pas faire l'objet d'un retour lorsque la loi autorise cette
        exclusion du droit de rétractation. Cette disposition ne prive pas le client de ses droits au
        titre des garanties légales lorsqu'un produit est défectueux ou non conforme.
      </p>

      <h2>Article 11 – Produit endommagé ou erreur de commande</h2>
      <p>
        Le client est invité à vérifier l'état du colis dès sa réception. En cas de produit reçu cassé,
        endommagé, incomplet ou différent de celui commandé, le client doit contacter Memma &amp; Maman
        dans les meilleurs délais en joignant, lorsque cela est possible, des photographies permettant
        de constater le problème. Après vérification, le client pourra, selon les circonstances,
        obtenir le remplacement du produit ou demander son remboursement.
      </p>

      <h2>Article 12 – Garanties légales</h2>
      <p>
        Les produits vendus bénéficient des garanties légales prévues par le droit français, notamment
        la garantie légale de conformité et la garantie contre les vices cachés. Ces garanties
        s'appliquent indépendamment de toute garantie commerciale éventuellement proposée. Le client
        conserve l'ensemble des droits qui lui sont reconnus par la législation applicable.
      </p>

      <h2>Article 13 – Responsabilité</h2>
      <p>
        Memma &amp; Maman s'engage à mettre en œuvre tous les moyens raisonnables afin d'assurer la
        bonne exécution des commandes. La responsabilité de Memma &amp; Maman ne pourra être engagée
        lorsque le dommage résulte notamment d'une mauvaise utilisation du produit par le client, d'un
        non-respect des recommandations du fabricant, d'informations erronées fournies par le client,
        ou d'un retard ou d'une défaillance imputable au transporteur ou à un tiers. Les dispositions du
        présent article ne limitent pas les droits dont bénéficie le consommateur en vertu des
        dispositions légales impératives.
      </p>

      <h2>Article 14 – Force majeure</h2>
      <p>
        Memma &amp; Maman ne pourra être tenue responsable d'un retard ou d'une impossibilité
        d'exécution résultant d'un événement indépendant de sa volonté, notamment en cas de catastrophe
        naturelle, incendie, grève générale, interruption des réseaux de transport, décision
        administrative, pandémie ou tout autre événement présentant les caractéristiques de la force
        majeure au sens du droit français. L'exécution des obligations sera suspendue pendant toute la
        durée de l'événement.
      </p>

      <h2>Article 15 – Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments présents sur le site www.maema.fr, notamment les textes,
        photographies, logos, graphismes, illustrations, vidéos, bases de données et éléments visuels,
        est protégé par les dispositions relatives à la propriété intellectuelle. Toute reproduction,
        représentation, diffusion ou utilisation, totale ou partielle, sans autorisation préalable
        écrite de Memma &amp; Maman est interdite.
      </p>

      <h2>Article 16 – Données personnelles</h2>
      <p>
        Les données personnelles collectées sont traitées conformément à la{" "}
        <a href="/confidentialite">Politique de confidentialité</a> disponible sur le site. Elles sont
        utilisées exclusivement pour le traitement des commandes, la gestion de la relation client, le
        respect des obligations légales, et l'amélioration des services proposés. Les paiements sont
        traités de manière sécurisée par Stripe. Les données bancaires ne sont pas conservées par Memma
        &amp; Maman.
      </p>

      <h2>Article 17 – Médiation de la consommation</h2>
      <p>
        En cas de litige, le client est invité à contacter en priorité Memma &amp; Maman afin de
        rechercher une solution amiable. Conformément aux dispositions du Code de la consommation, le
        consommateur pourra, si aucun accord n'est trouvé, recourir gratuitement à un médiateur de la
        consommation dont les coordonnées seront communiquées par Memma &amp; Maman après adhésion à un
        dispositif de médiation agréé.
      </p>

      <h2>Article 18 – Droit applicable</h2>
      <p>
        Les présentes Conditions Générales de Vente sont régies par le droit français. En cas de
        litige, les parties rechercheront en priorité une solution amiable. À défaut d'accord amiable,
        les juridictions françaises seront seules compétentes dans les conditions prévues par les
        dispositions légales applicables.
      </p>

      <h2>Entrée en vigueur</h2>
      <p>
        Les présentes Conditions Générales de Vente entrent en vigueur à compter de leur publication
        sur le site www.maema.fr et demeurent applicables jusqu'à leur modification ou leur
        remplacement.
      </p>
    </LegalLayout>
  );
}
