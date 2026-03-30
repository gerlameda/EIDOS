"use client";

interface AnchorDisplayProps {
  area: string;
  score: number;
  headline: string;
  subtext: string;
}

function barColor(score: number): string {
  if (score <= 35) return "rgba(240, 237, 232, 0.35)";
  if (score <= 60) return "#C9A84C";
  return "#22D3EE";
}

export function AnchorDisplay({
  area,
  score,
  headline,
  subtext,
}: AnchorDisplayProps) {
  return (
    <section className="space-y-6">
      <div className="text-xs uppercase tracking-[0.2em] text-accent-gold/80">
        {area}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${score}%`, backgroundColor: barColor(score) }}
            />
          </div>
          <span className="w-8 text-right text-sm font-semibold tabular-nums text-text-primary">
            {score}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold leading-tight text-text-primary">
          {headline}
        </h2>
        <p className="text-sm text-text-muted md:text-base">{subtext}</p>
      </div>
    </section>
  );
}

