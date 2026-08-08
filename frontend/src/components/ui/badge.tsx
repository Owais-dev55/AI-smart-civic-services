import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-all",
  {
    variants: {
      variant: {
        default: "border-blue-500/30 bg-blue-500/15 text-blue-400 shadow-sm",
        secondary: "border-white/10 bg-slate-800/80 text-slate-300",
        destructive: "border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-sm",
        outline: "border-white/10 text-slate-300 bg-white/5",
        critical: "border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-sm shadow-rose-500/10",
        high: "border-orange-500/40 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10",
        medium: "border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10",
        low: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10",
        open: "border-slate-500/30 bg-slate-500/15 text-slate-400",
        assigned: "border-purple-500/30 bg-purple-500/15 text-purple-300",
        inprogress: "border-blue-500/30 bg-blue-500/15 text-blue-400",
        resolved: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
