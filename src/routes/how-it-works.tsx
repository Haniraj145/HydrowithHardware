import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Droplets, FlaskConical, Activity, Sprout, Camera, ArrowRight } from "lucide-react";
import howWorks from "@/assets/hydronova-howitworks.png";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How HydroNova Works" },
      { name: "description", content: "From water tank setup to AI growth monitoring — see the full HydroNova workflow." },
    ],
  }),
  component: How,
});

function How() {
  const steps = [
    { i: Droplets, t: "Water tank setup", d: "Fill the reservoir with clean water. Sensors confirm level instantly." },
    { i: FlaskConical, t: "Nutrient mixing", d: "The auto-doser blends a balanced N-P-K solution to optimal EC." },
    { i: Activity, t: "Pump circulation", d: "A whisper-quiet pump aerates and circulates nutrients to every root." },
    { i: Sprout, t: "Root absorption", d: "Bare roots drink directly — no soil, no waste, faster uptake." },
    { i: Camera, t: "Plant growth monitoring", d: "AI camera + sensors track leaf color, height and health 24/7." },
  ];
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">How it works</p>
        <h1 className="mt-1 text-4xl font-bold">A continuous loop of smart growth</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Sensors → Camera → Controller → Pump → Roots → App. The system never stops optimizing.</p>

        <FadeIn>
          <Card className="mt-10 overflow-hidden border-border/60 bg-card/60 p-2 backdrop-blur">
            <img src={howWorks} alt="HydroNova workflow diagram" className="rounded-xl" />
          </Card>
        </FadeIn>

        <div className="relative mt-12">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-primary to-transparent md:block" />
          <ol className="space-y-6">
            {steps.map((s, idx) => (
              <FadeIn key={s.t} delay={idx * 0.05}>
                <motion.li
                  whileHover={{ x: 4 }}
                  className="relative grid gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur md:grid-cols-[120px_1fr] md:pl-20"
                >
                  <div className="absolute left-0 top-6 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow md:flex">
                    <s.i className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-gradient-brand">0{idx + 1}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{s.t}</h3>
                    <p className="mt-1 text-muted-foreground">{s.d}</p>
                  </div>
                </motion.li>
              </FadeIn>
            ))}
          </ol>
        </div>

        <FadeIn>
          <Card className="mt-12 flex flex-wrap items-center justify-between gap-4 border-border/60 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div>
              <h3 className="text-2xl font-bold">Continuous feedback loop</h3>
              <p className="mt-1 text-white/80">Every reading tunes the next decision. Healthier plants, higher yields, less waste.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              Sensors <ArrowRight className="h-4 w-4" /> AI <ArrowRight className="h-4 w-4" /> Pump <ArrowRight className="h-4 w-4" /> Plants
            </div>
          </Card>
        </FadeIn>
      </section>
    </Layout>
  );
}
