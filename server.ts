import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Helper to format AI errors gracefully
function getFriendlyErrorMessage(err: any): string {
  const msg = typeof err?.message === "string" ? err.message : JSON.stringify(err);
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("Overloaded")) {
    return "The AI service is currently experiencing high demand. Please try again in a few moments.";
  }
  return msg;
}

// Lazy / Safe initialization of Gemini Client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini API calls may fail.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Resilient text content generator with model fallback
async function generateContentWithFallback(
  prompt: string,
  schema: any,
  models = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite"]
) {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Gemini Request] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err: any) {
      console.warn(`[Gemini Warning] Model ${model} failed:`, err?.message || err);
      lastError = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  throw lastError || new Error("All AI models are currently unavailable.");
}

// Fallback rule-based generator for scripts if all external models are 503
function generateLocalScriptFallback(topic: string, count = 8) {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  const affirmationsPool = [
    `The body welcomes restorative balance, releasing all excess tension.`,
    `Focus is steady, effortless, and deeply aligned with inner discipline.`,
    `Cravings and distractions dissolve naturally into quiet calmness.`,
    `Every breath deepens physical recovery and mental fortitude.`,
    `The subconscious absorbs clarity and acts with calm certainty.`,
    `Rest comes easily, renewing energy, focus, and willpower.`,
    `The mind chooses stillness over noise, anchored in high purpose.`,
    `Progress is continuous, peaceful, and fully sustained.`,
  ];

  return {
    title: `${cleanTopic} Subconscious Alignment`,
    category: lower.includes("sleep")
      ? "Sleep & Recovery"
      : lower.includes("fast")
      ? "Discipline & Fasting"
      : "Mindset & Focus",
    recommendedVoice: "Kore",
    toneGuidance: "Listen at soft subliminal attenuation (-26 dB) with brown noise bed.",
    phrases: affirmationsPool.slice(0, count),
  };
}

// Fallback rule-based generator for story cast when external models are busy
function generateLocalCastFallback(title: string, paragraphs: string[]) {
  const cleanTitle = (title || "Story").trim();

  // Create standard multi-voice character ensemble
  const characters = [
    {
      id: "char_narrator",
      name: "Narrator",
      role: "narrator",
      description: "Steady, articulate bedtime storyteller providing grounding context and calm scene descriptions.",
      voiceName: "Aoede",
      personaId: "calm_narrator",
      customDirective: "Speak as a gentle, grounded storyteller in a calm, soothing, steady, and articulately paced cadence",
      colorTag: "amber",
      avatarIcon: "book",
    },
    {
      id: "char_inner_voice",
      name: "Subconscious Whisperer",
      role: "inner_voice",
      description: "Intimate inner subconscious voice whispering affirmations and deep restorative cues directly to the listener.",
      voiceName: "Zephyr",
      personaId: "binaural_whisperer",
      customDirective: "Speak in an extremely close-mic, intimate, ultra-soft ASMR breathy whisper, with gentle pauses and hypnotic softness",
      colorTag: "purple",
      avatarIcon: "sparkles",
    },
    {
      id: "char_sage",
      name: "Ancient Sage",
      role: "sage",
      description: "Wise mentor with a deep, resonant timbre offering philosophical insight and peaceful guidance.",
      voiceName: "Fenrir",
      personaId: "sacred_sage",
      customDirective: "Speak with reverent, spacious, meditative serenity and timeless wisdom, like an ancient spiritual master",
      colorTag: "cyan",
      avatarIcon: "brain",
    },
    {
      id: "char_guide",
      name: "Compassionate Guide",
      role: "companion",
      description: "Warm, supportive, and soothing presence nurturing safety, heart-space release, and calm comfort.",
      voiceName: "Kore",
      personaId: "warm_compassion",
      customDirective: "Speak with deep emotional warmth, unconditional kindness, soothing comfort, and maternal reassurance",
      colorTag: "rose",
      avatarIcon: "heart",
    },
  ];

  // Assign paragraphs intelligently:
  // Quotation marks or direct address -> Sage / Guide / Inner Voice; regular prose -> Narrator
  const paragraphAssignments: Record<number, { characterId: string; speakerName: string }> = {};

  paragraphs.forEach((pText, idx) => {
    const text = pText.trim();
    if (text.includes('"') || text.includes('“') || text.includes('”')) {
      if (idx % 2 === 0) {
        paragraphAssignments[idx] = { characterId: "char_sage", speakerName: "Ancient Sage" };
      } else {
        paragraphAssignments[idx] = { characterId: "char_guide", speakerName: "Compassionate Guide" };
      }
    } else if (text.toLowerCase().includes("you ") || text.toLowerCase().includes("your ") || text.toLowerCase().includes("feel") || text.toLowerCase().includes("breathe")) {
      if (idx % 3 === 0) {
        paragraphAssignments[idx] = { characterId: "char_inner_voice", speakerName: "Subconscious Whisperer" };
      } else {
        paragraphAssignments[idx] = { characterId: "char_narrator", speakerName: "Narrator" };
      }
    } else {
      paragraphAssignments[idx] = { characterId: "char_narrator", speakerName: "Narrator" };
    }
  });

  return {
    title: cleanTitle,
    summary: `Cast detected for "${cleanTitle}" with ${characters.length} dynamic voices.`,
    characters,
    paragraphAssignments,
  };
}

