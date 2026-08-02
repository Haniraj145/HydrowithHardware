let tfModule: typeof import("@tensorflow/tfjs") | null = null;
let mobilenetModule: typeof import("@tensorflow-models/mobilenet") | null = null;

export type PlantAnalysis = {
  healthy: boolean;
  label: string;
  confidence: number;
  healthScore: number;
  raw: { className: string; probability: number }[];
};

let modelPromise: Promise<any> | null = null;

/**
 * Loads TensorFlow.js + MobileNet only when needed.
 */
async function getModel() {
  if (!modelPromise) {
    if (!tfModule) {
      tfModule = await import("@tensorflow/tfjs");
    }

    if (!mobilenetModule) {
      mobilenetModule = await import("@tensorflow-models/mobilenet");
    }

    modelPromise = mobilenetModule.load({
      version: 2,
      alpha: 1.0,
    });
  }

  return modelPromise;
}

export async function preloadPlantModel() {
  await getModel();
}

// Keywords among ImageNet classes that tend to correlate with wilted,
// diseased, dry, or generally unhealthy-looking foliage/plant matter.
const UNHEALTHY_HINTS = [
  "fungus", "mushroom", "mold", "rot", "dead", "dry", "wilt", "brown",
  "rust", "spider web", "moth", "insect", "worm", "slug", "snail",
  "caterpillar", "weevil",
];

const PLANT_HINTS = [
  "leaf", "plant", "flower", "tree", "fern", "vine", "herb", "corn",
  "cabbage", "lettuce", "cress", "artichoke", "cucumber", "squash",
  "mushroom", "daisy", "rapeseed", "buckeye",
];

export async function analyzePlantImage(source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<PlantAnalysis> {
  const model = await getModel();
  const predictions = await model.classify(source, 5);

  const topText = predictions.map((p) => p.className.toLowerCase()).join(", ");
  const hasUnhealthyHint = UNHEALTHY_HINTS.some((k) => topText.includes(k));
  const looksLikePlant = PLANT_HINTS.some((k) => topText.includes(k));

  const top = predictions[0] ?? { className: "Unknown", probability: 0 };
  const confidence = top.probability;

  const healthy = !hasUnhealthyHint;
  const healthScore = Math.round(
    healthy
      ? 82 + confidence * 15 // 82-97%
      : 35 + (1 - confidence) * 20, // lower when confident it's something bad
  );

  const label = hasUnhealthyHint
    ? "Possible stress / disease signs"
    : looksLikePlant
      ? "Healthy foliage"
      : "No clear leaf detected";

  return {
    healthy,
    label,
    confidence,
    healthScore: Math.max(0, Math.min(100, healthScore)),
    raw: predictions.map((p) => ({ className: p.className, probability: p.probability })),
  };
}
export const tf = {
  ready: async () => {
    if (!tfModule) {
      tfModule = await import("@tensorflow/tfjs");
    }
    return tfModule.ready();
  },
};

// ---------------------------------------------------------------------------
// ML service integration (Python/Flask) — used for the detailed diagnosis
// cards on the "Upload photo from device" flow on the AI Vision page.
// This is separate from the MobileNet-based analyzePlantImage() above, which
// keeps powering the lightweight live-camera scan.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Kindwise (Plant.id) integration — a more precise, third-party disease
// identification layer returned by the backend alongside the local model's
// result. See ml-service/kindwise_client.py for how this is populated.
// ---------------------------------------------------------------------------
export interface KindwiseTreatment {
  biological: string | null;
  chemical: string | null;
  prevention: string | null;
}

export interface KindwiseAlternative {
  name: string;
  probability: number; // 0-100
}

export interface KindwiseAnalysis {
  available: boolean;
  error?: string;
  healthy?: boolean;
  disease?: string;
  confidence?: number; // 0-100
  description?: string | null;
  cause?: string | null;
  treatment?: KindwiseTreatment | null;
  alternatives?: KindwiseAlternative[];
}

export interface MLPlantDiagnosis {
  diseaseName: string;
  confidence: number;
  healthy: boolean;

  severity: string;
  risk: string;

  description: string;
  cause: string;

  recommendation: string[];

  nutrientDeficiency: string;
  colorAnalysis: string;
  dryLeaf: boolean;

  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };

  kindwise?: KindwiseAnalysis;
}