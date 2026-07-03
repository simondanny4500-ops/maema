import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/retractation")({
  head: () => ({ meta: [{ title: "Formulaire de rétractation — Memma & Maman" }] }),
  component: Retractation,
});

function Field({ label }: { label: string }) {
  return (
    <div className="mb-4">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1 border-b border-border py-2.5">&nbsp;</div>
    </div>
  );
}

function Retractation() {
  return (
    <LegalLayout title="Formulaire de rétractation">
      <p>À compléter uniquement si vous souhaitez exercer votre droit de rétractation.</p>

      <div className="p-6 bg-muted/40 border border-border not-prose">
        <p className="mb-1"><strong>À envoyer à :</strong></p>
        <p>Memma &amp; Maman</p>
        <p>Colody</p>
        <p>22960 Plédran – France</p>
        <p>
          E-mail : <a href="mailto:aide@maema.fr">aide@maema.fr</a>
        </p>
      </div>

      <p className="pt-4">
        Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien
        suivant :
      </p>

      <div className="pt-2">
        <Field label="Produit(s) concerné(s)" />
        <Field label="Numéro de commande" />
        <Field label="Commandé le" />
        <Field label="Reçu le" />
        <Field label="Nom du client" />
        <Field label="Adresse du client" />
        <Field label="Date" />
        <Field label="Signature (uniquement en cas d'envoi papier)" />
      </div>

      <p className="text-sm text-muted-foreground pt-2">
        Merci d'envoyer ce formulaire complété par e-mail à{" "}
        <a href="mailto:aide@maema.fr">aide@maema.fr</a>, en précisant vos coordonnées et votre numéro
        de commande.
      </p>
    </LegalLayout>
  );
}