// Fallback rule-based generator for protocols if all external models are 503
function generateLocalProtocolFallback(topic: string) {
  const cleanTopic = topic.trim();
  return {
    name: `${cleanTopic} Protocol`,
    guardian: "Misty",
    timeWindowStart: "05:00",
    timeWindowEnd: "17:00",
    layerNames: [
      `Receptivity: Trust & Focus Alignment`,
      `Metabolic & Physical Discipline`,
      `Stress Mitigation & Cortisol Release`,
      `Transit Fortitude & Endurance Focus`,
      `Wake Readiness & Action Trigger`,
    ],
    wakePromptText: `Session complete. All metrics and focus cycles logged. Let's move forward.`,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Voice TTS Synthesis endpoint using Gemini TTS
  app.post("/api/synthesize-voice", async (req, res) => {
    try {
      const { text, voiceName = "Kore", promptStyle = "soft_whisper", personaId, customDirective } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required for voice synthesis." });
      }

      const ai = getGenAI();

      let styledPrompt = "";
      const effectivePersona = personaId || promptStyle;

      if (customDirective && typeof customDirective === "string" && customDirective.trim().length > 0) {
        styledPrompt = `${customDirective.trim()}: "${text}"`;
      } else if (effectivePersona === "calm_narrator") {
        styledPrompt = `Speak as a gentle, grounded storyteller in a calm, soothing, steady, and articulately paced cadence: "${text}"`;
      } else if (effectivePersona === "binaural_whisperer") {
        styledPrompt = `Speak in an extremely close-mic, intimate, ultra-soft ASMR breathy whisper, with gentle pauses and hypnotic softness: "${text}"`;
      } else if (effectivePersona === "energetic_affirmator") {
        styledPrompt = `Speak in an uplifting, confident, inspiring, articulate, and rhythmic empowering cadence with positive momentum and vitality: "${text}"`;
      } else if (effectivePersona === "hypnotic_somnambulist" || effectivePersona === "hypnotic_slow") {
        styledPrompt = `Speak in a drowsy, deeply relaxed, slow hypnotic sleep-induction cadence, drawing out calming vowel sounds with prolonged pauses: "${text}"`;
      } else if (effectivePersona === "sacred_sage") {
        styledPrompt = `Speak with reverent, spacious, meditative serenity and timeless wisdom, like an ancient spiritual master reciting sacred truths: "${text}"`;
      } else if (effectivePersona === "warm_compassion" || effectivePersona === "warm_gentle") {
        styledPrompt = `Speak with deep emotional warmth, unconditional kindness, soothing comfort, and maternal/paternal reassurance: "${text}"`;
      } else if (effectivePersona === "gentle_zen") {
        styledPrompt = `Speak in a clean, tranquil, minimalist, and unhurried Zen cadence with natural breathing spaces: "${text}"`;
      } else if (effectivePersona === "cinematic_deep") {
        styledPrompt = `Speak in a deep, cinematic, rich baritone, steady, commanding, yet profoundly relaxing and grounding: "${text}"`;
      } else if (effectivePersona === "soft_whisper") {
        styledPrompt = `Speak in a calm, extremely soft, rhythmic, and slow whisper: "${text}"`;
      } else {
        styledPrompt = `Speak calmly and softly: "${text}"`;
      }

      console.log(`[TTS] Synthesizing (${customDirective ? 'Custom Character' : effectivePersona}): "${text.slice(0, 40)}..." Voice: ${voiceName}`);

      let response: any = null;
      let ttsError: any = null;

      // Try up to 2 attempts on the TTS model with delay
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [
              {
                parts: [{ text: styledPrompt }],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName || "Kore",
                  },
                },
              },
            },
          });
          if (response) break;
        } catch (err: any) {
          console.warn(`[TTS Attempt ${attempt} failed]:`, err?.message || err);
          ttsError = err;
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (!response) {
        throw ttsError || new Error("TTS service is experiencing high demand. Please try again shortly.");
      }

      let audioBase64: string | null = null;
      let mimeType = "audio/wav";

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            audioBase64 = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }

      if (!audioBase64) {
        return res.status(502).json({
          error: "No audio stream returned from Gemini TTS. Please verify API key configuration.",
        });
      }

      return res.json({
        success: true,
        audioBase64,
        mimeType,
        text,
        voiceName,
      });
    } catch (err: any) {
      console.error("[TTS Error]:", err);
      return res.status(503).json({
        error: getFriendlyErrorMessage(err),
      });
    }
  });

  // AI Story Voice Cast & Character Analyzer
  app.post("/api/analyze-story-cast", async (req, res) => {
    try {
      const { title = "Story", paragraphs = [] } = req.body;

      if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        return res.status(400).json({ error: "Paragraphs array is required for character analysis." });
      }

      const sampleText = paragraphs
        .slice(0, 15)
        .map((p: string, i: number) => `[Paragraph ${i}]: ${p}`)
        .join("\n\n");

      const prompt = `You are a master audio director and voice casting engineer for an immersive AI audiobook and subliminal sleep studio.
Analyze the following story excerpt and detect all distinct character roles, speakers, and narrative viewpoints.

Available Base Voice Actors in Gemini TTS:
- "Kore": Warm, soothing, compassionate female mezzo voice (great for Nurturing Guides, Caring Protagonists, Healers)
- "Aoede": Classical, articulate, breezy alto female voice (great for Storytellers, Queens, Explorers)
- "Zephyr": Airy, intimate, breathy whisper voice (great for Subconscious Mind, Spirits, ASMR guides)
- "Puck": Dynamic, youthful, rhythmic male tenor voice (great for Adventurers, Young Protagonists, Energetic allies)
- "Fenrir": Deep, resonant, commanding baritone male voice (great for Ancient Sages, Kings, Mentors, Titans)
- "Charon": Low, somber, tranquil bass male voice (great for Sleep Guardians, Mystics, Monks)

Story Title: "${title}"
Excerpt:
${sampleText}

TASK:
1. Identify 2 to 5 distinct voice characters (including the primary Narrator, dialogue characters, subconscious guide, sage, etc.).
2. For each character, assign:
   - "id": unique string like "char_narrator", "char_sage", "char_spirit", etc.
   - "name": character name (e.g., "The Storyteller", "Master Marcus", "Subconscious Whisperer", "Eldrin")
   - "role": one of ["narrator", "protagonist", "sage", "inner_voice", "companion", "elder", "ethereal", "custom"]
   - "description": 1-2 sentence description of who they are and their vocal personality
   - "voiceName": chosen from ["Kore", "Aoede", "Zephyr", "Puck", "Fenrir", "Charon"]
   - "personaId": one of ["calm_narrator", "binaural_whisperer", "energetic_affirmator", "hypnotic_somnambulist", "sacred_sage", "warm_compassion", "gentle_zen", "cinematic_deep"]
   - "customDirective": a precise prompt instruction for Gemini TTS (e.g. "Speak with reverent, deep cosmic stillness and timeless warmth")
   - "colorTag": one of ["amber", "purple", "emerald", "rose", "cyan", "indigo", "orange", "blue"]
   - "avatarIcon": one of ["book", "sparkles", "brain", "feather", "heart", "flame", "moon", "user"]
3. Provide "paragraphAssignments": an array mapping each paragraph index (0 to ${Math.min(paragraphs.length - 1, 14)}) to its assigned "characterId" and "speakerName".

Return JSON matching the schema.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Story title" },
          summary: { type: Type.STRING, description: "Overview of detected cast and tonal atmosphere" },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                description: { type: Type.STRING },
                voiceName: { type: Type.STRING },
                personaId: { type: Type.STRING },
                customDirective: { type: Type.STRING },
                colorTag: { type: Type.STRING },
                avatarIcon: { type: Type.STRING },
              },
              required: ["id", "name", "role", "description", "voiceName", "customDirective", "colorTag", "avatarIcon"],
            },
          },
          paragraphAssignments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                paragraphIndex: { type: Type.INTEGER },
                characterId: { type: Type.STRING },
                speakerName: { type: Type.STRING },
              },
              required: ["paragraphIndex", "characterId", "speakerName"],
            },
          },
        },
        required: ["title", "characters", "paragraphAssignments"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);

        // Convert paragraphAssignments array to a lookup map
        const assignmentsMap: Record<number, { characterId: string; speakerName: string }> = {};
        if (Array.isArray(parsed.paragraphAssignments)) {
          for (const item of parsed.paragraphAssignments) {
            assignmentsMap[item.paragraphIndex] = {
              characterId: item.characterId,
              speakerName: item.speakerName,
            };
          }
        }

        // For any remaining paragraphs beyond the sample window, default intelligently
        for (let i = 0; i < paragraphs.length; i++) {
          if (!assignmentsMap[i]) {
            const defaultChar = parsed.characters[0] || { id: "char_narrator", name: "Narrator" };
            assignmentsMap[i] = {
              characterId: defaultChar.id,
              speakerName: defaultChar.name,
            };
          }
        }

        return res.json({
          success: true,
          data: {
            ...parsed,
            paragraphAssignments: assignmentsMap,
          },
        });
      } catch (aiErr: any) {
        console.warn("[Cast Analyzer Falling Back to Local Generator]:", aiErr?.message);
        const fallbackData = generateLocalCastFallback(title, paragraphs);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Cast Analyzer Error]:", err);
      return res.status(500).json({
        error: getFriendlyErrorMessage(err),
      });
    }
  });

  // AI Affirmation Script Generator
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { topic, count = 8 } = req.body;

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required to generate affirmations." });
      }

      const prompt = `Generate a curated sequence of ${count} high-impact subliminal affirmations and psychological suggestion statements for the following intent/focus: "${topic}".
      
Guidelines for effective subliminal affirmations:
1. Present-tense, positive framing (e.g. "The stomach is settled. The body runs clean on its own energy.", "The mind prefers stillness over rapid feeds.").
2. Avoid clunky negations; focus on the desired calm state, discipline, clarity, or deep rest.
3. Rhythmic, concise phrases (8-16 words each) ideal for spoken audio pacing with breathing gaps.
4. Appropriate for whisper and subliminal noise floor acoustic masking.

Return JSON matching the schema with a descriptive title, category, tone guidance, and array of affirmation strings.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Descriptive title of this subliminal program" },
          category: { type: Type.STRING, description: "Category name" },
          recommendedVoice: { type: Type.STRING, description: "Recommended voice like Kore, Fenrir, Puck, or Charon" },
          toneGuidance: { type: Type.STRING, description: "Short advice on listening and acoustic volume" },
          phrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of subliminal affirmations",
          },
        },
        required: ["title", "category", "recommendedVoice", "toneGuidance", "phrases"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (aiErr: any) {
        console.warn("[Script Generator Falling Back to Local Template]:", aiErr?.message);
        const fallbackData = generateLocalScriptFallback(topic, count);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Script Generator Error]:", err);
      return res.status(500).json({
        error: getFriendlyErrorMessage(err),
      });
    }
  });

  // AI Story Bible Generator
  app.post("/api/generate-story-bible", async (req, res) => {
    try {
      const { plotOrTheme, targetFocus, rampMinutes = 30 } = req.body;

      if (!plotOrTheme || typeof plotOrTheme !== "string") {
        return res.status(400).json({ error: "Plot or theme description is required." });
      }

      const prompt = `You are a master neuro-acoustic sleep conditioning designer, worldbuilder, and clinical hypnotherapy audio director.
Create a comprehensive, deeply immersive, multi-stage "Sleep Conditioning Story Bible" based on the user's plot, theme, or intention:
"${plotOrTheme}"
Target Therapeutic / Reprogramming Focus: "${targetFocus || 'Deep regenerative sleep, dissolving daytime tension, subconscious resilience'}"
Target Sleep Ramp Duration: ${rampMinutes} minutes

TASK:
1. Generate an overarching story title, theme synopsis, rich lore overview, and soothing visual atmosphere designed to induce slow-wave delta sleep.
2. Recommend optimal colored noise masking (e.g. "brown", "pink", "grey") and starting brainwave frequency (e.g. "delta_low", "theta_lucid", "delta_deep").
3. Create a cast of 2 to 4 distinct voice characters matching Gemini TTS base voice actors ("Aoede", "Kore", "Zephyr", "Fenrir", "Charon", "Puck") with customized acoustic prompt directives.
4. Structure 4 progressive sleep chapters mapped to brainwave sleep stages:
   - Chapter 1: Induction & Physical Relaxation (Alpha 10Hz) - gentle grounding scene setting
   - Chapter 2: Whisper Deepening (Theta 6Hz) - intimate, slowing cadence, sinking sensations
   - Chapter 3: Subconscious Reprogramming (Delta 2Hz) - metaphoric subconscious conditioning & core affirmations
   - Chapter 4: All-Night Delta Regeneration (Sub-Delta 0.5-1.5Hz) - timeless, boundless dream sanctuary for continuous night-long conditioning
5. Generate 5-8 embedded subconscious affirmations woven organically into the narrative.

Return JSON matching the schema.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          theme: { type: Type.STRING },
          targetFocus: { type: Type.STRING },
          loreOverview: { type: Type.STRING },
          visualAtmosphere: { type: Type.STRING },
          soundscapeRecommendation: {
            type: Type.OBJECT,
            properties: {
              noiseType: { type: Type.STRING, description: "One of 'brown', 'pink', 'grey', 'green', 'black', 'white'" },
              brainwaveType: { type: Type.STRING, description: "One of 'delta_deep', 'delta_low', 'theta_meditation', 'theta_lucid', 'alpha_relax'" },
              recommendedRampMinutes: { type: Type.INTEGER },
            },
            required: ["noiseType", "brainwaveType", "recommendedRampMinutes"],
          },
          cast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                description: { type: Type.STRING },
                voiceName: { type: Type.STRING },
                personaId: { type: Type.STRING },
                customDirective: { type: Type.STRING },
                colorTag: { type: Type.STRING },
                avatarIcon: { type: Type.STRING },
              },
              required: ["id", "name", "role", "description", "voiceName", "customDirective", "colorTag", "avatarIcon"],
            },
          },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapterIndex: { type: Type.INTEGER },
                title: { type: Type.STRING },
                stage: { type: Type.STRING },
                targetBrainwave: { type: Type.STRING },
                synopsis: { type: Type.STRING },
                sensoryAtmosphere: { type: Type.STRING },
                subliminalDirectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["chapterIndex", "title", "stage", "targetBrainwave", "synopsis", "sensoryAtmosphere", "subliminalDirectives"],
            },
          },
          subconsciousAffirmationsEmbedded: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "theme", "targetFocus", "loreOverview", "visualAtmosphere", "soundscapeRecommendation", "cast", "chapters", "subconsciousAffirmationsEmbedded"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);
        return res.json({
          success: true,
          data: {
            ...parsed,
            id: `bible_${Date.now()}`,
            createdAt: Date.now(),
          },
        });
      } catch (aiErr: any) {
        console.warn("[Story Bible Fallback]:", aiErr?.message);
        const fallbackBible = {
          id: `bible_${Date.now()}`,
          title: "The Sanctuary of Timeless Rest",
          theme: plotOrTheme,
          targetFocus: targetFocus || "Deep subconscious restoration and anxiety release",
          loreOverview: "A serene journey through tranquil crystal groves and boundless starlight sanctuaries where the conscious mind surrenders to peaceful subconscious restoration.",
          visualAtmosphere: "Deep violet dusk, luminous starlight flora, warm amber embers, and drifting silvery mists.",
          soundscapeRecommendation: {
            noiseType: "brown",
            brainwaveType: "delta_deep",
            recommendedRampMinutes: rampMinutes,
          },
          cast: [
            {
              id: "char_narrator",
              name: "The Storyteller",
              role: "narrator",
              description: "Calm, grounding guide leading the initial physical descent into sleep.",
              voiceName: "Aoede",
              personaId: "calm_narrator",
              customDirective: "Speak as a gentle, grounded storyteller in a calm, soothing, steady, and articulately paced cadence",
              colorTag: "amber",
              avatarIcon: "book",
            },
            {
              id: "char_subconscious",
              name: "Subconscious Whisperer",
              role: "inner_voice",
              description: "Intimate whisper delivering core affirmations at threshold volumes.",
              voiceName: "Zephyr",
              personaId: "binaural_whisperer",
              customDirective: "Speak in an extremely close-mic, intimate, ultra-soft ASMR breathy whisper, with gentle pauses and hypnotic softness",
              colorTag: "purple",
              avatarIcon: "sparkles",
            },
            {
              id: "char_guardian",
              name: "Ancient Guardian",
              role: "sage",
              description: "Resonant, timeless protector anchoring safety throughout the night.",
              voiceName: "Fenrir",
              personaId: "sacred_sage",
              customDirective: "Speak with reverent, spacious, meditative serenity and timeless wisdom, like an ancient spiritual master",
              colorTag: "cyan",
              avatarIcon: "shield",
            },
          ],
          chapters: [
            {
              chapterIndex: 1,
              title: "Twilight Descent & Physical Unburdening",
              stage: "induction_relaxation",
              targetBrainwave: "alpha_10hz",
              synopsis: "Arriving at the threshold of the sanctuary, releasing daytime muscle tension and slowing the breath.",
              sensoryAtmosphere: "Cool evening breeze, lavender scent, heavy limbs sinking into soft moss.",
              subliminalDirectives: ["Release all effort", "The body is completely safe to rest"],
            },
            {
              chapterIndex: 2,
              title: "The Whispering Waters of Theta",
              stage: "whisper_deepening",
              targetBrainwave: "theta_6hz",
              synopsis: "Boarding a gentle silver vessel gliding over still waters, voice volume softening toward whisper levels.",
              sensoryAtmosphere: "Gentle rocking motion, distant soft bells, rhythmic water laps.",
              subliminalDirectives: ["Thoughts dissolve like mist", "Drifting deeper with every breath"],
            },
            {
              chapterIndex: 3,
              title: "The Chamber of Subconscious Imprinting",
              stage: "subconscious_reprogramming",
              targetBrainwave: "delta_2hz",
              synopsis: "Deep hypnotic trance where subliminal affirmations are absorbed directly by the subconscious mind beneath colored noise.",
              sensoryAtmosphere: "Warm golden light pulsing at 2 Hz, total weightlessness.",
              subliminalDirectives: ["You are worthy, resilient, and deeply peaceful", "Every cell regenerates overnight"],
            },
            {
              chapterIndex: 4,
              title: "Eternal Delta Sanctuary (All-Night Regeneration)",
              stage: "all_night_delta_regeneration",
              targetBrainwave: "sub_delta_0_5hz",
              synopsis: "Endless boundless expanse of rejuvenating slow-wave delta sleep.",
              sensoryAtmosphere: "Cosmic cradle, steady protective brown noise, peaceful dream sanctuary.",
              subliminalDirectives: ["Rest peacefully all night through", "Awaken renewed, energized, and clear"],
            },
          ],
          subconsciousAffirmationsEmbedded: [
            "My body knows how to heal and rest completely.",
            "I release all control and surrender to peaceful sleep.",
            "I am safe, protected, and deeply calm.",
            "Every breath deepens my peace and restores my energy.",
            "Tomorrow I will wake up refreshed, sharp, and confident.",
          ],
          createdAt: Date.now(),
        };

        return res.json({
          success: true,
          data: fallbackBible,
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Story Bible Error]:", err);
      return res.status(500).json({ error: getFriendlyErrorMessage(err) });
    }
  });

  // AI Extended Sleep Story Generator from Story Bible
  app.post("/api/generate-story-from-bible", async (req, res) => {
    try {
      const { bible, paragraphCount = 16 } = req.body;

      if (!bible || !bible.title) {
        return res.status(400).json({ error: "A valid Story Bible is required." });
      }

      const prompt = `You are a master hypnotic storyteller and subliminal script author.
Write a full, continuous, deeply restorative sleep conditioning story based on this Story Bible:

Title: "${bible.title}"
Lore: "${bible.loreOverview}"
Visual Atmosphere: "${bible.visualAtmosphere}"
Cast: ${JSON.stringify(bible.cast.map((c: any) => ({ id: c.id, name: c.name, role: c.role, voiceName: c.voiceName })))}
Chapters Plan: ${JSON.stringify(bible.chapters.map((ch: any) => ({ index: ch.chapterIndex, title: ch.title, stage: ch.stage, synopsis: ch.synopsis })))}
Embedded Affirmations to Weave In: ${JSON.stringify(bible.subconsciousAffirmationsEmbedded)}

WRITING REQUIREMENTS:
1. Generate exactly ${paragraphCount} continuous, richly descriptive, soothing paragraphs.
2. Structure the paragraphs so they progressively slow down:
   - Early paragraphs (1 to ${Math.floor(paragraphCount * 0.35)}): Narrative scene setting, physical unburdening, slow diaphragmatic breathing.
   - Middle paragraphs (${Math.floor(paragraphCount * 0.35) + 1} to ${Math.floor(paragraphCount * 0.75)}): Intimate whisper tone, sensory sinking metaphors, rhythmic pacing.
   - Late paragraphs (${Math.floor(paragraphCount * 0.75) + 1} to ${paragraphCount}): Direct subconscious affirmations, timeless imagery, gentle repetitive mantras suitable for looping all night beneath brown noise.
3. Assign each paragraph to one of the characters from the cast (e.g. "char_narrator", "char_subconscious", etc.).
4. Keep the vocabulary deeply calming, rhythmic, and poetic.

Return JSON matching the schema.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          paragraphs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                text: { type: Type.STRING },
                characterId: { type: Type.STRING },
                speakerName: { type: Type.STRING },
                stage: { type: Type.STRING },
              },
              required: ["index", "text", "characterId", "speakerName"],
            },
          },
        },
        required: ["title", "paragraphs"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (aiErr: any) {
        console.warn("[Story Generator from Bible Fallback]:", aiErr?.message);
        // Build rich fallback paragraphs based on bible
        const cast0 = bible.cast[0] || { id: "char_narrator", name: "Narrator" };
        const cast1 = bible.cast[1] || cast0;
        const cast2 = bible.cast[2] || cast0;

        const paragraphs = [
          {
            index: 0,
            characterId: cast0.id,
            speakerName: cast0.name,
            text: `Welcome to the threshold of ${bible.title}. As the twilight settles, feel the weight of the day gently releasing from your shoulders, your forehead, and your breath.`,
            stage: "induction_relaxation",
          },
          {
            index: 1,
            characterId: cast0.id,
            speakerName: cast0.name,
            text: `A warm, soothing current of air moves through ${bible.visualAtmosphere || 'the quiet starlight sanctuary'}. With every breath you take, your physical body sinks a little deeper into the comfort beneath you.`,
            stage: "induction_relaxation",
          },
          {
            index: 2,
            characterId: cast1.id,
            speakerName: cast1.name,
            text: `Notice how effortless it is to let go. There are no tasks waiting for you now, no questions to answer. Just this steady, rhythmic pulse of calm stillness.`,
            stage: "whisper_deepening",
          },
          {
            index: 3,
            characterId: cast1.id,
            speakerName: cast1.name,
            text: `Whispering softly into the quiet space behind your thoughts: you are completely safe. Your mind is quiet, open, and ready to absorb deep restorative peace.`,
            stage: "whisper_deepening",
          },
          {
            index: 4,
            characterId: cast2.id,
            speakerName: cast2.name,
            text: `Deep in the sanctuary of your inner mind, every tension melts away. Your subconscious receives these truths: ${bible.subconsciousAffirmationsEmbedded?.[0] || 'My body knows how to heal and rest completely.'}`,
            stage: "subconscious_reprogramming",
          },
          {
            index: 5,
            characterId: cast1.id,
            speakerName: cast1.name,
            text: `${bible.subconsciousAffirmationsEmbedded?.[1] || 'I release all control and surrender to peaceful sleep.'} Feel these words settling into every nerve and fiber like warm golden dust.`,
            stage: "subconscious_reprogramming",
          },
          {
            index: 6,
            characterId: cast0.id,
            speakerName: cast0.name,
            text: `The boundaries of waking thought dissolve into boundless starlight. The steady rhythm of the night cradles you, holding you safely in slow-wave delta sleep.`,
            stage: "all_night_delta_regeneration",
          },
          {
            index: 7,
            characterId: cast1.id,
            speakerName: cast1.name,
            text: `Rest deeply now. Sleep soundly, knowing that with every passing hour of the night, you are restored, regenerated, and completely at peace.`,
            stage: "all_night_delta_regeneration",
          },
        ];

        return res.json({
          success: true,
          data: {
            title: bible.title,
            paragraphs,
          },
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Story Generator from Bible Error]:", err);
      return res.status(500).json({ error: getFriendlyErrorMessage(err) });
    }
  });

  // AI Visual Storyboard & Scene Generator for Full Sleep Videos
  app.post("/api/generate-story-visual-storyboard", async (req, res) => {
    try {
      const { paragraphs, title, visualAtmosphere } = req.body;

      if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length === 0) {
        return res.status(400).json({ error: "Paragraphs array is required." });
      }

      const atmosphericThematicImages = [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Starlight sky / Cosmic
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80", // Calm ocean twilight
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80", // Mystical cedar forest mist
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80", // Ethereal aurora / night glow
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80", // Serene mountain lake reflection
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80", // Midnight starry mountains
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1920&q=80", // Bioluminescent deep ocean glow
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80", // Tranquil dawn / gentle golden mist
      ];

      const prompt = `You are a master cinematic art director and concept artist for immersive audio-visual sleep stories.
Generate a visual storyboard for the story entitled "${title || 'Sleep Sanctuary'}" with overall visual atmosphere: "${visualAtmosphere || 'Serene, hypnotic, ethereal, soothing'}".

Here are the ${paragraphs.length} paragraphs/scenes of the story:
${paragraphs.map((p: any, i: number) => `Scene ${i}: (Speaker: ${p.speakerName || 'Narrator'}) "${p.text}"`).join("\n\n")}

For EACH scene (0 to ${paragraphs.length - 1}), generate:
1. scenePrompt: A detailed, highly evocative visual art prompt (e.g., "A tranquil bioluminescent cave with glowing cyan crystals and soft mist rolling over calm reflecting pools, 8k cinematic lighting, ultra-realistic digital concept art, peaceful twilight palette, slow floating dust motes").
2. sceneMood: Short mood descriptor (e.g. "Ethereal & Serene", "Deep Cosmic Stillness", "Warm Golden Hearth", "Restorative Mist").
3. sceneCameraMotion: One of: "zoom_in", "zoom_out", "pan_left", "pan_right", "floating_tilt".

Return a JSON object matching the schema.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                scenePrompt: { type: Type.STRING },
                sceneMood: { type: Type.STRING },
                sceneCameraMotion: {
                  type: Type.STRING,
                  description: "One of: zoom_in, zoom_out, pan_left, pan_right, floating_tilt",
                },
              },
              required: ["index", "scenePrompt", "sceneMood", "sceneCameraMotion"],
            },
          },
        },
        required: ["scenes"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);
        const cameraOptions: ("zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "floating_tilt")[] = [
          "zoom_in",
          "pan_right",
          "zoom_out",
          "pan_left",
          "floating_tilt",
        ];

        const enrichedScenes = paragraphs.map((p: any, idx: number) => {
          const matched = parsed?.scenes?.find((s: any) => s.index === idx) || parsed?.scenes?.[idx];
          const imgUrl = atmosphericThematicImages[idx % atmosphericThematicImages.length];

          return {
            index: idx,
            scenePrompt: matched?.scenePrompt || `Serene cinematic visualization of ${p.text.slice(0, 80)}..., peaceful dream atmosphere, 8k render.`,
            sceneMood: matched?.sceneMood || "Deep Restorative Tranquility",
            sceneCameraMotion: (matched?.sceneCameraMotion as any) || cameraOptions[idx % cameraOptions.length],
            sceneImageUrl: imgUrl,
          };
        });

        return res.json({
          success: true,
          data: {
            scenes: enrichedScenes,
          },
        });
      } catch (aiErr: any) {
        console.warn("[Storyboard Generator Falling Back]:", aiErr?.message);
        const cameraOptions: ("zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "floating_tilt")[] = [
          "zoom_in",
          "pan_right",
          "zoom_out",
          "pan_left",
          "floating_tilt",
        ];

        const fallbackScenes = paragraphs.map((p: any, idx: number) => ({
          index: idx,
          scenePrompt: `Hypnotic cinematic scene for sleep story: ${p.text.slice(0, 90)}..., ethereal starlight, relaxing soft focus, 8k wallpaper`,
          sceneMood: "Peaceful Slumber & Calm",
          sceneCameraMotion: cameraOptions[idx % cameraOptions.length],
          sceneImageUrl: atmosphericThematicImages[idx % atmosphericThematicImages.length],
        }));

        return res.json({
          success: true,
          data: {
            scenes: fallbackScenes,
          },
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Storyboard Generator Error]:", err);
      return res.status(500).json({ error: getFriendlyErrorMessage(err) });
    }
  });

  // AI Protocol Generator
  app.post("/api/generate-protocol", async (req, res) => {
    try {
      const { topic } = req.body;

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required to generate protocol." });
      }

      const prompt = `Generate a customized multi-phase conditioning protocol configuration for the following intent/focus: "${topic}".
      
Guidelines:
1. The protocol consists of a Lock phase, Subliminal Audio Layers, a Tracker, and a Wake Trigger.
2. Generate an appropriate name, guardian identity, time window, 4-6 specific subliminal layer focuses, and a wake-up prompt.
3. Content MUST remain focused on wellness, productivity, rest, athletic performance, or mental clarity. 
4. Strictly avoid any sexually explicit, harmful, or non-consensual themes.

Return JSON matching the schema.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the protocol (e.g. 'Deep Focus Night Shift')" },
          guardian: { type: Type.STRING, description: "Creative name for the AI Guardian" },
          timeWindowStart: { type: Type.STRING, description: "Start time in HH:MM format" },
          timeWindowEnd: { type: Type.STRING, description: "End time in HH:MM format" },
          layerNames: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 4 to 6 descriptive subliminal layer names",
          },
          wakePromptText: {
            type: Type.STRING,
            description: "A concise, firm, encouraging wake up message spoken to the user",
          },
        },
        required: ["name", "guardian", "timeWindowStart", "timeWindowEnd", "layerNames", "wakePromptText"],
      };

      try {
        const parsed = await generateContentWithFallback(prompt, schema);
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (aiErr: any) {
        console.warn("[Protocol Generator Falling Back to Local Template]:", aiErr?.message);
        const fallbackData = generateLocalProtocolFallback(topic);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
        });
      }
    } catch (err: any) {
      console.error("[Protocol Generator Error]:", err);
      return res.status(500).json({
        error: getFriendlyErrorMessage(err),
      });
    }
  });

  // Catch-all API 404 handler to ensure JSON is returned for all /api/* routes, never HTML
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Express JSON error handler to prevent HTML error pages
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Server Error Handler]:", err);
    res.status(500).json({ error: err?.message || "Internal server error occurred." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Subliminal AI Audio Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
