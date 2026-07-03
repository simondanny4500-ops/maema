import { cn } from "@/lib/utils";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-serif select-none whitespace-nowrap",
        className,
      )}
    >
      <span className="uppercase tracking-[0.18em]">Memma</span>
      <span className="text-primary not-italic opacity-80">&amp;</span>
      <span className="uppercase tracking-[0.18em]">Maman</span>
    </span>
  );
}
