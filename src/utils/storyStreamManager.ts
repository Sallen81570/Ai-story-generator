import { StoryDocument, StoryParagraph, VoiceName, AudioMixerState, StoryVoiceCharacter, StoryBible, SleepConditioningRampConfig } from "../types";
import { WhisperPersonaId, WHISPER_PERSONAS, resolveWhisperPersona } from "../data/whisperPersonas";
import { storyAudioCache } from "./storyAudioCache";
import { studioAudioEngine } from "./audioEngine";
import { safeFetchJson } from "./api";

export interface StoryStreamState {
  story: StoryDocument | null;
  currentParagraphIndex: number;
  isPlaying: boolean;
  isRestingBetweenParagraphs: boolean;
  restTimeRemainingSec: number;
  voice: VoiceName;
  personaId: WhisperPersonaId;
  promptStyle: string;
  lookaheadCount: number; // e.g. 3
  isPreCachingAll: boolean;
  preCacheProgress: { current: number; total: number };
  statusMessage: string;
  isAnalyzingCast: boolean;
  isGeneratingBible: boolean;
  isGeneratingStoryFromBible: boolean;
  isGeneratingStoryboard: boolean;
  videoPlaybackMode: "night_subliminal" | "day_audible";
  activeCharacter: StoryVoiceCharacter | null;
  sleepRampProgress: {
    active: boolean;
    elapsedMinutes: number;
    totalMinutes: number;
    currentDb: number;
    percentComplete: number;
    stage: "audible_story" | "whisper_ramp" | "subconscious_subliminal" | "all_night_delta";
  };
}

type StreamStateListener = (state: StoryStreamState) => void;

class StoryStreamManager {
  private story: StoryDocument | null = null;
  private currentParagraphIndex: number = 0;
  private isPlaying: boolean = false;
  private isRestingBetweenParagraphs: boolean = false;
  private restTimeRemainingSec: number = 0;
  private restTimerInterval: number | null = null;

  private voice: VoiceName = "Aoede";
  private personaId: WhisperPersonaId = "calm_narrator";
  private promptStyle: string = "calm_narrator";
  private lookaheadCount: number = 3;
  private paragraphRestSec: number = 5;

  private isPreCachingAll: boolean = false;
  private isAnalyzingCast: boolean = false;
  private isGeneratingBible: boolean = false;
  private isGeneratingStoryFromBible: boolean = false;
  private isGeneratingStoryboard: boolean = false;
  private videoPlaybackMode: "night_subliminal" | "day_audible" = "day_audible";
  private preCacheProgress: { current: number; total: number } = { current: 0, total: 0 };
  private statusMessage: string = "Ready";

  private activeFetchPromises = new Map<number, Promise<string | null>>();
  private listeners: Set<StreamStateListener> = new Set();
  private mixerState: AudioMixerState | null = null;
  private sleepRampTimer: number | null = null;

