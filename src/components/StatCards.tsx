import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatSemantic = 'danger' | 'success' | 'warning' | 'info';
export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendSentiment = 'positive' | 'negative' | 'neutral';

export interface StatCard {
  label: string;
  value: string | number;
  subtext: string;
  trend: {
    delta: string;
    direction: TrendDirection;

    sentiment: TrendSentiment;
  };

  progress: number | null;
  status: string;
  semantic: StatSemantic;
  imageSrc?: string;
  imageAlt?: string;
}

interface StatCardsProps {
  cards: StatCard[];
  className?: string;
}

const SEMANTIC_ACCENT: Record<StatSemantic, string> = {
  danger:  'bg-destructive',
  success: 'bg-brand-600',
  warning: 'bg-amber-600',
  info:    'bg-blue-600',
};

const SEMANTIC_FILL: Record<StatSemantic, string> = {
  danger:  'bg-destructive',
  success: 'bg-primary',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
};

const SEMANTIC_TEXT: Record<StatSemantic, string> = {
  danger:  'text-destructive',
  success: 'text-primary',
  warning: 'text-amber-600',
  info:    'text-blue-600',
};

const SENTIMENT_BADGE: Record<TrendSentiment, string> = {
  positive: 'bg-primary/10 text-primary',
  negative: 'bg-destructive/10 text-destructive',
  neutral:  'bg-muted text-muted-foreground',
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === 'up')   return <ArrowUp size={11} />;
  if (direction === 'down') return <ArrowDown size={11} />;
  return <Minus size={11} />;
}

export default function StatCards({ cards, className }: StatCardsProps) {
  return (
    <section aria-labelledby="stat-cards-heading" className={className}>
      <h2 id="stat-cards-heading" className="sr-only">Statistics</h2>

      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {cards.map((card, i) => {
          const safeProgress =
            card.progress != null ? Math.min(Math.max(card.progress, 0), 100) : null;

          return (
            <article
              key={`${card.label}-${i}`}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
            >

              <div
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-[3px] rounded-none',
                  SEMANTIC_ACCENT[card.semantic]
                )}
              />

              {card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt={card.imageAlt ?? ''}
                  aria-hidden={card.imageAlt ? undefined : 'true'}
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-2 -right-2 hidden h-20 w-20 select-none object-contain opacity-70 sm:block md:h-24 md:w-24 lg:h-28 lg:w-28"
                />
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                    SENTIMENT_BADGE[card.trend.sentiment]
                  )}
                >
                  <TrendIcon direction={card.trend.direction} />
                  {card.trend.delta}
                </span>
              </div>

              <p className="mt-3 font-mono font-medium leading-none tabular-nums text-foreground text-[clamp(2.25rem,4vw,2.5rem)]">
                {card.value}
              </p>

              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {card.subtext}
              </p>

              {safeProgress !== null ? (
                <div
                  role="progressbar"
                  aria-label={`${card.label} progress`}
                  aria-valuenow={safeProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-[3px] overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={cn('h-full rounded-full transition-all', SEMANTIC_FILL[card.semantic])}
                    style={{ width: `${safeProgress}%` }}
                  />
                </div>
              ) : (
                <div aria-hidden="true" className="mt-3 h-px bg-border" />
              )}

              <p className={cn('mt-2 text-[11px] font-medium', SEMANTIC_TEXT[card.semantic])}>
                {card.status}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
