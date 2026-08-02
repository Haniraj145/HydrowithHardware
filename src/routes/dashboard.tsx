import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { CircularGauge } from "@/components/site/CircularGauge";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplets, Thermometer, Sun, FlaskConical, Waves, Cpu } from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live Dashboard — HydroNova" },
      { name: "description", content: "Real-time IoT monitoring of pH, EC, temperature, humidity, water and pumps for your HydroNova system." },
    ],
  }),
  component: Dashboard,
});

function useLiveSeries(initial: number, min: number, max: number) {
  const [data, setData] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ t: i, v: +(initial + (Math.random() - 0.5) * (max - min) * 0.2).toFixed(2) }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const last = d[d.length - 1].v;
        const next = Math.min(max, Math.max(min, +(last + (Math.random() - 0.5) * (max - min) * 0.08).toFixed(2)));
        return [...d.slice(1), { t: d[d.length - 1].t + 1, v: next }];
      });
    }, 1500);
    return () => clearInterval(id);
  }, [min, max]);
  return data;
}

function Dashboard() {
  const ph = useLiveSeries(6.2, 5.5, 7.0);
  const ec = useLiveSeries(1.8, 1.2, 2.4);
  const temp = useLiveSeries(24.6, 22, 27);
  const humidity = useLiveSeries(65, 55, 75);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Smart Dashboard</p>
            <h1 className="mt-1 text-4xl font-bold">Live System Monitoring</h1>
            <p className="mt-2 text-muted-foreground">All sensors streaming in real-time from your HydroNova unit.</p>
          </div>
          <Badge className="bg-accent/15 text-accent hover:bg-accent/15">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-accent" /> Live · synced 1s ago
          </Badge>
        </div>

        <FadeIn>
          <Card className="mt-8 bg-gradient-deep p-8 text-primary-foreground shadow-glow">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              <CircularGauge value={62} display={ph[ph.length - 1].v.toFixed(1)} label="pH Level" unit="optimal" color="oklch(0.75 0.18 200)" size={140} />
              <CircularGauge value={72} display={ec[ec.length - 1].v.toFixed(1)} label="EC (mS/cm)" unit="nutrients" color="oklch(0.78 0.20 145)" size={140} />
              <CircularGauge value={49} display={`${temp[temp.length - 1].v.toFixed(1)}°`} label="Temperature" unit="ideal" color="oklch(0.72 0.18 60)" size={140} />
              <CircularGauge value={humidity[humidity.length - 1].v} display={`${Math.round(humidity[humidity.length - 1].v)}%`} label="Humidity" unit="balanced" color="oklch(0.70 0.15 230)" size={140} />
              <CircularGauge value={84} display="84%" label="Water Tank" unit="full" color="oklch(0.65 0.18 230)" size={140} />
              <CircularGauge value={92} display="92%" label="Plant Health" unit="excellent" color="oklch(0.78 0.20 145)" size={140} />
            </div>
          </Card>
        </FadeIn>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="pH trend" icon={<Droplets className="h-4 w-4" />} data={ph} stroke="oklch(0.65 0.18 230)" />
          <ChartCard title="EC nutrient concentration" icon={<FlaskConical className="h-4 w-4" />} data={ec} stroke="oklch(0.72 0.20 145)" />
          <ChartCard title="Temperature (°C)" icon={<Thermometer className="h-4 w-4" />} data={temp} stroke="oklch(0.72 0.18 60)" />
          <ChartCard title="Humidity (%)" icon={<Waves className="h-4 w-4" />} data={humidity} stroke="oklch(0.70 0.15 230)" />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Cpu className="h-5 w-5 text-accent" /> System controls</h3>
            <ul className="mt-5 space-y-4">
              <Toggle label="Water pump" defaultChecked />
              <Toggle label="Auto nutrient dosing" defaultChecked />
              <Toggle label="Grow light" defaultChecked />
              <Toggle label="Night mode" />
              <Toggle label="Push notifications" defaultChecked />
            </ul>
          </Card>
          <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Activity className="h-5 w-5 text-accent" /> Recent activity</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { t: "Pump cycle completed", time: "1m ago", color: "bg-accent" },
                { t: "Nutrient solution topped up (+120ml)", time: "12m ago", color: "bg-water" },
                { t: "Light intensity raised to 80%", time: "1h ago", color: "bg-amber-400" },
                { t: "Daily AI plant scan: All healthy", time: "3h ago", color: "bg-accent" },
                { t: "Water tank refilled", time: "1d ago", color: "bg-water" },
              ].map((a) => (
                <li key={a.t} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
                  <span className={`h-2 w-2 rounded-full ${a.color}`} />
                  <span className="flex-1">{a.t}</span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3">
      <span className="font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </li>
  );
}

function ChartCard({ title, icon, data, stroke }: { title: string; icon: React.ReactNode; data: { t: number; v: number }[]; stroke: string }) {
  return (
    <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="text-accent">{icon}</span>{title}</h3>
        <span className="font-display text-2xl font-bold">{data[data.length - 1].v}</span>
      </div>
      <div className="mt-4 h-48">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="color-mix(in oklab, var(--border) 60%, transparent)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} labelStyle={{ display: "none" }} />
            <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2.5} fill={`url(#g-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
