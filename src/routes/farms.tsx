import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Plus, MapPin, Droplets, Thermometer, Sprout, Container } from "lucide-react";

export const Route = createFileRoute("/farms")({
  head: () => ({
    meta: [
      { title: "Farms — HydroNova" },
      { name: "description", content: "Manage all your hydroponic farms and grow buckets connected to HydroNova." },
    ],
  }),
  component: Farms,
});

type Farm = {
  id: string;
  name: string;
  status: "Active" | "Offline";
  location: string;
  plants: number;
  waterUsage: string;
  temp: string;
  health: number;
  image: string;
  buckets: { id: string; name: string; crop: string; ph: number; ec: number }[];
};

const initialFarms: Farm[] = [
  {
    id: "f1", name: "Grapes Farm", status: "Active", location: "Nasik, IND",
    plants: 124, waterUsage: "12 L/day", temp: "23.4°C", health: 96,
    image: "https://th.bing.com/th/id/OIP.g84nICklA5fnZDhFV23t-QHaFS?w=264&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    buckets: [
      { id: "b1", name: "Bucket A1", crop: "Romaine", ph: 6.1, ec: 1.7 },
      { id: "b2", name: "Bucket A2", crop: "Butterhead", ph: 6.3, ec: 1.8 },
    ],
  },
  {
    id: "f2", name: "Strawberry Hydro Farm", status: "Active", location: "Uttrakhand, IND",
    plants: 86, waterUsage: "9 L/day", temp: "25.1°C", health: 91,
    image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=900&q=80",
    buckets: [
      { id: "b3", name: "Bucket S1", crop: "Albion", ph: 6.0, ec: 1.5 },
    ],
  },
  {
    id: "f3", name: "Tomato Smart Farm", status: "Offline", location: "Satara, IND",
    plants: 48, waterUsage: "—", temp: "—", health: 0,
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=80",
    buckets: [],
  },
  {
    id: "f4", name: "Indoor Herb Farm", status: "Active", location: "Thane, IND",
    plants: 64, waterUsage: "6 L/day", temp: "22.8°C", health: 98,
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&q=80",
    buckets: [
      { id: "b4", name: "Bucket H1", crop: "Basil", ph: 6.2, ec: 1.6 },
      { id: "b5", name: "Bucket H2", crop: "Mint", ph: 6.4, ec: 1.5 },
      { id: "b6", name: "Bucket H3", crop: "Cilantro", ph: 6.1, ec: 1.7 },
    ],
  },
];

function Farms() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [openAdd, setOpenAdd] = useState(false);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);

  function addFarm(name: string, location: string) {
    const farm: Farm = {
      id: `f${Date.now()}`, name, location, status: "Active",
      plants: 0, waterUsage: "0 L/day", temp: "24.0°C", health: 100,
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=900&q=80",
      buckets: [],
    };
    setFarms([farm, ...farms]);
  }
  function addBucket(farmId: string, name: string, crop: string) {
    setFarms((prev) => prev.map((f) => f.id === farmId
      ? { ...f, buckets: [...f.buckets, { id: `b${Date.now()}`, name, crop, ph: 6.2, ec: 1.6 }] }
      : f));
    setActiveFarm((f) => f && f.id === farmId
      ? { ...f, buckets: [...f.buckets, { id: `b${Date.now()}`, name, crop, ph: 6.2, ec: 1.6 }] }
      : f);
  }

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Connected Farms</p>
            <h1 className="mt-1 text-4xl font-bold">Your hydroponic network</h1>
            <p className="mt-2 text-muted-foreground">Monitor every farm and bucket in real-time. {farms.length} farms · {farms.reduce((a, f) => a + f.buckets.length, 0)} buckets.</p>
          </div>
          <AddFarmDialog open={openAdd} onOpenChange={setOpenAdd} onAdd={addFarm} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm, i) => (
            <FadeIn key={farm.id} delay={i * 0.05}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur transition hover:shadow-leaf">
                  <div className="relative h-44 overflow-hidden">
                    <img src={farm.image} alt={farm.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <StatusBadge status={farm.status} />
                    </div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="text-lg font-semibold">{farm.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-white/80"><MapPin className="h-3 w-3" />{farm.location}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Stat icon={<Sprout className="h-4 w-4" />} label="Plants" value={`${farm.plants}`} />
                      <Stat icon={<Droplets className="h-4 w-4" />} label="Water" value={farm.waterUsage} />
                      <Stat icon={<Thermometer className="h-4 w-4" />} label="Temp" value={farm.temp} />
                      <Stat icon={<Container className="h-4 w-4" />} label="Buckets" value={`${farm.buckets.length}`} />
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Overall health</span><span className="font-semibold text-foreground">{farm.health}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${farm.health}%` }} transition={{ duration: 1 }}
                          className="h-full bg-gradient-aqua" />
                      </div>
                    </div>
                    <Button variant="outline" className="mt-5 w-full" onClick={() => setActiveFarm(farm)}>
                      Manage buckets
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <BucketsDialog farm={activeFarm} onOpenChange={(o) => !o && setActiveFarm(null)} onAddBucket={addBucket} />
      </section>
    </Layout>
  );
}

function StatusBadge({ status }: { status: "Active" | "Offline" }) {
  return (
    <Badge className={status === "Active"
      ? "bg-accent/90 text-accent-foreground hover:bg-accent/90"
      : "bg-muted text-muted-foreground hover:bg-muted"}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
      {status}
    </Badge>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="text-accent">{icon}</span>{label}</div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function AddFarmDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (name: string, loc: string) => void }) {
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow"><Plus className="mr-1 h-4 w-4" /> Add farm</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a new farm</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Farm name</Label><Input placeholder="e.g. Rooftop Greens" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Location</Label><Input placeholder="City, Country" value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => { if (name && loc) { onAdd(name, loc); setName(""); setLoc(""); onOpenChange(false); } }}
            className="bg-gradient-brand text-primary-foreground">Create farm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BucketsDialog({ farm, onOpenChange, onAddBucket }: { farm: Farm | null; onOpenChange: (o: boolean) => void; onAddBucket: (id: string, name: string, crop: string) => void }) {
  const [bName, setBName] = useState("");
  const [crop, setCrop] = useState("");
  return (
    <Dialog open={!!farm} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{farm?.name} · Buckets</DialogTitle></DialogHeader>
        <AnimatePresence>
          {farm && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {farm.buckets.length === 0 && <p className="col-span-2 text-sm text-muted-foreground">No buckets yet — add one below.</p>}
                {farm.buckets.map((b) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold"><Container className="h-4 w-4 text-accent" />{b.name}</div>
                      <Badge variant="outline">{b.crop}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>pH <span className="font-semibold text-foreground">{b.ph}</span></span>
                      <span>EC <span className="font-semibold text-foreground">{b.ec}</span></span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-xl border border-dashed border-border p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-accent" /> Add a bucket</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input placeholder="Bucket name" value={bName} onChange={(e) => setBName(e.target.value)} />
                  <Input placeholder="Crop (e.g. Basil)" value={crop} onChange={(e) => setCrop(e.target.value)} />
                  <Button onClick={() => { if (bName && crop && farm) { onAddBucket(farm.id, bName, crop); setBName(""); setCrop(""); } }}
                    className="bg-gradient-brand text-primary-foreground">Add</Button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
