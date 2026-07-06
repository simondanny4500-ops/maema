import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { IntroAnimation } from "@/components/site/IntroAnimation";
import { CookieBanner } from "@/components/site/CookieBanner";



function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center animate-rise">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Erreur 404</p>
        <h1 className="font-serif text-5xl text-foreground">Page introuvable</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-[color:var(--gold-deep)] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">Une erreur est survenue</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="bg-primary text-primary-foreground px-6 py-2.5 text-sm uppercase tracking-widest hover:bg-[color:var(--gold-deep)] transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="border border-border px-6 py-2.5 text-sm uppercase tracking-widest hover:bg-muted transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Memma & Maman — Parfums, soins & maquillage à prix déstockés" },
      { name: "description", content: "Découvrez notre sélection premium de parfums, soins de beauté et maquillage à prix déstockés. Livraison offerte dès 50€. Paiement sécurisé." },
      { name: "author", content: "Memma & Maman" },
      { property: "og:title", content: "Memma & Maman — Beauté premium à prix déstockés" },
      { property: "og:description", content: "Parfums, soins et maquillage haut de gamme, sélectionnés avec amour, à prix réduits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#fdf9f3" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname === "/auth";
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      {!isAuth && <Footer />}
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useScrollReveal();


  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <IntroAnimation />
          <SiteChrome>
            <Outlet />
          </SiteChrome>
          <Toaster />
          <CookieBanner />
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );

}
