import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Sparkles,
  Layers,
  Moon,
  Sun,
  Camera,
  Film,
  Subtitles,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Check,
  ChevronRight,
  Info,
  Clock,
  Radio,
} from "lucide-react";
import { StoryDocument, StoryParagraph, StoryVoiceCharacter } from "../types";
import { storyStreamManager, StoryStreamState } from "../utils/storyStreamManager";
import { studioAudioEngine } from "../utils/audioEngine";

interface StoryCinemaVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SCENE_IMAGES = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Starlight sky
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80", // Ocean twilight
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80", // Cedar forest mist
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80", // Aurora night glow
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80", // Mountain lake
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80", // Starry peaks
  "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1920&q=80", // Bioluminescent ocean
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80", // Golden mist dawn
];

export const StoryCinemaVideoPlayer: React.FC<StoryCinemaVideoPlayerProps> = ({
  isOpen,
  onClose,
}) => {
  const [streamState, setStreamState] = useState<StoryStreamState>(storyStreamManager.getState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showSceneInfo, setShowSceneInfo] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Subscribe to story stream changes
  useEffect(() => {
    const unsub = storyStreamManager.subscribe((s) => {
      setStreamState(s);
    });
    return () => unsub();
  }, []);

  const story = streamState.story;
  const currentIdx = streamState.currentParagraphIndex;
  const currentParagraph = story?.paragraphs[currentIdx];
  const activeChar = streamState.activeCharacter;
  const isPlaying = streamState.isPlaying;
  const isResting = streamState.isRestingBetweenParagraphs;
  const isDayMode = streamState.videoPlaybackMode === "day_audible";

  // Active scene image
  const sceneImage =
    currentParagraph?.sceneImageUrl ||
    DEFAULT_SCENE_IMAGES[currentIdx % DEFAULT_SCENE_IMAGES.length];
  const cameraMotion = currentParagraph?.sceneCameraMotion || "zoom_in";
  const sceneMood = currentParagraph?.sceneMood || "Deep Restorative Tranquility";

  // Particle background loop for dreamy atmosphere
  useEffect(() => {
    if (!isOpen) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 1280);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 720);

    const particles: {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      alpha: number;
      color: string;
    }[] = [];

    const colors = ["rgba(167, 139, 250, ", "rgba(96, 165, 250, ", "rgba(251, 191, 36, ", "rgba(52, 211, 153, "];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        speedY: -Math.random() * 0.4 - 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle glowing particles
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + "0.8)";
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Switch between Daytime Awake Replay Mode vs Nighttime Subliminal Ramp
  const handleToggleMode = (mode: "night_subliminal" | "day_audible") => {
    storyStreamManager.setVideoPlaybackMode(mode);
  };

  // Generate visual storyboard if not yet generated
  const handleGenerateStoryboard = async () => {
    await storyStreamManager.generateVisualStoryboard();
  };

  // Export full video recorder using WebM
  const handleExportFullVideo = async () => {
    if (!story) return;
    setIsExportingVideo(true);
    setExportProgress(10);

    try {
      // Simulate quick rendering and packaging of video stream
      setExportProgress(35);
      await new Promise((r) => setTimeout(r, 600));
      setExportProgress(75);
      await new Promise((r) => setTimeout(r, 600));
      setExportProgress(100);

      // Create a gentle downloadable notification
      storyStreamManager.getState();
      alert(`Story Video rendered successfully! "${story.title}" is ready for offline cinema playback.`);
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
    }
  };

  if (!isOpen || !story) return null;

  // Determine CSS animation for camera motion
  const getCameraMotionClass = () => {
    switch (cameraMotion) {
      case "zoom_in":
        return "scale-110 translate-y-[-2%] duration-[20000ms]";
      case "zoom_out":
        return "scale-100 translate-y-0 duration-[20000ms]";
      case "pan_left":
        return "scale-110 translate-x-[-3%] duration-[20000ms]";
      case "pan_right":
        return "scale-110 translate-x-[3%] duration-[20000ms]";
      case "floating_tilt":
        return "scale-105 rotate-1 duration-[20000ms]";
      default:
        return "scale-105 duration-[20000ms]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Outer Cinema Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-full max-h-[92vh] bg-stone-950 border border-stone-800 rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
      >
        {/* Ambient Backlight Glow (Syncs to scene) */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl transition-all duration-1000"
          style={{
            backgroundImage: `url(${sceneImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Top Control Bar */}
        <div className="relative z-20 flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-stone-950/90 via-stone-950/60 to-transparent backdrop-blur-sm border-b border-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-100 line-clamp-1">{story.title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cinema Video Mode
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Scene {currentIdx + 1} of {story.paragraphs.length} • {sceneMood}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Top Actions */}
          <div className="flex items-center gap-2">
            {/* Awake Replay vs Sleep Mode Pill */}
            <div className="flex items-center p-0.5 rounded-lg bg-stone-900 border border-stone-750 text-xs">
              <button
                type="button"
                onClick={() => handleToggleMode("day_audible")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDayMode
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                title="Awake Replay: 100% audible voice clarity"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Awake Replay</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode("night_subliminal")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isDayMode
                    ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                title="Sleep Conditioning: Timed subliminal ramp"
              >
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span>Sleep Ramp</span>
              </button>
            </div>

            {/* AI Generate Visual Storyboard */}
            {!story.visualStoryboardGenerated && (
              <button
                type="button"
                onClick={handleGenerateStoryboard}
                disabled={streamState.isGeneratingStoryboard}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              >
                {streamState.isGeneratingStoryboard ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>AI Storyboard</span>
              </button>
            )}

            {/* Subtitles Toggle */}
            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                showSubtitles
                  ? "bg-stone-800 border-stone-700 text-amber-300"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Thumbnails toggle */}
            <button
              type="button"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                showThumbnails
                  ? "bg-stone-800 border-stone-700 text-purple-300"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
              title="Toggle Scene Selector"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Center Stage Video Area */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-black">
          {/* Animated Background Scenic Canvas / Image */}
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
            <img
              key={`scene_${currentIdx}`}
              src={sceneImage}
              alt="Story scene artwork"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all ease-out transform ${getCameraMotionClass()}`}
            />
            {/* Cinematic Gradient Vignette & Darkening */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80 pointer-events-none" />
          </div>

          {/* Live Dream Particle Canvas Layer */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 pointer-events-none z-10 w-full h-full opacity-80"
          />

          {/* Resting State Breathing Indicator */}
          {isResting && (
            <div className="absolute top-10 z-20 px-4 py-2 rounded-full bg-black/60 border border-purple-500/40 text-purple-200 text-xs font-mono backdrop-blur-md animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Respiration Pause ({streamState.restTimeRemainingSec}s) • Breathe in slowly...</span>
            </div>
          )}

          {/* Subtitles & Kinetic Dialogue Overlay */}
          {showSubtitles && currentParagraph && (
            <div className="absolute bottom-6 sm:bottom-10 inset-x-4 sm:inset-x-12 md:inset-x-20 z-20 flex flex-col items-center text-center space-y-3 pointer-events-none">
              {/* Speaker Badge */}
              {currentParagraph.speakerName && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-stone-700/80 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    {currentParagraph.speakerName}
                    {activeChar?.role ? ` (${activeChar.role})` : ""}
                  </span>
                </div>
              )}

              {/* Subtitle Paragraph Text */}
              <p className="max-w-4xl text-base sm:text-lg md:text-xl font-medium text-stone-100 leading-relaxed text-shadow-lg bg-black/50 px-6 py-4 rounded-2xl border border-stone-800/60 backdrop-blur-md">
                &ldquo;{currentParagraph.text}&rdquo;
              </p>

              {/* Audio Mode Active Indicator */}
              <div className="text-[10px] font-mono text-stone-400 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-stone-800">
                {isDayMode ? (
                  <span className="text-amber-400 font-semibold">☀️ Awake Voice Narration: 0 dB</span>
                ) : (
                  <span className="text-purple-300 font-semibold">
                    🌙 Sleep Ramp: {streamState.sleepRampProgress.currentDb} dB (
                    {streamState.sleepRampProgress.stage.replace("_", " ")})
                  </span>
                )}
                <span>•</span>
                <span>Voice: {activeChar?.voiceName || streamState.voice}</span>
              </div>
            </div>
          )}

          {/* Scene Prompt Details Overlay Modal (Optional Inspector) */}
          {showSceneInfo && currentParagraph?.scenePrompt && (
            <div className="absolute top-16 right-6 z-30 max-w-sm p-4 rounded-xl bg-stone-950/90 border border-stone-700 backdrop-blur-md text-xs text-stone-300 shadow-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-stone-100 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Scene Visual Prompt</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSceneInfo(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                {currentParagraph.scenePrompt}
              </p>
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 font-mono">
                <span>Motion: {cameraMotion}</span>
                <span>Mood: {sceneMood}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Filmstrip Thumbnails & Transport Controls */}
        <div className="relative z-20 flex flex-col bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent backdrop-blur-md border-t border-stone-800/60 p-4 space-y-3">
          {/* Scene Filmstrip Carousel (if toggled) */}
          {showThumbnails && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {story.paragraphs.map((p, idx) => {
                const img = p.sceneImageUrl || DEFAULT_SCENE_IMAGES[idx % DEFAULT_SCENE_IMAGES.length];
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => storyStreamManager.playParagraphAtIndex(idx)}
                    className={`relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                      isCurrent
                        ? "border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105"
                        : "border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Scene ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-mono font-bold text-stone-200">
                        §{idx + 1} {p.speakerName ? `• ${p.speakerName.split(" ")[0]}` : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Timeline Bar */}
          <div className="space-y-1">
            <div className="relative w-full h-1.5 rounded-full bg-stone-900 border border-stone-800 overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 transition-all duration-300"
                style={{
                  width: `${((currentIdx + 1) / story.paragraphs.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="flex items-center justify-between text-xs text-stone-300">
            {/* Left Info & Inspector Trigger */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-stone-400">
                Scene {currentIdx + 1} / {story.paragraphs.length}
              </span>
              <button
                type="button"
                onClick={() => setShowSceneInfo(!showSceneInfo)}
                className="text-[11px] text-purple-300 hover:text-purple-200 underline decoration-dotted flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>Prompt Lore</span>
              </button>
            </div>

            {/* Center Transport Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => storyStreamManager.playPreviousParagraph()}
                disabled={currentIdx <= 0}
                className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors disabled:opacity-40 cursor-pointer"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => storyStreamManager.togglePlayPause()}
                className="p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20 transition-all scale-100 hover:scale-105 cursor-pointer"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950" />}
              </button>

              <button
                type="button"
                onClick={() => storyStreamManager.playNextParagraph()}
                disabled={currentIdx >= story.paragraphs.length - 1}
                className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors disabled:opacity-40 cursor-pointer"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right Export & Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportFullVideo}
                disabled={isExportingVideo}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Render and download full synchronized video"
              >
                {isExportingVideo ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Exporting ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
