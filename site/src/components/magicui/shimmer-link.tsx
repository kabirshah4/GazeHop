// Adapted from Magic UI's ShimmerButton (https://magicui.design, MIT License) as an <a>,
// because download and GitHub actions are links, not buttons.
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  shimmerColor?: string;
  background?: string;
  borderRadius?: string;
  children: ReactNode;
};

export function ShimmerLink({ shimmerColor = "#FFFFFF", background = "linear-gradient(180deg,#F4F6F9 0%,#D3DAE4 100%)", borderRadius = "12px", className, children, ...props }: Props) {
  return (
    <a
      style={{ "--spread": "90deg", "--shimmer-color": shimmerColor, "--radius": borderRadius, "--speed": "3s", "--cut": "0.06em", "--bg": background } as CSSProperties}
      className={cn(
        "group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden [border-radius:var(--radius)] border border-white/40 px-6 py-3.5 font-semibold whitespace-nowrap text-[#0B0F19] shadow-[0_10px_30px_-12px_rgba(200,214,232,.45)] [background:var(--bg)]",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
        className,
      )}
      {...props}
    >
      <div className="@container-[size] absolute inset-0 -z-30 overflow-visible blur-[2px]">
        <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>
      {children}
      <div className="absolute inset-0 size-full rounded-2xl shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]" />
      <div className="absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]" />
    </a>
  );
}
