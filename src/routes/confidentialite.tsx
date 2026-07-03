import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({ meta: [{ title: "Politique de confidentialité — Memma & Maman" }] }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="3 juillet 2026">
      <h2>1. Objet</h2>
      <p>
        La présente Politique de confidentialité décrit la manière dont Memma &amp; Maman collecte,
        utilise, conserve et protège les données personnelles des utilisateurs du site www.maema.fr,
        conformément au Règlement (UE) 2016/679 (RGPD) et à la législation française applicable.
        L'utilisation du site implique l'acceptation de la présente politique.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Memma &amp; Maman — Emma Fady — Colody, 22960 Plédran, France — E-mail :{" "}
        <a href="mailto:aide@maema.fr">aide@maema.fr</a>
      </p>

      <h2>3. Données collectées</h2>
      <p><strong>Lors d'une commande :</strong></p>
      <ul>
        <li>Nom, prénom</li>
        <li>Adresse postale</li>
        <li>Adresse e-mail</li>
        <li>Numéro de téléphone (si renseigné)</li>
        <li>Détails de la commande</li>
      </ul>
      <p><strong>Lors d'un contact :</strong></p>
      <ul>
        <li>Nom</li>
        <li>Adresse e-mail</li>
        <li>Contenu du message</li>
      </ul>
      <p><strong>Données techniques :</strong> lors de votre navigation, certaines informations techniques peuvent être collectées, notamment l'adresse IP, le type de navigateur, le système d'exploitation, les pages consultées, la date et l'heure de connexion. Ces données sont utilisées pour assurer le bon fonctionnement, la sécurité et l'amélioration du site.</p>

      <h2>4. Finalités du traitement</h2>
      <ul>
        <li>Traiter les commandes</li>
        <li>Assurer la livraison</li>
        <li>Gérer le service après-vente</li>
        <li>Répondre aux demandes envoyées via le formulaire de contact</li>
        <li>Prévenir les fraudes</li>
        <li>Respecter les obligations comptables, fiscales et légales</li>
        <li>Améliorer le fonctionnement du site</li>
      </ul>

      <h2>5. Base juridique du traitement</h2>
      <p>Les traitements reposent notamment sur l'exécution du contrat de vente, le respect des obligations légales, l'intérêt légitime de Memma &amp; Maman (sécurité, prévention de la fraude, amélioration des services), et votre consentement lorsque celui-ci est requis (par exemple pour certains cookies).</p>

      <h2>6. Paiement sécurisé</h2>
      <p>Les paiements sont réalisés via <strong>Stripe</strong>. Les informations bancaires sont traitées directement par Stripe. Memma &amp; Maman n'a jamais accès aux numéros de carte bancaire complets et ne les conserve pas.</p>

      <h2>7. Destinataires des données</h2>
      <p>Les données peuvent être transmises uniquement aux prestataires nécessaires au fonctionnement de la boutique, notamment Stripe (paiement), les transporteurs (Mondial Relay, Chronopost) pour la livraison, l'hébergeur du site, et les autorités administratives lorsque la loi l'impose. Ces destinataires ne reçoivent que les informations strictement nécessaires à l'exécution de leurs missions.</p>

      <h2>8. Durée de conservation</h2>
      <p>Les données sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées. Certaines informations peuvent être conservées plus longtemps afin de respecter les obligations comptables, fiscales ou légales.</p>

      <h2>9. Sécurité</h2>
      <p>Memma &amp; Maman met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données personnelles contre tout accès non autorisé, perte, altération ou divulgation. Toutefois, aucun système informatique ne peut garantir une sécurité absolue.</p>

      <h2>10. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez notamment des droits d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition, et de portabilité de vos données lorsque la loi le prévoit. Vous pouvez exercer ces droits en écrivant à <a href="mailto:aide@maema.fr">aide@maema.fr</a>. Une réponse vous sera apportée dans les meilleurs délais et, au plus tard, dans les délais prévus par la réglementation.</p>

      <h2>11. Réclamation</h2>
      <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'autorité de contrôle compétente.</p>

      <h2>12. Modification de la politique</h2>
      <p>Memma &amp; Maman se réserve le droit de modifier la présente Politique de confidentialité à tout moment afin de tenir compte des évolutions légales, réglementaires ou techniques. La version en vigueur est celle publiée sur le site au jour de la consultation.</p>
    </LegalLayout>
  );
}
