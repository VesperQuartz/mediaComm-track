import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  sub: string;
  color?: "blue" | "green" | "amber" | "red";
}

export const StatTile = ({ label, value, sub, color }: StatTileProps) => (
  <div
    className={cn(
      "rounded-2xl border-l-4 bg-white p-4 py-5 shadow-sm transition-transform hover:-translate-y-0.5",
      color === "blue"
        ? "border-track-blue"
        : color === "green"
          ? "border-track-green"
          : color === "amber"
            ? "border-track-amber"
            : color === "red"
              ? "border-track-red"
              : "border-track-red",
    )}
  >
    <div className="mb-1 text-[10px] font-semibold tracking-wider text-track-soft uppercase">
      {label}
    </div>
    <div className="font-serif text-3xl leading-none font-bold text-track-dark">
      {value}
    </div>
    <div className="mt-1 text-[10px] text-track-soft">{sub}</div>
  </div>
);
