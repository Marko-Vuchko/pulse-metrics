"use client"

import { useCallback, useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import type { CarouselApi } from "@/components/ui/carousel"

import { Reveal } from "@/components/motion/reveal"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    quote:
      "The demo login dropped me straight into a believable SaaS dashboard. MRR and churn read like a real product, not a wireframe.",
    name: "Elena Voss",
    role: "Product lead, Northwind Apps",
  },
  {
    quote:
      "Clean auth, clear empty states, and a customer table that actually filters. This is what portfolio SaaS should look like.",
    name: "Jonah Reed",
    role: "Indie founder",
  },
  {
    quote:
      "Obsidian surfaces and cyan accents feel intentional. The landing sells PulseMetrics first, then Fluxis quietly in the footer.",
    name: "Mira Chen",
    role: "Design engineer",
  },
  {
    quote:
      "I shared the demo credentials with a client. Five minutes later they understood the analytics story without a pitch deck.",
    name: "Arthur Blake",
    role: "Agency partner",
  },
  {
    quote:
      "Period ranges in the URL, RLS-backed tenants, and no fake Docker dance. Serious engineering wrapped in a polished shell.",
    name: "Sofia Alvarez",
    role: "Staff engineer",
  },
] as const

const CAROUSEL_OPTS = { align: "start" as const, loop: true }

// Stable for app lifetime - recreating Autoplay each render re-inits Embla
// and can loop setApi → max update depth.
const CAROUSEL_PLUGINS = [
  Autoplay({
    delay: 4500,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  }),
]

function Testimonials() {
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback((carousel: CarouselApi) => {
    if (!carousel) return
    setSelected(carousel.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) return
    const handleSelect = () => onSelect(api)
    queueMicrotask(handleSelect)
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)
    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api, onSelect])

  return (
    <section
      id="testimonials"
      className="scroll-mt-20 px-4 py-20 sm:px-6"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="mt-3 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            What visitors say about the demo
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Mock quotes for the marketing surface - tone-matched to portfolio
            reviewers and early customers.
          </p>
        </Reveal>

        <Reveal
          delayMs={120}
          className="mx-auto mt-12 w-full max-w-3xl px-10 sm:px-12"
        >
          <Carousel
            opts={CAROUSEL_OPTS}
            plugins={CAROUSEL_PLUGINS}
            setApi={setApi}
            className="w-full motion-safe:animate-in motion-safe:fade-in"
          >
            <CarouselContent>
              {testimonials.map((item) => (
                <CarouselItem key={item.name}>
                  <figure className="rounded-[1.5rem] border border-border/80 bg-card/40 px-6 py-8 transition-[border-color,box-shadow] duration-300 hover:border-primary/25 hover:shadow-[0_0_40px_-24px_oklch(0.82_0.14_200/0.5)] sm:px-10">
                    <blockquote className="text-base leading-relaxed text-pretty sm:text-lg">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 border-t border-border/60 pt-4">
                      <p className="font-mono text-sm font-medium">{item.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.role}
                      </p>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-border/80" />
            <CarouselNext className="right-0 border-border/80" />
          </Carousel>

          <div
            className="mt-5 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Testimonial slides"
          >
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={selected === index}
                aria-label={`Show testimonial ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selected === index
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export { Testimonials }
