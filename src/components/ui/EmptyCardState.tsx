import React from 'react';

interface EmptyCardStateProps {
  /** Single-line message shown under the illustration. */
  message?: string;
  /** Additional className appended to the wrapper. */
  className?: string;
  /** Override the default illustration if a more specific one is needed. */
  imageSrc?: string;
}

/**
 * Reusable "this card is empty" placeholder for any dashboard / detail
 * card that has no rows to render. Wide composition so it works inside
 * landscape cards without overflowing tall. Pair with a fixed-height
 * card (h-full inside a parent that has a defined height).
 */
export default function EmptyCardState({
  message = 'Nothing to show yet',
  className = '',
  imageSrc = '/illustrations/EZ-empty-card_001.png',
}: EmptyCardStateProps) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-2 px-4 py-6 ${className}`}
    >
      <img
        src={imageSrc}
        alt=""
        className="h-20 max-w-[60%] object-contain sm:h-24"
        loading="lazy"
      />
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </div>
  );
}
