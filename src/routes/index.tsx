import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Droplets, Leaf, Zap, Sprout, Bug, Bot, Bell, Activity,
  Camera, LineChart, Cpu, Cloud, Gauge, ShieldCheck, ArrowRight,
  Thermometer, FlaskConical, Sun
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { CircularGauge } from "@/components/site/CircularGauge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import system from "@/assets/hydronova-system.png";
import howWorks from "@/assets/hydronova-howitworks.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HydroNova — Smart Hydroponics System" },
      { name: "description", content: "AI-powered hydroponics: live monitoring, smart automation, plant disease detection and 90% less water." },
      { property: "og:title", content: "HydroNova — Smart Hydroponics" },
      { property: "og:description", content: "Grow fresh greens year-round with HydroNova's IoT + AI hydroponic system." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <Hero navigate={navigate} />
      <Stats />
      <Benefits />
      <DashboardPreview />
      <AISection />
      <HowItWorks />
      <PlantDetection navigate={navigate} />
      <FarmsTeaser navigate={navigate} />
      <CTA navigate={navigate} />
    </Layout>
  );
}

function Hero({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 ring-grid opacity-40" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            IoT + AI · Smart Hydroponics
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 text-5xl font-bold leading-[1.05] md:text-6xl"
          >
            Grow smarter with <span className="text-gradient-brand">HydroNova</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-xl text-lg text-muted-foreground"
          >
            A connected hydroponics system that monitors pH, EC, temperature & humidity in real-time,
            auto-feeds your plants, and uses AI vision to detect disease before it spreads.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button 
              size="lg" 
              className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 cursor-pointer"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Open Dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate({ to: "/farms" })}
            >
              Explore Farms
            </Button>
          </motion.div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { k: "90%", v: "Less water" },
              { k: "2×", v: "Faster growth" },
              { k: "0", v: "Soil needed" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl glass p-4 text-center">
                <p className="text-2xl font-bold text-gradient-brand">{s.k}</p>
                <p className="text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute -inset-10 rounded-full bg-gradient-aqua opacity-20 blur-3xl" />
          <div className="relative animate-float rounded-3xl border border-border bg-card/50 p-2 shadow-leaf backdrop-blur">
            <img src={system} alt="HydroNova Smart Hydroponics System" className="rounded-2xl" />
          </div>
          <FloatingChip className="absolute -left-4 top-10" icon={<Droplets className="h-4 w-4" />} label="pH 6.2" />
          <FloatingChip className="absolute right-0 top-24" icon={<Thermometer className="h-4 w-4" />} label="24.6°C" />
          <FloatingChip className="absolute bottom-10 left-10" icon={<Leaf className="h-4 w-4" />} label="Healthy" />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingChip({ icon, label, className = "" }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className={`glass flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-glow ${className}`}
    >
      <span className="text-accent">{icon}</span> {label}
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="border-y border-border/60 bg-card/30 py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-6 text-sm font-medium text-muted-foreground">
        <Tag icon={<Cpu className="h-4 w-4" />}>IoT Sensors</Tag>
        <Tag icon={<Bot className="h-4 w-4" />}>AI Vision</Tag>
        <Tag icon={<Cloud className="h-4 w-4" />}>Cloud Sync</Tag>
        <Tag icon={<Bell className="h-4 w-4" />}>Smart Alerts</Tag>
        <Tag icon={<ShieldCheck className="h-4 w-4" />}>Pesticide-Free</Tag>
      </div>
    </section>
  );
}
function Tag({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2"><span className="text-accent">{icon}</span>{children}</span>;
}

function Benefits() {
  const items = [
    { icon: Droplets, title: "90% less water", desc: "Closed-loop irrigation reuses nutrient solution efficiently." },
    { icon: Sprout, title: "Faster plant growth", desc: "Optimized nutrients & light deliver harvests up to 2× faster." },
    { icon: Cloud, title: "Less space required", desc: "Vertical-friendly footprint perfect for homes & offices." },
    { icon: Leaf, title: "No soil needed", desc: "Soilless grow pods mean zero mess and total control." },
    { icon: ShieldCheck, title: "Reduced pesticides", desc: "Indoor isolation + AI detection keeps plants healthy naturally." },
    { icon: Zap, title: "Smart automation", desc: "Auto watering, dosing & lighting based on live sensor data." },
  ];
  return (
    <Section id="benefits" eyebrow="Why HydroNova" title="Built for the future of farming">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((b, i) => (
          <FadeIn key={b.title} delay={i * 0.05}>
            <Card className="group relative h-full overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-leaf">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-aqua opacity-10 blur-2xl transition group-hover:opacity-30" />
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

function DashboardPreview() {
  return (
    <Section eyebrow="Smart Dashboard" title="Live monitoring at a glance"
      subtitle="Temperature, water, pH, humidity, nutrients, pump & light — beautifully visualized.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <FadeIn>
          <Card className="bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <CircularGauge value={62} display="6.2" label="pH Level" unit="optimal" color="oklch(0.75 0.18 200)" />
              <CircularGauge value={72} display="1.8" label="EC Level" unit="mS/cm" color="oklch(0.78 0.20 145)" />
              <CircularGauge value={49} display="24.6°" label="Temperature" unit="ideal" color="oklch(0.72 0.18 60)" />
              <CircularGauge value={65} display="65%" label="Humidity" unit="balanced" color="oklch(0.70 0.15 230)" />
              <CircularGauge value={84} display="84%" label="Water Tank" unit="full" color="oklch(0.65 0.18 230)" />
              <CircularGauge value={92} display="92%" label="Plant Health" unit="excellent" color="oklch(0.78 0.20 145)" />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-sm">
              <StatusPill on label="Pump active" />
              <StatusPill on label="Grow light · 80%" />
              <StatusPill label="Auto dosing" />
              <Link to="/dashboard" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                Open full dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Card className="h-full border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold">IoT control loop</h3>
            <p className="mt-1 text-sm text-muted-foreground">Sensors stream every second to the controller, which adjusts pumps and lighting in real-time.</p>
            <ul className="mt-6 space-y-4">
              {[
                { i: Activity, t: "Live telemetry", d: "Sub-second updates from every sensor" },
                { i: Gauge, t: "Animated gauges & charts", d: "See trends, not just numbers" },
                { i: Bell, t: "Smart alerts", d: "Push notifications when something needs attention" },
                { i: LineChart, t: "Growth analytics", d: "Track yield over weeks & seasons" },
              ].map((r) => (
                <li key={r.t} className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"><r.i className="h-5 w-5" /></span>
                  <div>
                    <p className="font-medium">{r.t}</p>
                    <p className="text-sm text-muted-foreground">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      </div>
    </Section>
  );
}

function StatusPill({ label, on }: { label: string; on?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${on ? "border-accent/40 bg-accent/15 text-accent" : "border-white/15 bg-white/5"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />{label}
    </span>
  );
}

function AISection() {
  const items = [
    { i: Bug, t: "Plant disease detection", d: "Computer vision flags spots, wilt and pests early." },
    { i: LineChart, t: "Growth prediction", d: "ML forecasts yield & ideal harvest day." },
    { i: Droplets, t: "Auto watering", d: "Pumps trigger only when plants actually need water." },
    { i: FlaskConical, t: "Smart nutrient control", d: "Doser balances NPK & EC automatically." },
    { i: Bell, t: "Mobile notifications", d: "Real-time alerts on your phone, anywhere." },
    { i: Bot, t: "Self-learning", d: "Improves recommendations from every grow cycle." },
  ];
  return (
    <Section eyebrow="AI & Automation" title="Your garden, on autopilot"
      subtitle="HydroNova's onboard AI continuously tunes water, nutrients and light for the perfect grow.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <FadeIn key={it.t} delay={i * 0.05}>
            <Card className="group h-full border-border/60 bg-card/60 p-6 backdrop-blur transition hover:border-accent/40">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-aqua text-primary-foreground shadow-glow">
                <it.i className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{it.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
            </Card>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { i: Droplets, t: "Water tank setup", d: "Fill the reservoir with clean water." },
    { i: FlaskConical, t: "Nutrient mixing", d: "Auto doser blends balanced NPK solution." },
    { i: Activity, t: "Pump circulation", d: "Pump aerates and circulates nutrients to roots." },
    { i: Sprout, t: "Root absorption", d: "Bare roots drink directly from the solution." },
    { i: Camera, t: "Growth monitoring", d: "AI camera + sensors track plant health 24/7." },
  ];
  return (
    <Section eyebrow="How it works" title="From seed to harvest in 5 steps">
      <FadeIn>
        <Card className="overflow-hidden border-border/60 bg-card/60 p-2 backdrop-blur">
          <img src={howWorks} alt="HydroNova workflow diagram" className="rounded-xl" />
        </Card>
      </FadeIn>
      <div className="mt-10 grid gap-4 md:grid-cols-5">
        {steps.map((s, idx) => (
          <FadeIn key={s.t} delay={idx * 0.06}>
            <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur">
              <div className="absolute -top-3 left-5 rounded-full bg-gradient-brand px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                0{idx + 1}
              </div>
              <s.i className="h-6 w-6 text-accent" />
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

function PlantDetection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const features = [
    "Leaf disease detection", "Growth tracking", "Color analysis",
    "Dry leaf detection", "Nutrient deficiency", "NPK value estimate",
  ];
  return (
    <Section eyebrow="Camera AI" title="Plant detection with computer vision"
      subtitle="A 1080p HD camera + onboard ML model continuously inspects every leaf.">
      <div className="grid gap-8 lg:grid-cols-2">
        <FadeIn>
          <Card className="relative overflow-hidden border-border/60 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div className="absolute inset-0 ring-grid opacity-20" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Live AI scan
              </div>
              <h3 className="mt-4 text-2xl font-bold">Lettuce · Pod #03</h3>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <Metric label="Health" value="96%" />
                <Metric label="Color" value="Vibrant" />
                <Metric label="Day" value="14" />
                <Metric label="N" value="42 ppm" />
                <Metric label="P" value="18 ppm" />
                <Metric label="K" value="36 ppm" />
              </div>
              <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
                <p className="font-semibold text-accent">Detection: Healthy ✓</p>
                <p className="text-white/80">No disease, dry leaves, or deficiency detected.</p>
              </div>
            </div>
          </Card>
        </FadeIn>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <FadeIn key={f} delay={i * 0.04}>
              <Card className="flex h-full items-start gap-3 border-border/60 bg-card/60 p-5 backdrop-blur">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Sun className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">{f}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Powered by on-device vision model.</p>
                </div>
              </Card>
            </FadeIn>
          ))}
          <Button 
            variant="outline" 
            className="col-span-2 cursor-pointer"
            onClick={() => navigate({ to: "/ai" })}
          >
            See AI vision in action <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function FarmsTeaser({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <Section eyebrow="Connected farms" title="Manage every farm from one place"
      subtitle="Add unlimited farms and grow buckets — see status, health & water at a glance.">
      <FadeIn>
        <Card className="flex flex-col items-center gap-4 border-border/60 bg-card/60 p-10 text-center backdrop-blur md:flex-row md:text-left">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold">Vertical Lettuce · Strawberry Hydro · Tomato Smart · Indoor Herb</h3>
            <p className="mt-2 text-muted-foreground">A unified control panel for all of your hydroponic farms and individual buckets.</p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-brand text-primary-foreground shadow-glow cursor-pointer"
            onClick={() => navigate({ to: "/farms" })}
          >
            Open Farms
          </Button>
        </Card>
      </FadeIn>
    </Section>
  );
}

function CTA({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-deep p-10 text-center text-primary-foreground shadow-glow md:p-16">
        <h2 className="text-3xl font-bold md:text-5xl">Grow Fresh. Eat Healthy. Live Better.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">Join the next wave of soilless, AI-powered farming with HydroNova.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button 
            size="lg" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Try Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white/30 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
            onClick={() => navigate({ to: "/farms" })}
          >
            Browse Farms
          </Button>
        </div>
      </div>
    </section>
  );
}

function Section({ id, eyebrow, title, subtitle, children }: { id?: string; eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            <h2 className="mt-2 text-4xl font-bold md:text-5xl">{title}</h2>
            {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
          </div>
        </FadeIn>
        {children}
      </div>
    </section>
  );
}
