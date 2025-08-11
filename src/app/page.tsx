"use client";

import BackgroundScene from "@/components/BackgroundScene";

export default function HomePage() {
  return (
    <>
      {/* Fixed 3D background */}
      <BackgroundScene />

      {/* Optional: soft overlay for readability */}
      <div className="pointer-events-none fixed inset-0 -z-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

      {/* Foreground content that scrolls */}
      <main
        className="
          relative z-10
          scroll-smooth
          sm:scroll-pt-16
          snap-y snap-mandatory
        "
      >
        {/* Section 1 */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="mx-auto max-w-3xl px-6 text-white">
            <h1 className="text-5xl font-semibold tracking-tight">Your Company</h1>
            <p className="mt-4 text-lg opacity-90">
              We craft fluid, high-performance web &amp; 3D experiences.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="mx-auto max-w-3xl px-6 text-white">
            <h2 className="text-3xl font-semibold">What we do</h2>
            <p className="mt-4 opacity-90">
              Engineering, design, and immersive brand storytelling.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="mx-auto max-w-3xl px-6 text-white">
            <h2 className="text-3xl font-semibold">Selected Work</h2>
            <p className="mt-4 opacity-90">
              A few projects that blend narrative, motion, and performance.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="mx-auto max-w-3xl px-6 text-white">
            <h2 className="text-3xl font-semibold">Process</h2>
            <p className="mt-4 opacity-90">
              Strategy → Concept → Prototype → Polish → Ship → Measure.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="mx-auto max-w-3xl px-6 text-white">
            <h2 className="text-3xl font-semibold">Contact</h2>
            <p className="mt-4 opacity-90">
              Let’s build something memorable together.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
