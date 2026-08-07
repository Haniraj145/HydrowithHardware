import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { FadeIn } from "@/components/site/FadeIn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { predictDisease } from "@/api/ai";
import {
  Bug,
  Camera,
  Droplets,
  Leaf,
  FlaskConical,
  Activity,
  Sun,
  Upload,
  Video,
  VideoOff,
  Loader2,
  Stethoscope,
  AlertTriangle,
  Wrench,
  ServerCrash,
  Sparkles,
} from "lucide-react";
import {
  analyzePlantImage,
  preloadPlantModel,
  type PlantAnalysis,
  type MLPlantDiagnosis,
  type KindwiseAnalysis,
} from "@/lib/plantVision";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Plant Vision — HydroNova" },
      {
        name: "description",
        content:
          "AI-powered camera detects disease, growth, color, dry leaves, nutrient deficiency and NPK values.",
      },
    ],
  }),
  component: AI,
});

function AI() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadedImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [result, setResult] = useState<PlantAnalysis | null>(null);

  // Detailed diagnosis from the Python ML service (ml-service/), only run
  // for uploaded photos — see handleUploadedImageLoad below.
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [diagnosis, setDiagnosis] = useState<MLPlantDiagnosis | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  // Warm up the TF.js model in the background on mount
  useEffect(() => {
    preloadPlantModel()
      .then(() => setModelReady(true))
      .catch(() => setModelReady(false));
  }, []);

  // Start the webcam by default so the card shows a live feed like the design
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setCameraError(null);
    setUploadedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      scanIntervalRef.current = window.setInterval(() => runLiveScan(), 3000);
    } catch (err) {
      setCameraOn(false);
      setCameraError("Camera access denied or unavailable. You can still upload a photo below.");
    }
  }

  function stopCamera() {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function runLiveScan() {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      const analysis = await analyzePlantImage(canvas);
      setResult(analysis);
    } catch {
      // ignore transient errors between frames
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setUploadedFile(file);
    setResult(null);
    setDiagnosis(null);
    setDiagnosisError(null);
    
    // Directly run ML diagnosis with the uploaded file
    runMLDiagnosis(file);

    e.target.value = "";
  }

  async function runMLDiagnosis(file: File) {
    setDiagnosing(true);
    setDiagnosisError(null);

    try {
      const result = await predictDisease(file);
      console.log("Backend ML Response:", result);

      setDiagnosis({
        diseaseName: result.disease ?? "Unknown",
        confidence: (result.confidence ?? 0) / 100,
        healthy: Boolean(result.healthy),
        healthScore: result.healthy ? 100 : Math.max(0, 100 - Math.round(result.confidence ?? 0)),
        nutrientDeficiency: result.nutrientDeficiency ?? "None",
        colorAnalysis: result.colorAnalysis ?? "Normal",
        dryLeaf: Boolean(result.dryLeaf),
        severity: result.severity ?? "None",
        risk: result.risk ?? "Low",
        description: result.description ?? "",
        cause: result.cause ?? "",
        recommendation: Array.isArray(result.recommendation) ? result.recommendation : [],
        npk: result.npk ?? { nitrogen: 0, phosphorus: 0, potassium: 0 },
        kindwise: result.kindwise,
      });
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setDiagnosisError(err?.message || "Unable to reach the ML service.");
    } finally {
      setDiagnosing(false);
    }
  }

  async function handleUploadedImageLoad() {
    if (!uploadedImgRef.current) return;

    setAnalyzing(true);
    try {
      const analysis = await analyzePlantImage(uploadedImgRef.current);
      setResult(analysis);
    } catch (err) {
      console.warn("Plant vision analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  }

  function backToLiveCamera() {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(null);
    setUploadedFile(null);
    setResult(null);
    setDiagnosis(null);
    setDiagnosisError(null);
    startCamera();
  }

  const healthPct = result ? result.healthScore : 96;
  const diseaseCount = result ? (result.healthy ? 0 : 1) : 0;

  const detections = [
    {
      i: Bug,
      t: "Leaf disease",
      desc: "Detected disease using AI model.",
      v: diagnosis ? diagnosis.diseaseName : result ? result.label : "Analyzing...",
      ok: diagnosis ? diagnosis.healthy : true,
    },

    {
      i: Activity,
      t: "Severity",
      desc: "Estimated infection severity.",
      v: diagnosis ? diagnosis.severity : "--",
      ok: diagnosis ? diagnosis.healthy : true,
    },

    {
      i: Sun,
      t: "Color analysis",
      desc: "Leaf pigment analysis.",
      v: diagnosis ? diagnosis.colorAnalysis : "--",
      ok: diagnosis ? diagnosis.healthy : true,
    },

    {
      i: Leaf,
      t: "Dry leaf detection",
      desc: "Dryness estimated from leaf.",
      v: diagnosis ? (diagnosis.dryLeaf ? "Dry leaf detected" : "Healthy leaf") : "--",
      ok: diagnosis ? !diagnosis.dryLeaf : true,
    },

    {
      i: FlaskConical,
      t: "Nutrient deficiency",
      desc: "Detected possible nutrient deficiency.",
      v: diagnosis ? diagnosis.nutrientDeficiency : "--",
      ok: diagnosis ? diagnosis.healthy : true,
    },

    {
      i: Droplets,
      t: "NPK estimation",
      desc: "Estimated NPK values.",
      v: "",
      ok: diagnosis ? diagnosis.healthy : true,
    },
  ];

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Plant Detection · Camera AI
        </p>
        <h1 className="mt-1 text-4xl font-bold">See what your plants are saying</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A 1080p HD camera streams to an on-device ML model that continuously evaluates plant
          health.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <FadeIn>
            <div>
              <Card className="relative overflow-hidden border-border/60 bg-gradient-deep p-2 text-primary-foreground shadow-glow">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                  {uploadedImage ? (
                    <img
                      ref={uploadedImgRef}
                      src={uploadedImage}
                      alt="Uploaded plant"
                      className="h-full w-full object-cover"
                      onLoad={handleUploadedImageLoad}
                    />
                  ) : cameraOn ? (
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-white/70">
                      <VideoOff className="h-8 w-8" />
                      {cameraError ?? "Camera is off."}
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {(cameraOn || analyzing) && <ScannerOverlay />}

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs backdrop-blur">
                    <span
                      className={`h-2 w-2 rounded-full ${cameraOn || analyzing ? "animate-pulse bg-accent" : "bg-white/40"}`}
                    />
                    {uploadedImage
                      ? analyzing
                        ? "Analyzing photo…"
                        : "Photo analyzed"
                      : cameraOn
                        ? "AI scanning"
                        : "Idle"}
                    {!modelReady && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-xs">
                    <Tag icon={<Camera className="h-3 w-3" />} label="HD camera" />
                  </div>
                </div>
              </Card>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={handleUploadClick} className="gap-2">
                  <Upload className="h-4 w-4" /> Upload photo from device
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadedImage ? (
                  <Button variant="outline" onClick={backToLiveCamera} className="gap-2">
                    <Video className="h-4 w-4" /> Back to live camera
                  </Button>
                ) : !cameraOn ? (
                  <Button variant="outline" onClick={startCamera} className="gap-2">
                    <Video className="h-4 w-4" /> Retry camera
                  </Button>
                ) : null}
              </div>
            </div>
          </FadeIn>
          <div className="grid gap-4">
            {detections.slice(0, 3).map((d, i) => (
              <FadeIn key={d.t} delay={i * 0.05}>
                <DetectionRow {...d} />
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {detections.slice(3, 5).map((d, i) => (
            <FadeIn key={d.t} delay={i * 0.05}>
              <DetectionCard {...d} />
            </FadeIn>
          ))}

          <FadeIn delay={0.1}>
            <NPKCard diagnosis={diagnosis} />
          </FadeIn>
        </div>

        {uploadedImage && (
          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Photo diagnosis
            </p>
            <h2 className="mt-1 text-2xl font-bold">Detailed ML diagnosis</h2>

            {diagnosing && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground backdrop-blur">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
                <div>
                  <p className="font-medium text-foreground">Running AI diagnosis…</p>
                  <p className="text-xs text-muted-foreground">
                    Analyzing with the local ML model and cross-checking with Kindwise for a
                    detailed second opinion.
                  </p>
                </div>
              </div>
            )}

            {diagnosisError && !diagnosing && (
              <Card className="mt-4 flex items-start gap-3 border-destructive/40 bg-destructive/5 p-5">
                <ServerCrash className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Couldn't reach the ML service</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {diagnosisError} Make sure the Python service is running (
                    <code className="rounded bg-muted px-1 py-0.5">
                      cd ml-service && python app.py
                    </code>
                    ) on port 8000.
                  </p>
                </div>
              </Card>
            )}

            {diagnosis && !diagnosing && (
              <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2">
                <FadeIn>
                  <Card className="h-full border-border/60 bg-card/60 p-5 backdrop-blur">
                    <div className="flex items-start gap-4">
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground ${
                          diagnosis.healthy ? "bg-gradient-aqua" : "bg-destructive"
                        }`}
                      >
                        <Stethoscope className="h-5 w-5" />
                      </span>

                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Disease
                        </p>

                        <p
                          className={`mt-1 text-lg font-bold ${
                            diagnosis.healthy ? "" : "text-destructive"
                          }`}
                        >
                          {diagnosis.diseaseName}
                        </p>

                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Confidence</span>
                            <span>{Math.round(diagnosis.confidence * 100)}%</span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${
                                diagnosis.healthy ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.round(diagnosis.confidence * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground">
                          Health Score: {diagnosis.healthScore}%
                        </p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.05}>
                  <DiagnosisCard
                    icon={AlertTriangle}
                    label="Likely cause"
                    value={diagnosis.healthy ? "No concerning signs" : diagnosis.diseaseName}
                    ok={diagnosis.healthy}
                    detail={diagnosis.description}
                  />
                </FadeIn>

                <FadeIn delay={0.1}>
                  <DiagnosisCard
                    icon={FlaskConical}
                    label="Nutrient & color"
                    value={diagnosis.nutrientDeficiency}
                    ok={diagnosis.healthy}
                    detail={`Color analysis: ${diagnosis.colorAnalysis}`}
                  />
                </FadeIn>

                <FadeIn delay={0.15}>
                  <DiagnosisCard
                    icon={Wrench}
                    label="Recommended solution"
                    value={diagnosis.healthy ? "No action needed" : "Action recommended"}
                    ok={diagnosis.healthy}
                    detail={diagnosis.recommendation.join("\n")}
                  />
                </FadeIn>

                <FadeIn delay={0.2}>
                  <Card className="h-full p-5">
                    <h3 className="font-semibold mb-2">Risk Level</h3>
                    <RiskGauge risk={diagnosis.risk} />
                  </Card>
                </FadeIn>

                <FadeIn delay={0.25}>
                  <Card className="h-full p-5">
                    <h3 className="font-semibold mb-2">AI Recommendation</h3>

                    <ul className="space-y-2 text-sm">
                      {diagnosis.recommendation.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">✔</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </FadeIn>

                {diagnosis.kindwise && (
                  <FadeIn delay={0.3}>
                    <div className="md:col-span-2">
                      <KindwiseCard kindwise={diagnosis.kindwise} />
                    </div>
                  </FadeIn>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur">
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  );
}

function ScannerOverlay() {
  return (
    <>
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-px bg-accent shadow-[0_0_20px_4px_var(--leaf)]"
      />
      <div className="absolute inset-6 rounded-2xl border border-accent/40" />
      {["left-6 top-6", "right-6 top-6", "left-6 bottom-6", "right-6 bottom-6"].map((p) => (
        <div key={p} className={`absolute ${p} h-4 w-4 border-accent`}>
          <div className="absolute inset-0 border-l-2 border-t-2 border-accent" />
        </div>
      ))}
    </>
  );
}

function DetectionRow({
  i: Icon,
  t,
  desc,
  v,
  ok,
}: {
  i: typeof Bug;
  t: string;
  desc: string;
  v: string;
  ok: boolean;
}) {
  return (
    <Card className="flex items-start gap-4 border-border/60 bg-card/60 p-5 backdrop-blur">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-aqua text-primary-foreground shadow-glow">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{t}</p>
          <Badge
            className={
              ok
                ? "bg-accent/15 text-accent hover:bg-accent/15"
                : "bg-destructive/15 text-destructive"
            }
          >
            {v}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </Card>
  );
}

function DiagnosisCard({
  icon: Icon,
  label,
  value,
  detail,
  ok,
}: {
  icon: typeof Bug;
  label: string;
  value: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <Card className="flex h-full items-start gap-4 border-border/60 bg-card/60 p-5 backdrop-blur">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-glow ${
          ok ? "bg-gradient-aqua" : "bg-destructive"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`mt-0.5 font-semibold ${ok ? "" : "text-destructive"}`}>{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </Card>
  );
}

function DetectionCard({
  i: Icon,
  t,
  desc,
  v,
}: {
  i: typeof Bug;
  t: string;
  desc: string;
  v: string;
  ok?: boolean;
}) {
  return (
    <Card className="h-full border-border/60 bg-card/60 p-5 backdrop-blur">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-semibold">{t}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <p className="mt-3 text-sm font-semibold text-accent">{v}</p>
    </Card>
  );
}

// NPK reference ranges used only for bar scaling (not medical/agronomic thresholds)
const NPK_RANGES = {
  nitrogen: { max: 150, color: "#3b82f6" }, // blue
  phosphorus: { max: 100, color: "#f97316" }, // orange
  potassium: { max: 150, color: "#22c55e" }, // green
} as const;

function NPKCard({ diagnosis }: { diagnosis: MLPlantDiagnosis | null }) {
  const nitrogen = diagnosis?.npk.nitrogen ?? 0;
  const phosphorus = diagnosis?.npk.phosphorus ?? 0;
  const potassium = diagnosis?.npk.potassium ?? 0;

  return (
    <Card className="h-full border-border/60 bg-card/60 p-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white">
          <Droplets className="h-5 w-5" />
        </span>

        <div>
          <h3 className="font-semibold">NPK Estimation</h3>
          <p className="text-sm text-muted-foreground">Estimated nutrient levels</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <NutrientBar
          label="Nitrogen"
          value={nitrogen}
          max={NPK_RANGES.nitrogen.max}
          color={NPK_RANGES.nitrogen.color}
        />
        <NutrientBar
          label="Phosphorus"
          value={phosphorus}
          max={NPK_RANGES.phosphorus.max}
          color={NPK_RANGES.phosphorus.color}
        />
        <NutrientBar
          label="Potassium"
          value={potassium}
          max={NPK_RANGES.potassium.max}
          color={NPK_RANGES.potassium.color}
        />
      </div>
    </Card>
  );
}

function NutrientBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value} ppm <span className="text-muted-foreground">({pct}%)</span>
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function RiskGauge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const config = {
    Low: { angle: -55, color: "#22c55e", label: "Low Risk" },
    Medium: { angle: 0, color: "#eab308", label: "Medium Risk" },
    High: { angle: 55, color: "#ef4444", label: "High Risk" },
  } as const;

  const { angle, color, label } = config[risk] ?? config.Low;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[240px]">
        {/* Green zone */}
        <path
          d="M 20 100 A 80 80 0 0 1 68 30"
          fill="none"
          stroke="#22c55e"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Yellow zone */}
        <path
          d="M 74 25 A 80 80 0 0 1 126 25"
          fill="none"
          stroke="#eab308"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Red zone */}
        <path
          d="M 132 30 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#ef4444"
          strokeWidth={16}
          strokeLinecap="round"
        />

        {/* Scale labels */}
        <text x="14" y="118" fontSize="11" fill="#22c55e" fontWeight="600">
          Low
        </text>
        <text x="86" y="14" fontSize="11" fill="#eab308" fontWeight="600">
          Medium
        </text>
        <text x="160" y="118" fontSize="11" fill="#ef4444" fontWeight="600">
          High
        </text>

        {/* Needle */}
        <g style={{ transition: "transform 0.5s ease" }} transform={`rotate(${angle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="28"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        <circle cx="100" cy="100" r="7" fill={color} />
      </svg>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function KindwiseCard({ kindwise }: { kindwise: KindwiseAnalysis }) {
  // Unavailable or errored — show why, instead of hiding the card silently.
  if (!kindwise.available) {
    return (
      <Card className="border-border/60 bg-card/60 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ServerCrash className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold"> AI Analysis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              UPCOMMING COMMING SOON !!! (API KEY NEEDED ) This second-opinion analysis isn't
              available right now
              {kindwise.error ? `: ${kindwise.error}` : "."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check that API_KEY is set in ml-service/.env and the service was restarted after
              adding it.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const treatmentEntries = kindwise.treatment
    ? Object.entries(kindwise.treatment).filter(([, v]) => v)
    : [];

  return (
    <Card className="border-border/60 bg-card/60 p-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-aqua text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold">Kindwise AI Analysis</h3>
          <p className="text-sm text-muted-foreground">Detailed second-opinion identification</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Identified issue
          </p>
          <p className={`mt-1 text-lg font-bold ${kindwise.healthy ? "" : "text-destructive"}`}>
            {kindwise.disease}
          </p>

          {typeof kindwise.confidence === "number" && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>Confidence</span>
                <span>{Math.round(kindwise.confidence)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    kindwise.healthy ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.round(kindwise.confidence)}%` }}
                />
              </div>
            </div>
          )}

          {kindwise.cause && (
            <p className="mt-4 text-sm">
              <span className="font-semibold">Cause: </span>
              {kindwise.cause}
            </p>
          )}

          {kindwise.description && (
            <p className="mt-2 text-sm text-muted-foreground">{kindwise.description}</p>
          )}

          {!kindwise.cause && !kindwise.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              No additional description available for this class.
            </p>
          )}
        </div>

        <div>
          {treatmentEntries.length > 0 ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Treatment
              </p>
              <div className="mt-2 space-y-3">
                {treatmentEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-semibold capitalize">{key}</p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No treatment details available for this class.
            </p>
          )}

          {kindwise.alternatives && kindwise.alternatives.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Other possibilities
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {kindwise.alternatives.map((alt) => (
                  <li key={alt.name} className="flex justify-between">
                    <span>{alt.name}</span>
                    <span className="text-muted-foreground">{Math.round(alt.probability)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
