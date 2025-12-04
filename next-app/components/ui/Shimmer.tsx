// components/ui/Shimmer.tsx
export function Shimmer() {
    return (
      <div className="relative overflow-hidden rounded-md bg-muted">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }
  