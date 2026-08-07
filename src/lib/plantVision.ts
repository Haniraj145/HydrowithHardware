export type PlantAnalysis = {
  healthy: boolean;
  label: string;
  confidence: number;
  healthScore: number;
  raw: {
    className: string;
    probability: number;
  }[];
};

export type KindwiseAnalysis = {
  available: boolean;
  error?: string;
  healthy?: boolean;
  disease?: string;
  confidence?: number;
  cause?: string;
  description?: string;
  treatment?: Record<string, string>;
  alternatives?: Array<{ name: string; probability: number }>;
};

export type MLPlantDiagnosis = {
  diseaseName: string;
  confidence: number;
  healthy: boolean;
  healthScore: number;
  severity: string;
  risk: "Low" | "Medium" | "High";
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
};

let model: any = null;

async function getModel() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!model) {
    const tf = await import("@tensorflow/tfjs");
    const mobilenet = await import("@tensorflow-models/mobilenet");
    await tf.ready();
    model = await mobilenet.load({
      version: 2,
      alpha: 1,
    });
  }
  return model;
}

export async function preloadPlantModel() {
  if (typeof window === "undefined") return;
  await getModel();
}

const UNHEALTHY_HINTS = [
  "fungus",
  "mushroom",
  "mold",
  "rot",
  "dead",
  "dry",
  "wilt",
  "brown",
  "rust",
  "spider",
  "worm",
  "slug",
  "snail",
  "caterpillar",
];

const PLANT_HINTS = [
  "leaf",
  "plant",
  "flower",
  "tree",
  "fern",
  "vine",
  "herb",
  "corn",
  "cabbage",
  "lettuce",
  "cucumber",
];

export async function analyzePlantImage(
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<PlantAnalysis> {
  if (typeof window === "undefined") {
    return {
      healthy: true,
      label: "Unknown",
      confidence: 0,
      healthScore: 100,
      raw: [],
    };
  }

  const loadedModel = await getModel();
  if (!loadedModel) {
    return {
      healthy: true,
      label: "Model unavailable",
      confidence: 0,
      healthScore: 100,
      raw: [],
    };
  }

  const predictions = await loadedModel.classify(image, 5);
  const top = predictions[0] || { className: "Unknown", probability: 0 };
  const text = predictions
    .map((p: { className: string }) => p.className.toLowerCase())
    .join(",");

  const unhealthy = UNHEALTHY_HINTS.some((x) => text.includes(x));
  const plant = PLANT_HINTS.some((x) => text.includes(x));

  return {
    healthy: !unhealthy,
    label: unhealthy
      ? "Possible disease detected"
      : plant
      ? "Healthy Leaf"
      : "Unknown",
    confidence: top.probability,
    healthScore: unhealthy ? 45 : 95,
    raw: predictions,
  };
}