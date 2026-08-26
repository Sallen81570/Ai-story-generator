import { StoryDocument, StoryParagraph, StorySourceType } from "../types";

/**
 * Clean and normalize text from various document formats
 */
export function sanitizeDocumentText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Replace unusual unicode quotes & hyphens
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, " - ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove repeated form feeds, page breaks
    .replace(/\f/g, "\n\n")
    // Normalize excessive spaces
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Splits text into natural paragraph chunks suitable for whisper/subliminal pacing (approx 25-60 words or 2-4 sentences).
 */
export function segmentTextIntoParagraphs(text: string): string[] {
  const clean = sanitizeDocumentText(text);
  if (!clean) return [];

  // Split by double newlines or standard paragraph boundaries
  const rawParagraphs = clean
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const result: string[] = [];

  for (const block of rawParagraphs) {
    // If a block is short to medium (<= 75 words), keep it intact
    const words = block.split(/\s+/);
    if (words.length <= 75) {
      // Remove intra-paragraph single newlines (e.g. from PDFs with hard line breaks)
      const sanitized = block.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
      if (sanitized) result.push(sanitized);
    } else {
      // If a block is very long, split it by sentence endings into chunks of ~35-65 words
      const sentences = block.match(/[^.!?]+[.!?]+["']?|\s*[^.!?]+$/g) || [block];
      let currentChunk: string[] = [];
      let currentWordCount = 0;

      for (const sentence of sentences) {
        const trimmed = sentence.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
        if (!trimmed) continue;

        const sWords = trimmed.split(/\s+/).length;
        if (currentWordCount + sWords > 60 && currentChunk.length > 0) {
          result.push(currentChunk.join(" "));
          currentChunk = [trimmed];
          currentWordCount = sWords;
        } else {
          currentChunk.push(trimmed);
          currentWordCount += sWords;
        }
      }

      if (currentChunk.length > 0) {
        result.push(currentChunk.join(" "));
      }
    }
  }

  return result.filter((p) => p.trim().length > 5);
}

const DEFAULT_THEMATIC_SCENES = [
  {
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    mood: "Starlight Sanctuary & Cosmic Peace",
    motion: "zoom_in" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    mood: "Tranquil Twilight Waters",
    motion: "pan_right" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
    mood: "Enchanted Cedar Mist Glade",
    motion: "zoom_out" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80",
    mood: "Ethereal Aurora Horizon",
    motion: "pan_left" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    mood: "Still Mountain Lake Reflection",
    motion: "floating_tilt" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
    mood: "Midnight Constellation Peak",
    motion: "zoom_in" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1920&q=80",
    mood: "Bioluminescent Deep Ocean Calm",
    motion: "pan_right" as const,
  },
  {
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80",
    mood: "Warm Golden Twilight Slumber",
    motion: "zoom_out" as const,
  },
];

/**
 * Creates a StoryDocument object from raw text
 */
export function createStoryFromText(
  title: string,
  rawText: string,
  sourceType: StorySourceType = "pasted",
  fileName?: string,
  author?: string
): StoryDocument {
  const rawParagraphs = segmentTextIntoParagraphs(rawText);
  const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let totalWords = 0;
  const paragraphs: StoryParagraph[] = rawParagraphs.map((text, index) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    totalWords += words;
    const scene = DEFAULT_THEMATIC_SCENES[index % DEFAULT_THEMATIC_SCENES.length];

    return {
      id: `${storyId}_p_${index}`,
      index,
      text,
      wordCount: words,
      status: "idle",
      sceneImageUrl: scene.url,
      sceneMood: scene.mood,
      sceneCameraMotion: scene.motion,
      scenePrompt: `Cinematic visualization of "${text.slice(0, 80)}...", peaceful sleep atmosphere, 8k digital art, soft lighting.`,
    };
  });

  return {
    id: storyId,
    title: title.trim() || "Untitled Sleep Story",
    author: author?.trim() || undefined,
    sourceType,
    fileName,
    totalWords,
    paragraphs,
    createdAt: Date.now(),
    currentParagraphIndex: 0,
    videoPlaybackMode: "day_audible",
  };
}

/**
 * Client-side PDF Text Extractor using pdfjs-dist or lightweight stream fallback
 */
export async function parsePdfFile(file: File): Promise<{ title: string; text: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist
    const pdfjs = await import("pdfjs-dist");

    // Configure worker if in browser
    if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || "4.10.38"}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;

    let fullText = "";
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items as Array<{ str?: string }>;
      const pageString = pageItems
        .map((item) => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ");

      fullText += pageString + "\n\n";
    }

    const cleanTitle = file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
    return {
      title: cleanTitle,
      text: fullText,
    };
  } catch (err) {
    console.warn("pdfjs-dist worker parse error, falling back to text stream extraction:", err);

    // Fallback: extract text strings directly from PDF binary buffer
    const textDecoder = new TextDecoder("utf-8");
    const arrayBuffer = await file.arrayBuffer();
    const raw = textDecoder.decode(arrayBuffer);

    // Extract text in parenthesis from PDF content stream (e.g. (Hello World) Tj)
    const matches = raw.match(/\(([^()]{2,})\)\s*Tj/g) || [];
    const extracted = matches
      .map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, ""))
      .join(" ")
      .replace(/\\([()\\])/g, "$1");

    if (extracted.trim().length > 50) {
      return {
        title: file.name.replace(/\.pdf$/i, ""),
        text: extracted,
      };
    }

    throw new Error(
      "Could not automatically extract readable text from this PDF. Please copy and paste the chapter text directly into the Story Paste Tab."
    );
  }
}

/**
 * Text & Markdown file parser
 */
export async function parseTextFile(file: File): Promise<{ title: string; text: string }> {
  const text = await file.text();
  const cleanTitle = file.name.replace(/\.(txt|md|text|rtf)$/i, "").replace(/[_-]+/g, " ");
  return {
    title: cleanTitle,
    text,
  };
}
