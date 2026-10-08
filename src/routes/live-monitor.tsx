import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Bell,
  Calendar,
  User,
  Droplets,
  Zap,
  Thermometer,
  CloudRain,
  Container,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Upload,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchLiveSensors, type LiveSensorData } from "@/services/sensorService";
import { analyzePlantImage, preloadPlantModel, type PlantAnalysis } from "@/lib/plantVision";

export const Route = createFileRoute("/live-monitor")({
  head: () => ({
    meta: [
      { title: "Live Monitor — HydroNova Smart Hydroponics" },
      {
        name: "description",
        content:
          "Real-time AI camera detection for plant diseases, health overview, sensor telemetry and automated hydroponics analysis.",
      },
    ],
  }),
  component: LiveMonitorPage,
});

const PLANT_THUMBNAILS = [
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=400&q=80",
];

const HEALTH_TREND_DATA = [
  { day: "17 May", health: 70 },
  { day: "18 May", health: 74 },
  { day: "19 May", health: 82 },
  { day: "20 May", health: 78 },
  { day: "21 May", health: 74 },
  { day: "22 May", health: 85 },
  { day: "23 May", health: 84 },
];

const HEALTH_PIE_DATA = [
  { name: "Healthy", value: 84, color: "#22c55e", count: 42 },
  { name: "Warning", value: 12, color: "#eab308", count: 6 },
  { name: "Critical", value: 4, color: "#ef4444", count: 2 },
];

function LiveMonitorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sensors, setSensors] = useState<LiveSensorData | null>(null);
  const [sensorsError, setSensorsError] = useState(false);

  const [selectedThumb, setSelectedThumb] = useState(0);
  const [cameraActive, setCameraActive] = useState(true);
  const [autoScan, setAutoScan] = useState(true);
  const [cameraSlider, setCameraSlider] = useState([50]);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);

  // Poll live sensors from Node/Express PostgreSQL backend
  useEffect(() => {
    async function loadSensors() {
      try {
        const data = await fetchLiveSensors();
        setSensors(data);
        setSensorsError(false);
      } catch {
        setSensorsError(true);
      }
    }
    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  // Preload MobileNet model dynamically
  useEffect(() => {
    preloadPlantModel().catch(() => {});
  }, []);

  // Start webcam feed safely
  useEffect(() => {
    if (cameraActive && !uploadedImgUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive, uploadedImgUrl]);

  async function startCamera() {
    try {
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      // Fallback to image stream
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImgUrl(url);
    stopCamera();
    runAIAnalysisOnImage(url);
  }

  async function runAIAnalysisOnImage(imgSrc: string) {
    try {
      const img = new Image();
      img.src = imgSrc;
      await img.decode();
      const res = await analyzePlantImage(img);
      setAnalysis(res);
    } catch {
      // ignore transient error
    }
  }

  const phDisplay = sensorsError ? "Error" : sensors?.ph != null ? `${sensors.ph.toFixed(2)} pH` : "--";
  const tdsDisplay = sensorsError ? "Error" : sensors?.tds != null ? `${Math.round(sensors.tds)} ppm` : "--";
  const tempDisplay = sensorsError ? "Error" : sensors?.temperature != null ? `${sensors.temperature.toFixed(1)} °C` : "--";
  const humDisplay = sensorsError ? "Error" : sensors?.humidity != null ? `${Math.round(sensors.humidity)} %` : "--";
  const waterDisplay = sensorsError ? "Error" : sensors?.waterLevel != null ? `${Math.round(sensors.waterLevel)} %` : "--";

  return (
    <Layout>
      <div className="min-h-screen bg-[#0d1117] text-slate-100 p-4 md:p-6 font-sans">
        {/* TOP SYSTEM HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Plant Health Monitoring
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1.5 px-2.5 py-0.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              System Active
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button className="relative p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition">
              <Calendar className="h-4 w-4 text-slate-400" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-semibold text-xs">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-200 leading-none">User</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* SENSOR STATUS BAR */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <SensorCard
            icon={<Droplets className="h-5 w-5 text-cyan-400" />}
            label="pH Level"
            value={phDisplay}
            status="Optimal"
            range="5.5 – 6.5"
          />
          <SensorCard
            icon={<Zap className="h-5 w-5 text-purple-400" />}
            label="TDS Level"
            value={tdsDisplay}
            status="Optimal"
            range="500 – 1000 ppm"
          />
          <SensorCard
            icon={<Thermometer className="h-5 w-5 text-amber-400" />}
            label="Water Temp."
            value={tempDisplay}
            status="Optimal"
            range="18 – 24 °C"
          />
          <SensorCard
            icon={<CloudRain className="h-5 w-5 text-blue-400" />}
            label="Humidity"
            value={humDisplay}
            status="Optimal"
            range="50 – 70 %"
          />
          <SensorCard
            icon={<Container className="h-5 w-5 text-emerald-400" />}
            label="Water Level"
            value={waterDisplay}
            status="Good"
            range="> 50 %"
          />
        </section>

        {/* MAIN MIDDLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          {/* LEFT: LIVE CAMERA FEED */}
          <Card className="lg:col-span-5 bg-[#161b22] border-slate-800/80 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    LIVE CAMERA FEED
                  </h2>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0 border-none font-semibold">
                    ● LIVE
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none">
                    <option>Camera 01</option>
                    <option>Camera 02</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Auto Scan</span>
                    <Switch
                      checked={autoScan}
                      onCheckedChange={setAutoScan}
                      className="data-[state=checked]:bg-emerald-500 scale-75"
                    />
                  </div>

                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  >
                    {cameraActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* CAMERA VIEWPORT */}
              <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden border border-slate-800">
                {uploadedImgUrl ? (
                  <img src={uploadedImgUrl} alt="Camera feed" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
                )}

                {!uploadedImgUrl && !streamRef.current && (
                  <img
                    src={PLANT_THUMBNAILS[selectedThumb]}
                    alt="Plant stream"
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  onClick={() => setSelectedThumb((prev) => (prev > 0 ? prev - 1 : PLANT_THUMBNAILS.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white/80 hover:bg-black/80 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedThumb((prev) => (prev < PLANT_THUMBNAILS.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white/80 hover:bg-black/80 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {autoScan && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 m-4 rounded-lg">
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_#34d399] animate-pulse top-1/2 relative" />
                  </div>
                )}
              </div>

              {/* THUMBNAILS SELECTOR ROW */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                {PLANT_THUMBNAILS.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUploadedImgUrl(null);
                      setSelectedThumb(idx);
                    }}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition ${
                      selectedThumb === idx && !uploadedImgUrl ? "border-emerald-500" : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mb-1">
                  Camera Movement
                </span>
                <Slider
                  value={cameraSlider}
                  onValueChange={setCameraSlider}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs gap-1.5 h-8"
              >
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </Card>

          {/* CENTER: AI DISEASE DETECTION */}
          <Card className="lg:col-span-4 bg-[#161b22] border-slate-800/80 p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                AI DISEASE DETECTION
              </h2>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-black">
                <img
                  src={uploadedImgUrl || PLANT_THUMBNAILS[selectedThumb]}
                  alt="Detection view"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-[20%] left-[30%] w-[45%] h-[40%] border-2 border-red-500 rounded bg-red-500/10 flex items-start justify-start p-1">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    Leaf Spot Detected
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Detection Result</span>
                  <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5">
                    {analysis ? analysis.label : "Leaf Spot (Early Stage)"}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Confidence Score</span>
                    <span className="font-semibold text-emerald-400">
                      {analysis ? `${Math.round(analysis.confidence * 100)}%` : "92%"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: analysis ? `${Math.round(analysis.confidence * 100)}%` : "92%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Affected Area</span>
                    <span className="font-semibold text-amber-400">12%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "12%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Detected At</span>
              <span className="font-medium text-slate-300">10:30 AM | 23 May 2024</span>
            </div>
          </Card>

          {/* RIGHT: SMART ALERTS & RECOMMENDATIONS */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="bg-[#161b22] border-slate-800/80 p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  SMART ALERTS
                </h2>
                <button className="text-[11px] text-emerald-400 hover:underline">View All</button>
              </div>

              <div className="space-y-2.5">
                <AlertItem
                  icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
                  bg="bg-red-500/10 border-red-500/20"
                  title="Leaf Spot Detected"
                  sub="Camera 01 | Plant Row 3"
                  desc="Early stage detected. Take action soon."
                  time="10:30 AM"
                />
                <AlertItem
                  icon={<Thermometer className="h-4 w-4 text-amber-400" />}
                  bg="bg-amber-500/10 border-amber-500/20"
                  title="pH Out of Range"
                  sub="Current: 7.2 (High)"
                  time="10:20 AM"
                />
                <AlertItem
                  icon={<Droplets className="h-4 w-4 text-cyan-400" />}
                  bg="bg-cyan-500/10 border-cyan-500/20"
                  title="Low Nutrient (TDS)"
                  sub="Current: 450 ppm"
                  time="10:15 AM"
                />
              </div>
            </Card>

            <Card className="bg-[#161b22] border-slate-800/80 p-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  RECOMMENDATIONS
                </h2>
                <span className="text-[10px] text-slate-400">Generated by AI</span>
              </div>

              <div className="flex items-start gap-3">
                <ul className="text-xs text-slate-300 space-y-1.5 flex-1">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span> Improve air circulation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span> Maintain humidity below 65%
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span> Check pH and TDS levels
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span> Remove affected leaves
                  </li>
                </ul>

                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=200&q=80"
                    alt="Leaf recommendation"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <Button size="sm" className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
                View Details
              </Button>
            </Card>
          </div>
        </section>

        {/* BOTTOM SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <Card className="lg:col-span-4 bg-[#161b22] border-slate-800/80 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              PLANT HEALTH OVERVIEW
            </h2>

            <div className="flex items-center justify-around gap-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={HEALTH_PIE_DATA} innerRadius={36} outerRadius={50} paddingAngle={3} dataKey="value">
                      {HEALTH_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-xl font-bold text-white leading-none">84%</p>
                  <p className="text-[10px] text-slate-400 font-medium">Healthy</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Healthy
                  </span>
                  <span className="font-semibold text-slate-200">84% (42)</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning
                  </span>
                  <span className="font-semibold text-slate-200">12% (6)</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical
                  </span>
                  <span className="font-semibold text-slate-200">4% (2)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-4 bg-[#161b22] border-slate-800/80 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              HEALTH TREND <span className="text-[10px] text-slate-400 font-normal">(Last 7 Days)</span>
            </h2>

            <div className="h-40 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HEALTH_TREND_DATA}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid border-slate-800", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-4 bg-[#161b22] border-slate-800/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                DISEASE HISTORY
              </h2>
              <button className="text-[11px] text-emerald-400 hover:underline">View Report</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <HistoryRow
                img="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=100&q=80"
                name="Leaf Spot"
                stage="Early Stage"
                location="Camera 01 | Row 3"
                time="23 May, 10:30 AM"
                status="New"
                statusBg="bg-red-500 text-white"
              />
              <HistoryRow
                img="https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=100&q=80"
                name="Powdery Mildew"
                stage="Early Stage"
                location="Camera 02 | Row 1"
                time="22 May, 04:15 PM"
                status="Resolved"
                statusBg="bg-slate-800 text-slate-400 border border-slate-700"
              />
              <HistoryRow
                img="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80"
                name="Yellowing (Nutrient Def.)"
                stage="Early Stage"
                location="Camera 01 | Row 5"
                time="21 May, 11:20 AM"
                status="Resolved"
                statusBg="bg-slate-800 text-slate-400 border border-slate-700"
              />
            </div>
          </Card>
        </section>

        {/* BOTTOM ACTION BANNER */}
        <footer className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-300">
              Early Detection. Smart Action. Healthy Plants. Higher Yield.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Our AI camera system continuously monitors your plants and detects issues at the earliest stage.
            </p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}

function SensorCard({
  icon,
  label,
  value,
  status,
  range,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: string;
  range: string;
}) {
  return (
    <Card className="bg-[#161b22] border-slate-800/80 p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">{icon}</div>
        <div>
          <p className="text-[11px] text-slate-400 font-medium">{label}</p>
          <p className="text-lg font-bold text-white leading-tight mt-0.5">{value}</p>
          <p className="text-[10px] text-slate-500">{range}</p>
        </div>
      </div>
      <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] px-2 font-semibold">
        {status}
      </Badge>
    </Card>
  );
}

function AlertItem({
  icon,
  bg,
  title,
  sub,
  desc,
  time,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  sub: string;
  desc?: string;
  time: string;
}) {
  return (
    <div className={`p-2.5 rounded-lg border ${bg} flex items-start gap-2.5`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="text-xs font-semibold text-slate-200 truncate">{title}</p>
          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{time}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        {desc && <p className="text-[10px] text-red-400/90 mt-0.5 leading-tight">{desc}</p>}
      </div>
    </div>
  );
}

function HistoryRow({
  img,
  name,
  stage,
  location,
  time,
  status,
  statusBg,
}: {
  img: string;
  name: string;
  stage: string;
  location: string;
  time: string;
  status: string;
  statusBg: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={img} alt={name} className="w-8 h-8 rounded-md object-cover border border-slate-700 shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-slate-200 truncate">{name}</p>
            <span className="text-[10px] text-emerald-400 font-medium">{stage}</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">{location}</p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-400 mb-0.5">{time}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBg}`}>{status}</span>
      </div>
    </div>
  );
}
