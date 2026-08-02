DISEASE_INFO = {
    "Healthy": {
        "severity": "None",
        "risk": "Low",
        "cause": "No disease detected.",
        "description": (
            "The leaf shows uniform green coloration, intact tissue, and no visible "
            "lesions, spots, or discoloration. This is consistent with a healthy, "
            "well-nourished plant."
        ),
        "recommendation": [
            "Continue current watering and feeding schedule.",
            "Monitor leaves weekly for early signs of stress, spotting, or discoloration.",
            "Maintain good air circulation to prevent future fungal issues.",
            "Rotate crops or refresh growing medium periodically to avoid nutrient depletion.",
        ],
        "nutrientDeficiency": "None detected",
        "colorAnalysis": "Uniform green pigmentation, no chlorosis or necrosis observed",
        "dryLeaf": False,
        "npk": {"nitrogen": 85, "phosphorus": 45, "potassium": 90},
    },
    "Powdery": {
        "severity": "Medium",
        "risk": "Medium",
        "cause": (
            "Fungal infection (powdery mildew), typically caused by high humidity, "
            "poor air circulation, and overcrowded planting. Spreads rapidly via "
            "airborne spores in warm, dry daytime conditions following cool, humid nights."
        ),
        "description": (
            "White to grayish powdery fungal growth is visible on the leaf surface, "
            "usually starting on upper leaves and spreading to lower foliage. Left "
            "untreated, it can reduce photosynthesis and stunt growth."
        ),
        "recommendation": [
            "Improve air circulation by spacing plants further apart or pruning dense growth.",
            "Avoid overhead watering; water at the base to keep foliage dry.",
            "Remove and dispose of heavily infected leaves — do not compost them.",
            "Apply a sulfur-based or potassium bicarbonate fungicide at first sign of spread.",
            "Reduce nitrogen-heavy fertilization, which encourages tender, susceptible growth.",
        ],
        "nutrientDeficiency": "Possible potassium deficiency, weakening cell wall resistance",
        "colorAnalysis": "Whitish-gray powdery patches over otherwise green tissue",
        "dryLeaf": False,
        "npk": {"nitrogen": 55, "phosphorus": 35, "potassium": 45},
    },
    "Rust": {
        "severity": "High",
        "risk": "High",
        "cause": (
            "Fungal infection (rust fungus), spread by wind-borne spores and favored "
            "by prolonged leaf wetness, moderate temperatures, and high humidity. "
            "Often worsens quickly once established and can overwinter in plant debris."
        ),
        "description": (
            "Orange to reddish-brown pustules are visible on the leaf surface, "
            "typically on the underside first. Severe infections cause premature "
            "leaf drop, reduced vigor, and can significantly impact yield if untreated."
        ),
        "recommendation": [
            "Remove and destroy infected leaves immediately to reduce spore spread.",
            "Avoid overhead watering and water early in the day so foliage dries quickly.",
            "Apply a copper-based or triazole fungicide, especially on new growth.",
            "Increase spacing between plants to improve airflow and reduce humidity buildup.",
            "Clear fallen infected leaves and debris at season's end to reduce overwintering spores.",
        ],
        "nutrientDeficiency": "Possible nitrogen deficiency, reducing plant vigor and resistance",
        "colorAnalysis": "Orange-brown rust-colored lesions, often with a raised, powdery texture",
        "dryLeaf": True,
        "npk": {"nitrogen": 35, "phosphorus": 30, "potassium": 30},
    },
}