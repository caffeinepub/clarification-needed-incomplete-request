import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Watch } from "@/backend";

interface WatchCarouselProps {
  watches: Watch[];
  onOrder: (watch: Watch) => void;
}

function formatPrice(price: bigint): string {
  return "$" + (Number(price) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function WatchCarousel({ watches, onOrder }: WatchCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (watches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-20 h-20 rounded-full border border-gold-dim flex items-center justify-center text-3xl">
          ⌚
        </div>
        <p className="font-display text-2xl text-gold-muted">No timepieces available yet</p>
        <p className="text-muted-foreground text-sm">Our collection is being curated. Check back soon.</p>
      </div>
    );
  }

  const watch = watches[current];

  const prev = () => setCurrent((c) => (c - 1 + watches.length) % watches.length);
  const next = () => setCurrent((c) => (c + 1) % watches.length);

  return (
    <div className="relative flex items-center gap-4 md:gap-8">
      {/* Left Arrow */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous watch"
        className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border border-gold-dim bg-card hover:border-gold hover:shadow-gold transition-all duration-300 flex items-center justify-center group"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gold-muted group-hover:text-gold transition-colors" />
      </button>

      {/* Watch Card */}
      <div className="flex-1 card-luxury rounded-2xl overflow-hidden transition-all duration-500 animate-fade-in">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 aspect-square bg-muted relative overflow-hidden">
            <img
              src={watch.image.getDirectURL()}
              alt={watch.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Gold corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold opacity-60" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold opacity-60" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold opacity-60" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold opacity-60" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between p-8 md:p-10 md:w-1/2">
            <div className="space-y-4">
              <div className="ornament">
                <span className="text-xs text-gold-muted tracking-widest uppercase font-light">
                  Timepiece
                </span>
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                {watch.name}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                {watch.description}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">Price</p>
                <p className="font-display text-4xl text-gold font-light tracking-wide">
                  {formatPrice(watch.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOrder(watch)}
                className="w-full py-4 px-8 gold-gradient text-background font-semibold tracking-widest uppercase text-sm rounded-lg hover:opacity-90 transition-all duration-300 hover:shadow-gold active:scale-[0.98]"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={next}
        aria-label="Next watch"
        className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border border-gold-dim bg-card hover:border-gold hover:shadow-gold transition-all duration-300 flex items-center justify-center group"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gold-muted group-hover:text-gold transition-colors" />
      </button>

      {/* Indicator dots */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-3">
        {watches.map((w, i) => (
          <button
            key={w.id.toString()}
            type="button"
            aria-label={`Go to watch ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-6 h-2 bg-gold"
                : "w-2 h-2 bg-gold-dim hover:bg-gold-muted"
            }`}
          />
        ))}
        <span className="ml-4 text-xs text-muted-foreground font-light">
          {current + 1} / {watches.length}
        </span>
      </div>
    </div>
  );
}