  public subscribe(listener: StreamStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public getState(): StoryStreamState {
    const activeChar = this.getCharacterForParagraph(this.currentParagraphIndex);
    const rampProg = studioAudioEngine.getSleepRampProgress();

    return {
      story: this.story,
      currentParagraphIndex: this.currentParagraphIndex,
      isPlaying: this.isPlaying,
      isRestingBetweenParagraphs: this.isRestingBetweenParagraphs,
      restTimeRemainingSec: this.restTimeRemainingSec,
      voice: this.voice,
      personaId: this.personaId,
      promptStyle: this.promptStyle,
      lookaheadCount: this.lookaheadCount,
      isPreCachingAll: this.isPreCachingAll,
      preCacheProgress: { ...this.preCacheProgress },
      statusMessage: this.statusMessage,
      isAnalyzingCast: this.isAnalyzingCast,
      isGeneratingBible: this.isGeneratingBible,
      isGeneratingStoryFromBible: this.isGeneratingStoryFromBible,
      isGeneratingStoryboard: this.isGeneratingStoryboard,
      videoPlaybackMode: this.videoPlaybackMode,
      activeCharacter: activeChar,
      sleepRampProgress: rampProg,
    };
  }

  public setVideoPlaybackMode(mode: "night_subliminal" | "day_audible") {
    this.videoPlaybackMode = mode;
    if (this.story) {
      this.story.videoPlaybackMode = mode;
    }

    if (mode === "day_audible") {
      // In Day / Awake Story Replay Mode: disable ramp or override voice solo
      studioAudioEngine.setSleepRampConfig(null);
      if (this.mixerState) {
        studioAudioEngine.updateParameters({
          ...this.mixerState,
          voiceSoloTest: true,
        });
      }
      this.statusMessage = "Day / Awake Story Replay Mode: 100% audible voice clarity (0 dB)";
    } else {
      // In Night Subliminal mode: re-enable ramp if configured
      if (this.story?.sleepRampConfig) {
        studioAudioEngine.setSleepRampConfig(this.story.sleepRampConfig);
      }
      if (this.mixerState) {
        studioAudioEngine.updateParameters({
          ...this.mixerState,
          voiceSoloTest: false,
        });
      }
      this.statusMessage = "Night Sleep Conditioning Mode: Timed volume descent enabled";
    }
    this.notify();
  }

  public updateParagraphScene(index: number, sceneData: Partial<StoryParagraph>) {
    if (!this.story || !this.story.paragraphs[index]) return;
    this.story.paragraphs[index] = {
      ...this.story.paragraphs[index],
      ...sceneData,
    };
    this.notify();
  }

  public async generateVisualStoryboard(): Promise<boolean> {
    if (!this.story || this.story.paragraphs.length === 0) return false;

    this.isGeneratingStoryboard = true;
    this.statusMessage = `AI generating visual storyboard scenes & cinematic motion for "${this.story.title}"...`;
    this.notify();

    try {
      const res = await safeFetchJson<{
        data: {
          scenes: {
            index: number;
            scenePrompt: string;
            sceneMood: string;
            sceneCameraMotion: "pan_left" | "pan_right" | "zoom_in" | "zoom_out" | "floating_tilt";
            sceneImageUrl: string;
          }[];
        };
      }>("/api/generate-story-visual-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraphs: this.story.paragraphs.map((p) => ({
            index: p.index,
            text: p.text,
            speakerName: p.speakerName || "Narrator",
          })),
          title: this.story.title,
          visualAtmosphere: this.story.storyBible?.visualAtmosphere || "Cinematic, peaceful, atmospheric dream world",
        }),
      });

      if (res.ok && res.data?.data?.scenes) {
        const scenes = res.data.data.scenes;
        for (const s of scenes) {
          if (this.story.paragraphs[s.index]) {
            this.story.paragraphs[s.index].scenePrompt = s.scenePrompt;
            this.story.paragraphs[s.index].sceneMood = s.sceneMood;
            this.story.paragraphs[s.index].sceneCameraMotion = s.sceneCameraMotion;
            this.story.paragraphs[s.index].sceneImageUrl = s.sceneImageUrl;
          }
        }
        this.story.visualStoryboardGenerated = true;
        this.statusMessage = `Visual Storyboard generated (${scenes.length} cinematic scenes ready for video!)`;
        this.notify();
        return true;
      } else {
        throw new Error(res.error || "Failed to generate visual storyboard");
      }
    } catch (err: any) {
      console.warn("[StoryStreamManager] Storyboard gen error:", err);
      this.statusMessage = `Storyboard notice: ${err?.message || "Generation error"}`;
      this.notify();
      return false;
    } finally {
      this.isGeneratingStoryboard = false;
      this.notify();
    }
  }

  public setSleepRampConfig(config: SleepConditioningRampConfig) {
    if (!this.story) return;
    this.story.sleepRampConfig = config;
    studioAudioEngine.setSleepRampConfig(config);
    if (this.mixerState) {
      studioAudioEngine.updateParameters(this.mixerState);
    }
    this.statusMessage = config.enabled
      ? `Sleep Conditioning Ramp: ${config.rampDurationMinutes} min descent to subliminal (${config.targetSubliminalDb} dB)`
      : "Standard audible narration enabled";
    this.notify();
  }

  public async generateStoryBible(plotOrTheme: string, targetFocus?: string, rampMinutes = 30): Promise<StoryBible | null> {
    this.isGeneratingBible = true;
    this.statusMessage = "AI generating comprehensive Sleep Conditioning Story Bible & character lore...";
    this.notify();

    try {
      const res = await safeFetchJson<{ data: StoryBible }>("/api/generate-story-bible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotOrTheme,
          targetFocus,
          rampMinutes,
        }),
      });

      if (res.ok && res.data?.data) {
        const bible = res.data.data;
        this.statusMessage = `Generated Story Bible: "${bible.title}" (${bible.cast.length} voice actors, 4 sleep stages)`;
        this.notify();
        return bible;
      } else {
        throw new Error(res.error || "Failed to generate Story Bible");
      }
    } catch (err: any) {
      console.warn("[StoryStreamManager] Bible gen error:", err);
      this.statusMessage = `Story Bible notice: ${err?.message || "Failed to generate"}`;
      this.notify();
      return null;
    } finally {
      this.isGeneratingBible = false;
      this.notify();
    }
  }

  public async generateFullStoryFromBible(bible: StoryBible, paragraphCount = 16): Promise<StoryDocument | null> {
    this.isGeneratingStoryFromBible = true;
    this.statusMessage = `AI writing ${paragraphCount}-paragraph progressive sleep conditioning story...`;
    this.notify();

    try {
      const res = await safeFetchJson<{ data: { title: string; paragraphs: { index: number; text: string; characterId: string; speakerName: string; stage?: string }[] } }>("/api/generate-story-from-bible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bible,
          paragraphCount,
        }),
      });

      if (res.ok && res.data?.data) {
        const data = res.data.data;
        const totalWords = data.paragraphs.reduce((acc, p) => acc + p.text.trim().split(/\s+/).length, 0);

        const newStory: StoryDocument = {
          id: `story_${Date.now()}`,
          title: data.title || bible.title,
          author: "AI Sleep Story Studio",
          sourceType: "preset",
          totalWords,
          characters: bible.cast,
          isMultiCharacterEnabled: true,
          storyBible: bible,
          sleepRampConfig: {
            enabled: true,
            rampDurationMinutes: bible.soundscapeRecommendation?.recommendedRampMinutes || 30,
            initialVoiceVolumeDb: 0,
            targetSubliminalDb: -26,
            transitionBrainwave: true,
            allNightLoopMode: true,
          },
          createdAt: Date.now(),
          currentParagraphIndex: 0,
          paragraphs: data.paragraphs.map((p, idx) => ({
            id: `p_${Date.now()}_${idx}`,
            index: idx,
            text: p.text,
            wordCount: p.text.trim().split(/\s+/).length,
            status: "idle",
            characterId: p.characterId,
            speakerName: p.speakerName,
          })),
        };

        this.setStory(newStory);
        this.setSleepRampConfig(newStory.sleepRampConfig!);
        this.statusMessage = `Generated "${newStory.title}" with 4-stage sleep conditioning ramp!`;
        this.notify();
        return newStory;
      } else {
        throw new Error(res.error || "Failed to generate story from Bible");
      }
    } catch (err: any) {
      console.warn("[StoryStreamManager] Story generation from bible failed:", err);
      this.statusMessage = `Story generation error: ${err?.message || "Failed"}`;
      this.notify();
      return null;
    } finally {
      this.isGeneratingStoryFromBible = false;
      this.notify();
    }
  }

  public setMixerState(state: AudioMixerState) {
    this.mixerState = state;
    this.paragraphRestSec = state.intervalRestSec || 5;
  }

  public setVoice(voice: VoiceName) {
    this.voice = voice;
    this.syncCacheStatus();
    this.notify();
  }

  public setPersona(personaId: WhisperPersonaId, autoSwitchVoice = false) {
    this.personaId = personaId;
    const persona = resolveWhisperPersona(personaId);
    this.promptStyle = persona.id;
    if (autoSwitchVoice && persona.defaultVoice) {
      this.voice = persona.defaultVoice;
    }
    this.statusMessage = `Switched persona to "${persona.name}" (${persona.badge})`;
    this.syncCacheStatus();
    this.notify();
  }

  public setPromptStyle(style: string) {
    this.promptStyle = style;
    this.notify();
  }

  public setLookaheadCount(count: number) {
    this.lookaheadCount = Math.max(1, Math.min(5, count));
    this.triggerLookaheadCache();
    this.notify();
  }

  public setStory(story: StoryDocument, startingIndex = 0) {
    this.pause();
    this.story = story;
    this.currentParagraphIndex = Math.max(0, Math.min(startingIndex, story.paragraphs.length - 1));
    this.statusMessage = `Loaded "${story.title}" (${story.paragraphs.length} paragraphs)`;
    
    // Refresh cached status from IndexedDB
    this.syncCacheStatus();
    this.notify();
  }

  public getCharacterForParagraph(index: number): StoryVoiceCharacter | null {
    if (!this.story || !this.story.isMultiCharacterEnabled || !this.story.characters) {
      return null;
    }
    const p = this.story.paragraphs[index];
    if (!p || !p.characterId) {
      return this.story.characters[0] || null;
    }
    return this.story.characters.find((c) => c.id === p.characterId) || this.story.characters[0] || null;
  }

  public toggleMultiCharacterMode(enabled?: boolean) {
    if (!this.story) return;
    const newState = enabled !== undefined ? enabled : !this.story.isMultiCharacterEnabled;
    this.story.isMultiCharacterEnabled = newState;

    if (newState && (!this.story.characters || this.story.characters.length === 0)) {
      // Initialize default cast
      this.story.characters = [
        {
          id: "char_narrator",
          name: "Narrator",
          role: "narrator",
          description: "Steady, articulate storyteller delivering grounding atmosphere.",
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
          description: "Intimate inner subconscious voice whispering hypnotic ASMR cues.",
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
          description: "Wise spiritual teacher speaking with deep cosmic stillness.",
          voiceName: "Fenrir",
          personaId: "sacred_sage",
          customDirective: "Speak with reverent, spacious, meditative serenity and timeless wisdom, like an ancient spiritual master",
          colorTag: "cyan",
          avatarIcon: "brain",
        },
      ];
    }

    this.statusMessage = newState
      ? `Multi-Character Dynamic Cast enabled (${this.story.characters?.length || 0} characters)`
      : "Single Persona Narration enabled";
    this.syncCacheStatus();
    this.notify();
  }

  public assignCharacterToParagraph(index: number, characterId: string) {
    if (!this.story) return;
    const p = this.story.paragraphs[index];
    if (!p) return;

    const char = this.story.characters?.find((c) => c.id === characterId);
    p.characterId = characterId;
    p.speakerName = char?.name || "Speaker";
    p.voiceOverride = char?.voiceName;
    p.customDirectiveOverride = char?.customDirective;
    p.status = "idle";
    p.audioBase64 = undefined;

    this.statusMessage = `Assigned Paragraph ${index + 1} to "${char?.name || characterId}"`;
    this.syncCacheStatus();
    this.notify();
  }

  public addCharacter(char: StoryVoiceCharacter) {
    if (!this.story) return;
    if (!this.story.characters) this.story.characters = [];
    this.story.characters.push(char);
    this.statusMessage = `Added character "${char.name}" (${char.voiceName})`;
    this.notify();
  }

  public updateCharacter(updatedChar: StoryVoiceCharacter) {
    if (!this.story || !this.story.characters) return;
    const idx = this.story.characters.findIndex((c) => c.id === updatedChar.id);
    if (idx !== -1) {
      this.story.characters[idx] = updatedChar;
      // Invalidate paragraphs matching this character so they can re-synthesize with new directives
      this.story.paragraphs.forEach((p) => {
        if (p.characterId === updatedChar.id) {
          p.speakerName = updatedChar.name;
          p.voiceOverride = updatedChar.voiceName;
          p.customDirectiveOverride = updatedChar.customDirective;
          p.audioBase64 = undefined;
          p.status = "idle";
        }
      });
      this.statusMessage = `Updated character "${updatedChar.name}"`;
      this.syncCacheStatus();
      this.notify();
    }
  }

  public deleteCharacter(characterId: string) {
    if (!this.story || !this.story.characters) return;
    this.story.characters = this.story.characters.filter((c) => c.id !== characterId);
    const fallbackId = this.story.characters[0]?.id;
    this.story.paragraphs.forEach((p) => {
      if (p.characterId === characterId) {
        p.characterId = fallbackId;
        p.speakerName = this.story?.characters?.[0]?.name || "Narrator";
        p.audioBase64 = undefined;
        p.status = "idle";
      }
    });
    this.statusMessage = "Character removed";
    this.syncCacheStatus();
    this.notify();
  }

  /**
   * Automatically analyzes story via AI to cast voices and map characters
   */
  public async autoCastStoryCharacters(): Promise<boolean> {
    if (!this.story || this.story.paragraphs.length === 0) return false;

    this.isAnalyzingCast = true;
    this.statusMessage = `AI analyzing story tone and casting voice characters for "${this.story.title}"...`;
    this.notify();

    try {
      const paragraphTexts = this.story.paragraphs.map((p) => p.text);
      const res = await safeFetchJson<{
        title: string;
        summary: string;
        characters: StoryVoiceCharacter[];
        paragraphAssignments: Record<number, { characterId: string; speakerName: string }>;
      }>("/api/analyze-story-cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: this.story.title,
          paragraphs: paragraphTexts,
        }),
      });

      if (res.ok && res.data?.characters) {
        this.story.characters = res.data.characters;
        this.story.isMultiCharacterEnabled = true;

        const assignments = res.data.paragraphAssignments || {};
        this.story.paragraphs.forEach((p, idx) => {
          const assign = assignments[idx];
          if (assign) {
            p.characterId = assign.characterId;
            p.speakerName = assign.speakerName;
          } else if (this.story?.characters?.[0]) {
            p.characterId = this.story.characters[0].id;
            p.speakerName = this.story.characters[0].name;
          }
          p.audioBase64 = undefined;
          p.status = "idle";
        });

        this.statusMessage = `AI cast ${res.data.characters.length} characters: ${res.data.summary || "Ready for multi-voice playback!"}`;
        this.syncCacheStatus();
        this.notify();
        return true;
      } else {
        throw new Error(res.error || "Failed to analyze cast");
      }
    } catch (err: any) {
      console.warn("[StoryStream] Auto-cast failed:", err);
      this.statusMessage = `Auto-cast notice: ${err?.message || "Using smart preset cast"}`;
      this.toggleMultiCharacterMode(true);
      return false;
    } finally {
      this.isAnalyzingCast = false;
      this.notify();
    }
  }

  /**
   * Sync paragraph cached statuses from IndexedDB
   */
  public async syncCacheStatus() {
    if (!this.story) return;
    const storyId = this.story.id;

    for (let idx = 0; idx < this.story.paragraphs.length; idx++) {
      const p = this.story.paragraphs[idx];
      const char = this.getCharacterForParagraph(idx);
      const voice = char ? char.voiceName : this.voice;
      const persona = char?.personaId || this.personaId;
      const charId = this.story.isMultiCharacterEnabled && char ? char.id : undefined;

      const cached = await storyAudioCache.get(storyId, idx, voice, persona, charId);
      if (cached?.audioBase64) {
        p.audioBase64 = cached.audioBase64;
        p.status = "cached";
      } else if (p.status === "cached" && !p.audioBase64) {
        p.status = "idle";
      }
    }

    this.notify();
  }

  /**
   * Start or resume playing the story
   */
  public async play(mixerState: AudioMixerState) {
    if (!this.story || this.story.paragraphs.length === 0) return;

    this.mixerState = mixerState;
    this.paragraphRestSec = mixerState.intervalRestSec || 5;
    this.isPlaying = true;
    this.isRestingBetweenParagraphs = false;

    // Start background acoustic bed
    studioAudioEngine.startBackgroundBedOnly(mixerState);

    // Play active paragraph
    this.playCurrentParagraph();

    // Trigger lookahead pre-fetch for upcoming paragraphs
    this.triggerLookaheadCache();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.isRestingBetweenParagraphs = false;
    if (this.restTimerInterval !== null) {
      window.clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }
    studioAudioEngine.stopVoiceChunk();
    studioAudioEngine.pause();
    this.statusMessage = "Playback paused";
    this.notify();
  }

  public togglePlayPause(mixerState?: AudioMixerState) {
    if (this.isPlaying) {
      this.pause();
    } else {
      const state = mixerState || this.mixerState || {
        voiceVolume: 0.8,
        noiseVolume: 0.5,
        brainwaveVolume: 0.35,
        noiseType: "brown",
        brainwaveType: "theta",
        binauralBeatHz: 6.0,
        carrierFrequencyHz: 216,
        solfeggioFreq: 528,
        isVoiceFiltered: true,
        voiceLowPassHz: 2200,
        voiceAttenuationDb: -26,
        isSubliminalMode: true,
        voiceSoloTest: false,
        intervalRestSec: 5,
      };
      this.play(state as AudioMixerState);
    }
  }

  public jumpToParagraph(index: number) {
    if (!this.story) return;
    const targetIdx = Math.max(0, Math.min(index, this.story.paragraphs.length - 1));
    this.currentParagraphIndex = targetIdx;

    if (this.isPlaying) {
      if (this.restTimerInterval !== null) {
        window.clearInterval(this.restTimerInterval);
        this.restTimerInterval = null;
      }
      this.isRestingBetweenParagraphs = false;
      this.playCurrentParagraph();
      this.triggerLookaheadCache();
    }
    this.notify();
  }

  public playParagraphAtIndex(index: number) {
    this.jumpToParagraph(index);
  }

  public nextParagraph() {
    if (!this.story) return;
    if (this.currentParagraphIndex < this.story.paragraphs.length - 1) {
      this.jumpToParagraph(this.currentParagraphIndex + 1);
    }
  }

  public playNextParagraph() {
    this.nextParagraph();
  }

  public prevParagraph() {
    if (!this.story) return;
    if (this.currentParagraphIndex > 0) {
      this.jumpToParagraph(this.currentParagraphIndex - 1);
    }
  }

  public playPreviousParagraph() {
    this.prevParagraph();
  }

  /**
   * Plays the current paragraph audio chunk
   */
  private async playCurrentParagraph() {
    if (!this.story || !this.isPlaying) return;

    const idx = this.currentParagraphIndex;
    const paragraph = this.story.paragraphs[idx];
    if (!paragraph) return;

    const char = this.getCharacterForParagraph(idx);
    const activeVoice = char ? char.voiceName : this.voice;
    const activePersona = char?.personaId || this.personaId;
    const personaObj = resolveWhisperPersona(activePersona);
    const speakerLabel = char ? `${char.name} (${char.voiceName})` : `${personaObj.name} (${activeVoice})`;

    this.statusMessage = `Speaking: [${speakerLabel}] §${idx + 1} of ${this.story.paragraphs.length}`;
    paragraph.status = "playing";
    this.notify();

    // 1. Check if audio is already in memory or IndexedDB
    let audioBase64 = paragraph.audioBase64;
    const charId = this.story.isMultiCharacterEnabled && char ? char.id : undefined;

    if (!audioBase64) {
      const cached = await storyAudioCache.get(this.story.id, idx, activeVoice, activePersona, charId);
      if (cached?.audioBase64) {
        audioBase64 = cached.audioBase64;
        paragraph.audioBase64 = audioBase64;
        paragraph.status = "cached";
      }
    }

    // 2. If not yet cached, synthesize on-demand immediately
    if (!audioBase64) {
      this.statusMessage = `Synthesizing §${idx + 1} for ${speakerLabel}...`;
      paragraph.status = "caching";
      this.notify();

      audioBase64 = (await this.fetchParagraphAudio(idx)) || undefined;
      if (!audioBase64) {
        paragraph.status = "error";
        paragraph.errorMessage = "Synthesis failed. Retrying in 3s...";
        this.notify();
        if (this.isPlaying) {
          setTimeout(() => this.playCurrentParagraph(), 3000);
        }
        return;
      }
    }

    if (!this.isPlaying) return;

    // 3. Play through the audio engine DSP chain
    paragraph.status = "playing";
    this.notify();

    const chunkKey = `story_${this.story.id}_${idx}_${activePersona}_${charId || 'single'}`;
    const playSuccess = await studioAudioEngine.playVoiceChunk(
      chunkKey,
      audioBase64,
      () => {
        this.onParagraphEnded(idx);
      }
    );

    if (!playSuccess && this.isPlaying) {
      this.onParagraphEnded(idx);
    }

    // 4. Continue buffering next paragraphs
    this.triggerLookaheadCache();
  }

  /**
   * Called when a paragraph finishes playing
   */
  private onParagraphEnded(idx: number) {
    if (!this.isPlaying || !this.story) return;

    const paragraph = this.story.paragraphs[idx];
    if (paragraph) {
      paragraph.status = "cached";
    }

    // Check if end of story reached
    if (idx >= this.story.paragraphs.length - 1) {
      if (this.story.sleepRampConfig?.allNightLoopMode) {
        // In All-Night Sleep Mode: loop back to subconscious affirmations / late chapters
        const loopStartIndex = Math.max(0, Math.floor(this.story.paragraphs.length * 0.5));
        this.statusMessage = `All-Night Sleep Mode: Looping subconscious conditioning paragraphs (§${loopStartIndex + 1}-§${this.story.paragraphs.length}) beneath colored noise bed`;
        this.currentParagraphIndex = loopStartIndex;
        this.isRestingBetweenParagraphs = true;
        this.restTimeRemainingSec = this.paragraphRestSec * 2; // longer gentle rest between loops
        this.notify();

        if (this.restTimerInterval !== null) {
          window.clearInterval(this.restTimerInterval);
        }

        this.restTimerInterval = window.setInterval(() => {
          this.restTimeRemainingSec -= 1;
          if (this.restTimeRemainingSec <= 0) {
            if (this.restTimerInterval !== null) {
              window.clearInterval(this.restTimerInterval);
              this.restTimerInterval = null;
            }
            this.isRestingBetweenParagraphs = false;
            this.playCurrentParagraph();
          } else {
            this.notify();
          }
        }, 1000);
        return;
      } else {
        this.statusMessage = "Reached end of story. Resting in peaceful silence...";
        this.isPlaying = false;
        this.notify();
        return;
      }
    }

    // Enter respiration rest gap
    this.isRestingBetweenParagraphs = true;
    this.restTimeRemainingSec = this.paragraphRestSec;
    this.statusMessage = `Breathing gap (${this.restTimeRemainingSec}s) — Masking bed active`;
    this.notify();

    if (this.restTimerInterval !== null) {
      window.clearInterval(this.restTimerInterval);
    }

    this.restTimerInterval = window.setInterval(() => {
      this.restTimeRemainingSec -= 1;
      if (this.restTimeRemainingSec <= 0) {
        if (this.restTimerInterval !== null) {
          window.clearInterval(this.restTimerInterval);
          this.restTimerInterval = null;
        }
        this.isRestingBetweenParagraphs = false;
        this.currentParagraphIndex = idx + 1;
        this.playCurrentParagraph();
      } else {
        this.statusMessage = `Breathing gap (${this.restTimeRemainingSec}s) — Masking bed active`;
        this.notify();
      }
    }, 1000);
  }

  /**
   * Fetches and caches a single paragraph audio via Gemini TTS
   */
  public async fetchParagraphAudio(index: number): Promise<string | null> {
    if (!this.story) return null;
    const paragraph = this.story.paragraphs[index];
    if (!paragraph) return null;

    // Return in-flight promise if already requesting
    if (this.activeFetchPromises.has(index)) {
      return this.activeFetchPromises.get(index)!;
    }

    const fetchPromise = (async () => {
      try {
        const char = this.getCharacterForParagraph(index);
        const activeVoice = char ? char.voiceName : this.voice;
        const activePersona = char?.personaId || this.personaId;
        const customDirective = char?.customDirective || undefined;
        const charId = this.story?.isMultiCharacterEnabled && char ? char.id : undefined;

        const res = await safeFetchJson("/api/synthesize-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: paragraph.text,
            voiceName: activeVoice,
            personaId: activePersona,
            promptStyle: this.promptStyle,
            customDirective,
          }),
        });

        if (res.ok && res.data?.audioBase64) {
          const base64 = res.data.audioBase64;
          paragraph.audioBase64 = base64;
          paragraph.status = "cached";
          paragraph.errorMessage = undefined;

          // Save to IndexedDB with personaId & characterId
          await storyAudioCache.set(this.story!.id, index, activeVoice, activePersona, base64, charId);
          this.notify();
          return base64;
        } else {
          throw new Error(res.error || "TTS failed");
        }
      } catch (err: any) {
        console.warn(`[StoryStream] Error fetching paragraph ${index}:`, err);
        paragraph.errorMessage = err.message;
        if (paragraph.status !== "playing") {
          paragraph.status = "error";
        }
        this.notify();
        return null;
      } finally {
        this.activeFetchPromises.delete(index);
      }
    })();

    this.activeFetchPromises.set(index, fetchPromise);
    return fetchPromise;
  }

  /**
   * Lookahead Cache Worker:
   * Looks 2-3 paragraphs ahead of current position and caches any missing audio chunks sequentially
   */
  public async triggerLookaheadCache() {
    if (!this.story) return;

    const start = this.currentParagraphIndex;
    const end = Math.min(this.story.paragraphs.length - 1, start + this.lookaheadCount);

    for (let i = start + 1; i <= end; i++) {
      const p = this.story.paragraphs[i];
      if (!p) continue;

      const char = this.getCharacterForParagraph(i);
      const activeVoice = char ? char.voiceName : this.voice;
      const activePersona = char?.personaId || this.personaId;
      const charId = this.story.isMultiCharacterEnabled && char ? char.id : undefined;

      // Check if already cached in memory or IndexedDB
      if (p.status !== "cached" && !p.audioBase64) {
        const cached = await storyAudioCache.get(this.story.id, i, activeVoice, activePersona, charId);
        if (cached?.audioBase64) {
          p.audioBase64 = cached.audioBase64;
          p.status = "cached";
          this.notify();
        } else {
          // Trigger background fetch for this lookahead paragraph
          p.status = "caching";
          this.notify();
          await this.fetchParagraphAudio(i);
        }
      }
    }
  }

  /**
   * Pre-cache the entire story in the background
   */
  public async preCacheEntireStory() {
    if (!this.story || this.isPreCachingAll) return;

    this.isPreCachingAll = true;
    this.preCacheProgress = { current: 0, total: this.story.paragraphs.length };
    this.statusMessage = `Pre-caching entire story (${this.story.paragraphs.length} paragraphs)...`;
    this.notify();

    for (let i = 0; i < this.story.paragraphs.length; i++) {
      if (!this.isPreCachingAll) break; // cancelled
      this.preCacheProgress = { current: i + 1, total: this.story.paragraphs.length };

      const p = this.story.paragraphs[i];
      const char = this.getCharacterForParagraph(i);
      const activeVoice = char ? char.voiceName : this.voice;
      const activePersona = char?.personaId || this.personaId;
      const charId = this.story.isMultiCharacterEnabled && char ? char.id : undefined;

      const cached = await storyAudioCache.get(this.story.id, i, activeVoice, activePersona, charId);
      if (cached?.audioBase64) {
        p.audioBase64 = cached.audioBase64;
        p.status = "cached";
      } else {
        p.status = "caching";
        this.notify();
        await this.fetchParagraphAudio(i);
      }
      this.notify();
    }

    this.isPreCachingAll = false;
    this.statusMessage = "All paragraphs cached for instant offline listening & WAV export!";
    this.notify();
  }

  public cancelPreCacheAll() {
    this.isPreCachingAll = false;
    this.statusMessage = "Pre-caching stopped.";
    this.notify();
  }
}

export const storyStreamManager = new StoryStreamManager();

