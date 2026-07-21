import { cn } from '@/lib/utils';

export function ProductCardSkeleton() {
  return (
    <div className="space-y-0">
      {/* Image placeholder */}
      <div
        className={cn(
          'aspect-[3/4] rounded-3xl',
          'bg-muted',
          'skeleton-shimmer'
        )}
      />

      {/* Content placeholder */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div
          className={cn(
            'h-4 bg-muted rounded-full w-3/4',
            'skeleton-shimmer'
          )}
        />

        {/* Rating */}
        <div
          className={cn(
            'h-3 bg-muted rounded-full w-1/2',
            'skeleton-shimmer'
          )}
        />

        {/* Price */}
        <div
          className={cn(
            'h-5 bg-muted rounded-full w-1/3',
            'skeleton-shimmer'
          )}
        />

        {/* Button */}
        <div
          className={cn(
            'h-10 bg-muted rounded-2xl w-full mt-2',
            'skeleton-shimmer'
          )}
        />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div
      className={cn(
        'w-full',
        'h-[85vh] md:h-screen',
        'bg-muted',
        'skeleton-shimmer',
        'rounded-none'
      )}
    />
  );
}

export function CategoryCardSkeleton() {
  return (
    <div
      className={cn(
        'min-w-[140px] md:min-w-[180px]',
        'aspect-square',
        'rounded-3xl',
        'bg-muted',
        'skeleton-shimmer'
      )}
    />
  );
}