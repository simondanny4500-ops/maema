import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <section className="max-w-3xl mx-auto px-5 md:px-10 py-20 md:py-28">
      <h1 className="font-serif text-4xl md:text-5xl mb-2">{title}</h1>
      {updated && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-12">
          Dernière mise à jour : {updated}
        </p>
      )}
      <div className="space-y-6 text-[15px] leading-relaxed text-foreground/80 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
