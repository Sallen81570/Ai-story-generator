/**
 * IndexedDB & Memory Cache for Paragraph Speech Audio
 * Stores audio Base64 strings and pre-calculated audio durations indexed by:
 * key = `${storyId}__${paragraphIndex}__${voiceName}`
 */

const DB_NAME = "SubliminalStoryAudioDB";
const STORE_NAME = "paragraph_audio_cache";
const DB_VERSION = 1;

interface CachedAudioRecord {
  key: string;
  storyId: string;
  paragraphIndex: number;
  voiceName: string;
  personaId?: string;
  characterId?: string;
  audioBase64: string;
  duration?: number;
  timestamp: number;
}

class StoryAudioCache {
  private memCache = new Map<string, { audioBase64: string; duration?: number }>();
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return Promise.resolve(null);
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
              store.createIndex("storyId", "storyId", { unique: false });
            }
          };
          req.onsuccess = (e) => {
            resolve((e.target as IDBOpenDBRequest).result);
          };
          req.onerror = () => {
            console.warn("IndexedDB unavailable, using in-memory audio cache.");
            resolve(null);
          };
        } catch (err) {
          console.warn("IndexedDB initialization error:", err);
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  private makeKey(storyId: string, paragraphIndex: number, voiceName: string, personaId: string = "calm_narrator", characterId?: string): string {
    return `${storyId}__${paragraphIndex}__${voiceName}__${personaId}__${characterId || "default"}`;
  }

  /**
   * Check if a paragraph audio is cached
   */
  async get(storyId: string, paragraphIndex: number, voiceName: string, personaId: string = "calm_narrator", characterId?: string): Promise<{ audioBase64: string; duration?: number } | null> {
    const key = this.makeKey(storyId, paragraphIndex, voiceName, personaId, characterId);

    // 1. Check in-memory fast cache first
    if (this.memCache.has(key)) {
      return this.memCache.get(key)!;
    }

    // 2. Check IndexedDB
    const db = await this.initDb();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const result = req.result as CachedAudioRecord | undefined;
          if (result && result.audioBase64) {
            this.memCache.set(key, { audioBase64: result.audioBase64, duration: result.duration });
            resolve({ audioBase64: result.audioBase64, duration: result.duration });
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  /**
   * Save synthesized paragraph audio to cache
   */
  async set(storyId: string, paragraphIndex: number, voiceName: string, personaId: string = "calm_narrator", audioBase64: string, characterId?: string, duration?: number): Promise<void> {
    const key = this.makeKey(storyId, paragraphIndex, voiceName, personaId, characterId);

    // Save to memory
    this.memCache.set(key, { audioBase64, duration });

    // Save to IndexedDB
    const db = await this.initDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const record: CachedAudioRecord = {
          key,
          storyId,
          paragraphIndex,
          voiceName,
          personaId,
          characterId,
          audioBase64,
          duration,
          timestamp: Date.now(),
        };

        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Check which paragraphs of a story are currently cached for a given voice, persona, and character configuration
   */
  async getCachedIndices(storyId: string, totalCount: number, voiceName: string, personaId: string = "calm_narrator", characterId?: string): Promise<Set<number>> {
    const cachedSet = new Set<number>();

    // Check memory first
    for (let i = 0; i < totalCount; i++) {
      const key = this.makeKey(storyId, i, voiceName, personaId, characterId);
      if (this.memCache.has(key)) {
        cachedSet.add(i);
      }
    }

    const db = await this.initDb();
    if (!db) return cachedSet;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("storyId");
        const req = index.getAll(IDBKeyRange.only(storyId));

        req.onsuccess = () => {
          const results = (req.result || []) as CachedAudioRecord[];
          for (const item of results) {
            const itemPersona = item.personaId || "calm_narrator";
            const itemChar = item.characterId || undefined;
            const matchChar = characterId ? itemChar === characterId : true;
            if (item.voiceName === voiceName && itemPersona === personaId && matchChar && item.audioBase64) {
              cachedSet.add(item.paragraphIndex);
              this.memCache.set(item.key, { audioBase64: item.audioBase64, duration: item.duration });
            }
          }
          resolve(cachedSet);
        };

        req.onerror = () => resolve(cachedSet);
      } catch (e) {
        resolve(cachedSet);
      }
    });
  }

  /**
   * Clear cache for a specific story
   */
  async clearStory(storyId: string): Promise<void> {
    // Clear from memory
    for (const key of Array.from(this.memCache.keys())) {
      if (key.startsWith(`${storyId}__`)) {
        this.memCache.delete(key);
      }
    }

    const db = await this.initDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("storyId");
        const req = index.getAllKeys(IDBKeyRange.only(storyId));

        req.onsuccess = () => {
          const keys = req.result || [];
          for (const k of keys) {
            store.delete(k);
          }
          resolve();
        };

        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
}

export const storyAudioCache = new StoryAudioCache();
