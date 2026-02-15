import { VinylPlayer } from "./components/VinylPlayer";
import { VinylPlayerMobile } from "./components/VinylPlayerMobile";
import { AlbumStack } from "./components/AlbumStack";
import { AudioSetupGuide } from "./components/AudioSetupGuide";
import { FileStatusChecker } from "./components/FileStatusChecker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

type AudioPreloadStatus = "idle" | "loading" | "ready" | "error";

export default function App() {
  const DESKTOP_ROW_WIDTH = 487.249 + 72 + 280;
  const DESKTOP_ROW_HEIGHT = 620;
  const DESKTOP_CANVAS_WIDTH = DESKTOP_ROW_WIDTH + 120;
  const DESKTOP_CANVAS_HEIGHT = DESKTOP_ROW_HEIGHT + 120;
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [desktopCompositionScale, setDesktopCompositionScale] = useState(1);
  const [mobileViewport, setMobileViewport] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [currentAlbumId, setCurrentAlbumId] = useState("fallen");
  const [audioError, setAudioError] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioErrorMessage, setAudioErrorMessage] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showFileChecker, setShowFileChecker] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [audioAssetLoadProgress, setAudioAssetLoadProgress] = useState(0);
  const audioAssetLoadProgressRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const audioPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const activePlayPromisesRef = useRef<Set<Promise<void>>>(new Set());
  const playbackRequestIdRef = useRef(0);
  const audioPreloadStatusRef = useRef<Map<string, AudioPreloadStatus>>(new Map());
  const audioPreloadPromiseRef = useRef<Map<string, Promise<void>>>(new Map());
  const preloadedAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const preloadedAudioErrorUrlsRef = useRef<Set<string>>(new Set());

  const speedSettings = [
    { rpm: 33, rate: 1.0, duration: 3 },
    { rpm: 45, rate: 1.36, duration: 2.2 },
    { rpm: 78, rate: 2.36, duration: 1.3 },
  ];

  // Music library - full local files only
  const getMusicLibrary = () => {
    const localSongPaths = {
      gravity: "/songs/gravity.mp3",
      vivid_dreams: "/songs/vivid-dreams.mp3",
      hereditary: "/songs/hereditary.mp3",
      being_so_normal: "/songs/being-so-normal.mp3",
      fallen: "/songs/fallen.mp3"
    };
    const originalUrls = {
      gravity: withBasePath(localSongPaths.gravity),
      vivid_dreams: withBasePath(localSongPaths.vivid_dreams),
      hereditary: withBasePath(localSongPaths.hereditary),
      being_so_normal: withBasePath(localSongPaths.being_so_normal),
      fallen: withBasePath(localSongPaths.fallen)
    };

    const baseLibrary = {
      gravity: {
        title: "Gravity",
        artist: "Brent Faiyaz",
        audioUrl: originalUrls.gravity,
        duration: 215,
      },
      vivid_dreams: {
        title: "VIVID DREAMS",
        artist: "KAYTRANADA",
        audioUrl: originalUrls.vivid_dreams,
        duration: 277,
      },
      hereditary: {
        title: "Hereditary",
        artist: "JID",
        audioUrl: originalUrls.hereditary,
        duration: 243,
      },
      being_so_normal: {
        title: "Being So Normal",
        artist: "Peach Pit",
        audioUrl: originalUrls.being_so_normal,
        duration: 220,
      },
      fallen: {
        title: "Fallen",
        artist: "Mya",
        audioUrl: originalUrls.fallen,
        duration: 215,
      },
    };

    return baseLibrary;
  };

  const musicLibrary = useMemo(() => getMusicLibrary(), []);
  const allAudioSources = useMemo(
    () => Object.values(musicLibrary).map((track) => track.audioUrl),
    [musicLibrary]
  );
  const totalAudioSourceCount = allAudioSources.length;

  const getOrCreateAudioContainer = useCallback(() => {
    let audioContainer = document.getElementById("audio-container");
    if (!audioContainer) {
      audioContainer = document.createElement("div");
      audioContainer.id = "audio-container";
      audioContainer.style.display = "none";
      audioContainer.style.position = "absolute";
      audioContainer.style.top = "-9999px";
      document.body.appendChild(audioContainer);
    }
    return audioContainer;
  }, []);

  const updateAudioAssetProgress = useCallback(() => {
    if (totalAudioSourceCount <= 0) {
      setAudioAssetLoadProgress(100);
      return;
    }
    let completeCount = 0;
    audioPreloadStatusRef.current.forEach((status) => {
      if (status === "ready" || status === "error") {
        completeCount += 1;
      }
    });
    setAudioAssetLoadProgress(
      Math.round((completeCount / totalAudioSourceCount) * 100)
    );
  }, [totalAudioSourceCount]);

  const preloadAudioSource = useCallback(
    (audioUrl: string) => {
      const status = audioPreloadStatusRef.current.get(audioUrl);
      if (status === "ready") return Promise.resolve();
      if (status === "error") return Promise.reject(new Error("Audio preload failed."));

      const existingPromise = audioPreloadPromiseRef.current.get(audioUrl);
      if (existingPromise) {
        return existingPromise;
      }

      const preloadPromise = new Promise<void>((resolve, reject) => {
        audioPreloadStatusRef.current.set(audioUrl, "loading");
        updateAudioAssetProgress();

        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.preload = "auto";
        audio.src = audioUrl;
        getOrCreateAudioContainer().appendChild(audio);
        preloadedAudioElementsRef.current.set(audioUrl, audio);

        let settled = false;

        const cleanup = () => {
          audio.removeEventListener("canplay", onReady);
          audio.removeEventListener("loadeddata", onReady);
          audio.removeEventListener("error", onError);
          audioPreloadPromiseRef.current.delete(audioUrl);
        };

        const onReady = () => {
          if (settled) return;
          settled = true;
          audioPreloadStatusRef.current.set(audioUrl, "ready");
          preloadedAudioErrorUrlsRef.current.delete(audioUrl);
          updateAudioAssetProgress();
          cleanup();
          resolve();
        };

        const onError = () => {
          if (settled) return;
          settled = true;
          audioPreloadStatusRef.current.set(audioUrl, "error");
          preloadedAudioErrorUrlsRef.current.add(audioUrl);
          updateAudioAssetProgress();
          cleanup();
          reject(new Error("Audio preload failed."));
        };

        audio.addEventListener("canplay", onReady, { once: true });
        audio.addEventListener("loadeddata", onReady, { once: true });
        audio.addEventListener("error", onError, { once: true });
        audio.load();
      });

      audioPreloadPromiseRef.current.set(audioUrl, preloadPromise);
      return preloadPromise;
    },
    [getOrCreateAudioContainer, updateAudioAssetProgress]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    allAudioSources.forEach((audioUrl) => {
      audioPreloadStatusRef.current.set(audioUrl, "idle");
    });
    updateAudioAssetProgress();
    allAudioSources.forEach((audioUrl) => {
      void preloadAudioSource(audioUrl).catch(() => {
        // Playback flow handles actual user-facing audio errors per track.
      });
    });
  }, [allAudioSources, preloadAudioSource, updateAudioAssetProgress]);

  useEffect(() => {
    audioAssetLoadProgressRef.current = audioAssetLoadProgress;
  }, [audioAssetLoadProgress]);

  const currentTrack =
    musicLibrary[currentAlbumId as keyof typeof musicLibrary];
  const playbackStatusLabel = isPlaying ? "Playing" : "Not Playing";
  const playbackStatusIcon = isPlaying ? "▶️" : "⏸️";
  const combinedAudioLoadProgress = Math.max(
    loadingProgress,
    audioAssetLoadProgress
  );
  const showAudioLoadPercent =
    !audioError &&
    (isLoadingAudio || (isPlaying && combinedAudioLoadProgress < 100));
  const desktopStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isCoarsePointer = window.matchMedia(
        "(hover: none) and (pointer: coarse)"
      ).matches;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const shouldUseMobileLayout =
        width < 640 || (isCoarsePointer && (width <= 920 || height <= 520));

      setIsMobile(shouldUseMobileLayout);
      setIsMobileLandscape(shouldUseMobileLayout && isLandscape);
      setMobileViewport({ width, height });
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    window.addEventListener("orientationchange", checkIsMobile);

    return () =>
      {
        window.removeEventListener("resize", checkIsMobile);
        window.removeEventListener("orientationchange", checkIsMobile);
      };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setDesktopCompositionScale(1);
      return;
    }

    const stage = desktopStageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const availableWidth = Math.max(0, stage.clientWidth - 10);
      const availableHeight = Math.max(0, stage.clientHeight - 8);
      const widthScale = availableWidth / DESKTOP_CANVAS_WIDTH;
      const heightScale = availableHeight / DESKTOP_CANVAS_HEIGHT;
      const nextScale = Math.min(1, widthScale, heightScale);
      setDesktopCompositionScale(Math.max(0.3, nextScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    window.addEventListener("resize", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, [DESKTOP_CANVAS_HEIGHT, DESKTOP_CANVAS_WIDTH, isMobile]);

  const mobilePlayerScale = isMobileLandscape
    ? Math.min(1, Math.max(0.56, (mobileViewport.height - 120) / 444))
    : 1;
  const mobileStackScale = isMobileLandscape
    ? Math.min(1, Math.max(0.72, (mobileViewport.height - 120) / 240))
    : 1;

  // Initialize Audio Context on first play
  const initializeAudio = () => {
    if (!audioInitialized) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();

          // Create gain node for volume control
          gainNodeRef.current =
            audioContextRef.current.createGain();
          gainNodeRef.current.connect(
            audioContextRef.current.destination,
          );
          gainNodeRef.current.gain.value = 1.0; // Unity gain (system/browser volume level)
        }
        setAudioError(false);
        setAudioInitialized(true);
      } catch (error: any) {
        void error;
        setAudioError(true);
      }
    }
  };

  // BULLETPROOF audio management - never touches audio elements with active promises
  const stopAllAudioSafely = async () => {
    // Hard-stop every created audio element to prevent track overlap.
    const audioContainer = document.getElementById("audio-container");
    if (audioContainer) {
      const nodes = audioContainer.querySelectorAll("audio");
      nodes.forEach((node) => {
        try {
          node.volume = 0;
          node.muted = true;
          node.pause();
          node.currentTime = 0;
        } catch {
          // Ignore element stop errors.
        }
      });
    }

    // Clear references without touching the audio elements
    audioElementRef.current = null;
    audioSourceRef.current = null;
    currentTrackRef.current = null;
    playPromiseRef.current = null;

    // Abort any pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Create completely separate audio element for each track/speed combination
  const createIsolatedAudioElement = (trackKey: string, sources: string[]) => {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      // Create fresh audio element that will never be reused
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.volume = 0; // Start silent
      audio.loop = false;
      audio.preload = "metadata";

      // Attach to DOM for stability
      getOrCreateAudioContainer().appendChild(audio);

      let resolved = false;
      let sourceIndex = 0;

      const tryNextSource = () => {
        if (resolved || sourceIndex >= sources.length) {
          if (!resolved) {
            reject(new Error("All sources failed"));
          }
          return;
        }

        const attempt = sourceIndex + 1;
        const sourceUrl = sources[sourceIndex++];
        void attempt;
        void trackKey;
        
        // Set source directly - never manipulate existing sources
        audio.src = sourceUrl;

        const onSuccess = () => {
          if (resolved) return;
          try {
            audio.currentTime = 0;
          } catch {
            // Ignore seek errors before metadata is fully ready.
          }
          resolved = true;
          cleanup();
          resolve(audio);
        };

        const onError = () => {
          if (resolved) return;
          cleanup();
          setTimeout(tryNextSource, 100);
        };

        const cleanup = () => {
          audio.removeEventListener('loadedmetadata', onSuccess);
          audio.removeEventListener('canplay', onSuccess);
          audio.removeEventListener('error', onError);
        };

        audio.addEventListener('loadedmetadata', onSuccess, { once: true });
        audio.addEventListener('canplay', onSuccess, { once: true });
        audio.addEventListener('error', onError, { once: true });
        audio.load();
      };

      tryNextSource();
    });
  };

  // Promise-safe audio playback that never interrupts existing promises
  const playAudioSafely = async (audio: HTMLAudioElement, trackKey: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Set up the audio element for playback
        const currentSpeed = speedSettings[speedIndex];
        try {
          audio.currentTime = 0;
        } catch {
          // Ignore seek errors on first frame; play() will still start at beginning.
        }
        audio.playbackRate = currentSpeed.rate;
        audio.volume = 1.0;

        // Add ended listener for automatic tonearm lifting
        const onSongEnded = () => {
          setIsPlaying(false);
        };
        
        // Remove any existing listeners first
        audio.removeEventListener('ended', onSongEnded);
        audio.addEventListener('ended', onSongEnded, { once: true });

        // Create and track the play promise
        const playPromise = audio.play();
        activePlayPromisesRef.current.add(playPromise);
        playPromiseRef.current = playPromise;

        playPromise.then(() => {
          // Clean up promise tracking
          activePlayPromisesRef.current.delete(playPromise);
          if (playPromiseRef.current === playPromise) {
            playPromiseRef.current = null;
          }
          
          setAudioError(false);
          setAudioErrorMessage("");
          resolve();
        }).catch((error) => {
          // Clean up promise tracking
          activePlayPromisesRef.current.delete(playPromise);
          if (playPromiseRef.current === playPromise) {
            playPromiseRef.current = null;
          }
          
          // This should NEVER happen with our isolated approach
          reject(error);
        });

      } catch (error: any) {
        void trackKey;
        void error;
        reject(error);
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all audio with volume fade only
      if (audioElementRef.current) {
        try {
          audioElementRef.current.volume = 0;
        } catch (error: any) {
          // Ignore errors
        }
      }

      // Clean up audio pool without touching active elements
      setTimeout(() => {
        const audioContainer = document.getElementById('audio-container');
        if (audioContainer && audioContainer.parentNode) {
          audioContainer.parentNode.removeChild(audioContainer);
        }
      }, 2000); // Long delay to ensure all promises are resolved

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Handle real audio file playback only
  useEffect(() => {
    const currentSpeed = speedSettings[speedIndex];
    const requestId = ++playbackRequestIdRef.current;
    const isStaleRequest = () => requestId !== playbackRequestIdRef.current;

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Async function to handle the entire audio setup
    const handleAudioChange = async () => {
      try {
        if (isStaleRequest()) return;

        // Initialize audio on first play attempt
        if (isPlaying && !audioInitialized) {
          initializeAudio();
        }

        // EXPLICIT STOP: If tonearm is NOT on vinyl, ensure no audio plays
        if (!isPlaying) {
          await stopAllAudioSafely();
          if (isStaleRequest()) return;
          setLoadingProgress(0);
          return;
        }

        // Exit early if audio system is not ready
        if (
          !audioContextRef.current ||
          !gainNodeRef.current ||
          !audioInitialized
        ) {
          return;
        }

        // START: Only start audio if tonearm is on vinyl AND we have a track
        if (isPlaying && currentTrack) {
          try {
            // Resume audio context if suspended
            if (audioContextRef.current.state === "suspended") {
              audioContextRef.current.resume();
            }

            const trackKey = `${currentAlbumId}-${currentSpeed.rpm}`;

            // Check if we're already playing this exact track/speed combo
            if (currentTrackRef.current === trackKey && audioElementRef.current) {
              try {
                audioElementRef.current.muted = false;
                audioElementRef.current.volume = 1.0;
              } catch (error: any) {
                // Ignore volume errors
              }
              return;
            }

            setIsLoadingAudio(true);
            setLoadingProgress(Math.max(10, audioAssetLoadProgressRef.current));

            // Stop any current audio safely
            await stopAllAudioSafely();
            if (isStaleRequest()) return;

            try {
              const allSources = [currentTrack.audioUrl];

              setLoadingProgress(Math.max(24, audioAssetLoadProgressRef.current));

              await preloadAudioSource(currentTrack.audioUrl);
              if (isStaleRequest()) return;

              setLoadingProgress(Math.max(48, audioAssetLoadProgressRef.current));

              // Create completely isolated audio element
              const audio = await createIsolatedAudioElement(trackKey, allSources);
              if (isStaleRequest()) {
                try {
                  audio.pause();
                  audio.currentTime = 0;
                } catch {
                  // Ignore stale audio cleanup failures.
                }
                return;
              }

              setLoadingProgress(Math.max(64, audioAssetLoadProgressRef.current));

              // Set up Web Audio API connection
              if (audioContextRef.current && gainNodeRef.current) {
                try {
                  if (audioSourceRef.current) {
                    audioSourceRef.current.disconnect();
                  }
                  audioSourceRef.current = audioContextRef.current.createMediaElementSource(audio);
                  audioSourceRef.current.connect(gainNodeRef.current);
                } catch (webAudioError) {
                  void webAudioError;
                }
              }

              setLoadingProgress(Math.max(82, audioAssetLoadProgressRef.current));

              // Store references
              audio.muted = false;
              audioElementRef.current = audio;
              currentTrackRef.current = trackKey;

              // Start playback with promise-safe method
              await playAudioSafely(audio, trackKey);
              if (isStaleRequest()) return;

              setLoadingProgress(100);
              
            } catch (error: any) {
              // Check if it was aborted
              if (error?.name === 'AbortError') {
                if (!isStaleRequest()) {
                  setLoadingProgress(0);
                }
                return;
              }

              if (!isStaleRequest()) {
                const missingAudio = preloadedAudioErrorUrlsRef.current.has(
                  currentTrack.audioUrl
                );
                setLoadingProgress(0);
                setAudioErrorMessage(
                  missingAudio
                    ? "A song file is missing. Add files to /public/songs/ (gravity, vivid-dreams, hereditary, being-so-normal, fallen)."
                    : "Audio is still loading. Please try again."
                );
                setAudioError(true);
                setIsPlaying(false);
              }
            } finally {
              if (!isStaleRequest()) {
                setIsLoadingAudio(false);
              }
            }
          } catch (error: any) {
            if (error?.name === 'AbortError') {
              return;
            }
            void error;
            if (!isStaleRequest()) {
              setAudioError(true);
              setIsPlaying(false);
              setIsLoadingAudio(false);
            }
          }
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        void error;
        if (!isStaleRequest()) {
          setIsLoadingAudio(false);
        }
      }
    };

    // Execute the async handler
    handleAudioChange();
  }, [
    isPlaying,
    currentTrack,
    speedIndex,
    speedSettings,
    audioError,
    audioInitialized,
  ]);

  const markerRows = [18, 50, 82];

  return (
    <div className="size-full overflow-hidden relative">
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
          background:
            "radial-gradient(1400px 780px at 50% -10%, rgba(255,255,255,0.09), transparent 58%), linear-gradient(180deg, #0c0c0d 0%, #060606 100%)"
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-4%",
            right: "-4%",
            bottom: "-18%",
            height: "40%",
            borderRadius: "48% 52% 60% 40% / 52% 60% 40% 48%",
            background:
              "radial-gradient(85% 100% at 55% 28%, rgba(255,255,255,0.08), rgba(22,22,22,0.95) 52%, rgba(6,6,6,0.98) 100%)",
            opacity: 0.9
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            background:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(92%, 1180px)",
            height: "min(72%, 560px)",
            minHeight: "420px",
            background:
              "linear-gradient(180deg, #f6a21a 0%, #ef9208 46%, #df7f00 100%)",
            boxShadow:
              "0 28px 56px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255,255,255,0.22)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.22,
              background:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 4px)"
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "5.3%",
              top: 0,
              bottom: 0,
              borderLeft: "1px dashed rgba(0,0,0,0.46)"
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "5.3%",
              top: 0,
              bottom: 0,
              borderLeft: "1px dashed rgba(0,0,0,0.46)"
            }}
          />
          {markerRows.map((topPct) => (
            <div
              key={`left-${topPct}`}
              style={{
                position: "absolute",
                left: "1.8%",
                top: `${topPct}%`,
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#0b0b0b",
                transform: "translateY(-50%)"
              }}
            />
          ))}
          {markerRows.map((topPct) => (
            <div
              key={`right-${topPct}`}
              style={{
                position: "absolute",
                right: "1.8%",
                top: `${topPct}%`,
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#0b0b0b",
                transform: "translateY(-50%)"
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="size-full overflow-hidden flex items-center justify-center p-4 relative"
        style={{
          zIndex: 20,
          padding: isMobile ? "16px" : "clamp(8px, 1.4vh, 16px)"
        }}
      >
      {showAudioLoadPercent ? (
        <div
          className="absolute inset-x-0 z-50 flex justify-center px-3"
          style={{
            top: isMobile ? (isMobileLandscape ? "44px" : "48px") : "54px",
            pointerEvents: "none"
          }}
          aria-live="polite"
          aria-label={`Audio loading ${combinedAudioLoadProgress}%`}
          role="status"
        >
          <div
            style={{
              minWidth: "56px",
              borderRadius: "12px",
              padding: "6px 10px",
              background: "rgba(12, 16, 22, 0.62)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.92)",
              textAlign: "center",
              fontFamily: "var(--font-body), Helvetica Neue, Arial, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {combinedAudioLoadProgress}%
          </div>
        </div>
      ) : null}

      {currentTrack && (
        <div
          className="absolute inset-x-0 z-50 flex justify-center px-3"
          style={{
            top: isMobile ? (isMobileLandscape ? "8px" : "10px") : "10px",
            zIndex: 95,
            pointerEvents: "none"
          }}
        >
          <div
            className="text-white text-center"
            style={{
              width: "max-content",
              borderRadius: "18px",
              padding: "9px 12px",
              background:
                "linear-gradient(130deg, rgba(30, 54, 92, 0.96) 0%, rgba(24, 44, 76, 0.96) 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              display: "grid",
              justifyItems: "center",
              gap: "4px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textAlign: "center",
                lineHeight: 1.2,
                whiteSpace: "nowrap"
              }}
              className="text-sm font-medium"
            >
              <span aria-hidden="true">{playbackStatusIcon}</span>
              <span style={{ whiteSpace: "nowrap" }}>{playbackStatusLabel}</span>
            </div>
            <div
              className="text-xs text-gray-300 text-center"
              style={{
                lineHeight: 1.28,
                whiteSpace: "nowrap",
                textAlign: "center"
              }}
            >
              {currentTrack.title} - {currentTrack.artist}
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <>
          {/* Error toast - still absolute positioned */}
          {audioError && (
            <div className="absolute bg-amber-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-40 max-w-sm top-8 left-1/2 transform -translate-x-1/2">
              <div className="text-sm font-medium">
                ⚠️ {audioErrorMessage || "Audio Error"}
              </div>
              <div className="text-xs text-amber-200">
                Audio system error - add full MP3 files to continue
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFileChecker(true)}
                  className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Check Files
                </button>
                <button
                  onClick={() => setShowSetupGuide(true)}
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Setup Guide
                </button>
                <button
                  onClick={() => setShowFileChecker(true)}
                  className="text-xs bg-purple-500 hover:bg-purple-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Recheck
                </button>
              </div>
            </div>
          )}

          {/* Mobile layout - evenly spaced vertical layout with toast, vinyl player, and album stack */}
          <div
            className="flex flex-col items-center justify-between min-h-full w-full"
            style={{
              padding: isMobileLandscape ? "8px 0 10px" : "20px 0 24px",
              gap: isMobileLandscape ? "8px" : "20px",
            }}
          >
            <div
              className="flex-shrink-0 w-full"
              style={{ minHeight: isMobileLandscape ? "68px" : "80px" }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: isMobileLandscape ? "row" : "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                flex: 1,
                minHeight: 0,
                gap: isMobileLandscape ? "16px" : "24px"
              }}
            >
              {/* Vinyl Player - center element */}
              <div
                className="flex-shrink-0"
                style={{
                  transform: `scale(${mobilePlayerScale})`,
                  transformOrigin: "center"
                }}
              >
                <VinylPlayerMobile
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  speedIndex={speedIndex}
                  setSpeedIndex={setSpeedIndex}
                  speedSettings={speedSettings}
                  currentAlbumId={currentAlbumId}
                />
              </div>

              {/* Album Stack - bottom element */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  transform: `scale(${mobileStackScale})`,
                  transformOrigin: "center"
                }}
              >
                <AlbumStack
                  currentAlbumId={currentAlbumId}
                  onAlbumChange={setCurrentAlbumId}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {audioError && (
            <div className="absolute bg-amber-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-40 max-w-sm top-1/2 left-4 transform -translate-y-1/2">
              <div className="text-sm font-medium">
                ⚠️ {audioErrorMessage || "Audio Error"}
              </div>
              <div className="text-xs text-amber-200">
                Audio system error - add full MP3 files to continue
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFileChecker(true)}
                  className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Check Files
                </button>
                <button
                  onClick={() => setShowSetupGuide(true)}
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Setup Guide
                </button>
                <button
                  onClick={() => setShowFileChecker(true)}
                  className="text-xs bg-purple-500 hover:bg-purple-400 text-white px-2 py-1 rounded transition-colors"
                >
                  Recheck
                </button>
              </div>
            </div>
          )}
          
          <div
            className="w-full h-full flex flex-col items-center justify-start"
            style={{
              gap: "10px",
              paddingTop: "clamp(70px, 9.5vh, 100px)",
              paddingBottom: "6px"
            }}
          >
            {/* Desktop layout - horizontal with center alignment and flexible height */}
            <div
              ref={desktopStageRef}
              className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden px-1"
              style={{ marginTop: "2px" }}
            >
              <div
                style={{
                  position: "relative",
                  width: `${DESKTOP_CANVAS_WIDTH}px`,
                  height: `${DESKTOP_CANVAS_HEIGHT}px`,
                  transform: `scale(${desktopCompositionScale})`,
                  transformOrigin: "center center"
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center gap-[72px]">
                    <VinylPlayer
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      speedIndex={speedIndex}
                      setSpeedIndex={setSpeedIndex}
                      speedSettings={speedSettings}
                      currentAlbumId={currentAlbumId}
                    />
                    <div className="w-[280px] h-[620px] flex items-center justify-center overflow-visible">
                      <AlbumStack
                        currentAlbumId={currentAlbumId}
                        onAlbumChange={setCurrentAlbumId}
                        isMobile={isMobile}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Audio Setup Guide Modal */}
      <AudioSetupGuide
        isVisible={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />

      {/* File Status Checker Modal */}
      <FileStatusChecker
        isVisible={showFileChecker}
        onClose={() => setShowFileChecker(false)}
      />
      </div>
    </div>
  );
}
