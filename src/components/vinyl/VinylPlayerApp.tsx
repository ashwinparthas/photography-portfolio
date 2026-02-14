import { VinylPlayer } from "./components/VinylPlayer";
import { VinylPlayerMobile } from "./components/VinylPlayerMobile";
import { AlbumStack } from "./components/AlbumStack";
import { AudioSetupGuide } from "./components/AudioSetupGuide";
import { FileStatusChecker } from "./components/FileStatusChecker";
import { useState, useEffect, useRef } from "react";
import { withBasePath } from "@/lib/basePath";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [currentAlbumId, setCurrentAlbumId] = useState("fallen");
  const [audioError, setAudioError] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioErrorMessage, setAudioErrorMessage] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showFileChecker, setShowFileChecker] = useState(false);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState<{[key: string]: number}>({});
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [hasTriedExternalUrls, setHasTriedExternalUrls] = useState(true); // Skip external URL attempts by default
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const audioPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const activePlayPromisesRef = useRef<Set<Promise<void>>>(new Set());

  const speedSettings = [
    { rpm: 33, rate: 1.0, duration: 3 },
    { rpm: 45, rate: 1.36, duration: 2.2 },
    { rpm: 78, rate: 2.36, duration: 1.3 },
  ];

  // Optimized function to generate the most likely working Dropbox URLs (reduced for speed)
  const generateDropboxSources = (originalUrl: string) => {
    const sources = [];
    
    try {
      // Convert Dropbox sharing URL to the most reliable formats only
      if (originalUrl.includes('dropbox.com/scl/fi/')) {
        // Strategy 1: dl.dropboxusercontent.com with raw=1 (most reliable)
        sources.push(originalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=1', 'raw=1'));
        
        // Strategy 2: Keep original domain, just change dl=1 to raw=1
        sources.push(originalUrl.replace('dl=1', 'raw=1'));
        
        // Strategy 3: Original URL as final fallback
        sources.push(originalUrl);
      } else {
        // Non-Dropbox URL - just return as is
        sources.push(originalUrl);
      }
    } catch {
      sources.push(originalUrl);
    }
    
    return sources;
  };

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
        dropboxSources: generateDropboxSources(localSongPaths.gravity),
        fallbackUrls: [
          originalUrls.gravity,
          ...generateDropboxSources(localSongPaths.gravity)
        ],
        duration: 215,
      },
      vivid_dreams: {
        title: "VIVID DREAMS",
        artist: "KAYTRANADA",
        audioUrl: originalUrls.vivid_dreams,
        dropboxSources: generateDropboxSources(localSongPaths.vivid_dreams),
        fallbackUrls: [
          originalUrls.vivid_dreams,
          ...generateDropboxSources(localSongPaths.vivid_dreams)
        ],
        duration: 277,
      },
      hereditary: {
        title: "Hereditary",
        artist: "JID",
        audioUrl: originalUrls.hereditary,
        dropboxSources: generateDropboxSources(localSongPaths.hereditary),
        fallbackUrls: [
          originalUrls.hereditary,
          ...generateDropboxSources(localSongPaths.hereditary)
        ],
        duration: 243,
      },
      being_so_normal: {
        title: "Being so Normal",
        artist: "Peach Pit",
        audioUrl: originalUrls.being_so_normal,
        dropboxSources: generateDropboxSources(localSongPaths.being_so_normal),
        fallbackUrls: [
          originalUrls.being_so_normal,
          ...generateDropboxSources(localSongPaths.being_so_normal)
        ],
        duration: 220,
      },
      fallen: {
        title: "Fallen",
        artist: "Mya",
        audioUrl: originalUrls.fallen,
        dropboxSources: generateDropboxSources(localSongPaths.fallen),
        fallbackUrls: [
          originalUrls.fallen,
          ...generateDropboxSources(localSongPaths.fallen)
        ],
        duration: 215,
      },
    };

    return baseLibrary;
  };

  const musicLibrary = getMusicLibrary();

  const currentTrack =
    musicLibrary[currentAlbumId as keyof typeof musicLibrary];
  const playbackStatusLabel = isPlaying ? "Playing" : "Not Playing";
  const playbackStatusIcon = isPlaying ? "▶️" : "⏸️";

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Use 640px as breakpoint (sm in Tailwind)
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () =>
      window.removeEventListener("resize", checkIsMobile);
  }, []);

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
    // Stop current playing audio with volume fade only
    if (audioElementRef.current) {
      try {
        audioElementRef.current.volume = 0;
      } catch (error: any) {
        // Ignore volume errors
      }
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
      let audioContainer = document.getElementById('audio-container');
      if (!audioContainer) {
        audioContainer = document.createElement('div');
        audioContainer.id = 'audio-container';
        audioContainer.style.display = 'none';
        audioContainer.style.position = 'absolute';
        audioContainer.style.top = '-9999px';
        document.body.appendChild(audioContainer);
      }
      audioContainer.appendChild(audio);

      let resolved = false;
      let sourceIndex = 0;
      let sourceTimeout: ReturnType<typeof setTimeout> | null = null;

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
          if (sourceTimeout) {
            clearTimeout(sourceTimeout);
            sourceTimeout = null;
          }
          cleanup();
          resolve(audio);
        };

        const onError = () => {
          if (resolved) return;
          if (sourceTimeout) {
            clearTimeout(sourceTimeout);
            sourceTimeout = null;
          }
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
        sourceTimeout = setTimeout(onError, 8000);
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

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Async function to handle the entire audio setup
    const handleAudioChange = async () => {
      try {
        // Initialize audio on first play attempt
        if (isPlaying && !audioInitialized) {
          initializeAudio();
        }

        // EXPLICIT STOP: If tonearm is NOT on vinyl, ensure no audio plays
        if (!isPlaying) {
          await stopAllAudioSafely();
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
                audioElementRef.current.volume = 1.0;
              } catch (error: any) {
                // Ignore volume errors
              }
              return;
            }

            // Prevent multiple simultaneous loading attempts
            if (isLoadingAudio) {
              return;
            }

            setIsLoadingAudio(true);
            setLoadingProgress(10);

            // Stop any current audio safely
            await stopAllAudioSafely();

            try {
              // Get sources for this track
              const fallbackUrls = (currentTrack as any).fallbackUrls || [];
              const localFileUrl = fallbackUrls.find((url: string) =>
                url.includes("/songs/")
              );
              
              const allSources = Array.from(
                new Set(
                  localFileUrl
                    ? [withBasePath(localFileUrl), localFileUrl]
                    : [withBasePath(currentTrack.audioUrl), currentTrack.audioUrl]
                )
              );

              setLoadingProgress(30);

              // Create completely isolated audio element
              const audio = await createIsolatedAudioElement(trackKey, allSources);
              
              setLoadingProgress(60);

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

              setLoadingProgress(80);

              // Store references
              audioElementRef.current = audio;
              currentTrackRef.current = trackKey;

              // Start playback with promise-safe method
              await playAudioSafely(audio, trackKey);

              setCurrentFallbackIndex(prev => ({ ...prev, [currentAlbumId]: 0 }));
              setLoadingProgress(100);
              
            } catch (error: any) {
              // Check if it was aborted
              if (error?.name === 'AbortError') {
                setLoadingProgress(0);
                return;
              }

              setLoadingProgress(0);
              setAudioErrorMessage(
                "Full MP3 not found. Add files to /public/songs/ (gravity, vivid-dreams, hereditary, being-so-normal, fallen)."
              );
              setAudioError(true);
              setIsPlaying(false);
            } finally {
              setIsLoadingAudio(false);
            }
          } catch (error: any) {
            if (error?.name === 'AbortError') {
              return;
            }
            void error;
            setAudioError(true);
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        void error;
        setIsLoadingAudio(false);
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
            left: "10%",
            right: "10%",
            top: "-8%",
            height: "34%",
            borderRadius: "44% 56% 58% 42% / 48% 40% 60% 52%",
            background:
              "radial-gradient(70% 90% at 50% 12%, rgba(255,255,255,0.1), rgba(24,24,24,0.94) 55%, rgba(6,6,6,0.98) 100%)",
            opacity: 0.88,
            filter: "blur(0.2px)"
          }}
        />
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
        style={{ zIndex: 20 }}
      >
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
          <div className="flex flex-col items-center justify-between min-h-full w-full py-8">
            {/* Status Toast - top element */}
            <div className="flex-shrink-0 w-full flex items-center justify-center">
              {currentTrack ? (
                <div className="mx-auto bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-center">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textAlign: "center"
                    }}
                    className="text-sm font-medium"
                  >
                    <span aria-hidden="true">{playbackStatusIcon}</span>
                    <span>{playbackStatusLabel}</span>
                  </div>
                  <div className="text-xs text-gray-300 text-center">
                    {currentTrack.title} - {currentTrack.artist}
                  </div>
                </div>
              ) : (
                <div className="h-16"></div> // Placeholder to maintain spacing
              )}
            </div>

            {/* Vinyl Player - center element */}
            <div className="flex-shrink-0">
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
            <div className="flex-shrink-0 flex items-center justify-center">
              <AlbumStack
                currentAlbumId={currentAlbumId}
                onAlbumChange={setCurrentAlbumId}
                isMobile={isMobile}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Desktop Status Indicators - absolute positioned */}
          {currentTrack && (
            <div className="absolute top-8 inset-x-0 z-50 flex justify-center" style={{ zIndex: 80 }}>
              <div className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-center">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textAlign: "center"
                  }}
                  className="text-sm font-medium"
                >
                  <span aria-hidden="true">{playbackStatusIcon}</span>
                  <span>{playbackStatusLabel}</span>
                </div>
                <div className="text-xs text-gray-300 text-center">
                  {currentTrack.title} - {currentTrack.artist}
                </div>
              </div>
            </div>
          )}

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
          
          {/* Desktop layout - horizontal with center alignment and flexible height */}
          <div className="flex items-center justify-center gap-[100px] max-w-full max-h-full overflow-hidden">
            <VinylPlayer
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              speedIndex={speedIndex}
              setSpeedIndex={setSpeedIndex}
              speedSettings={speedSettings}
              currentAlbumId={currentAlbumId}
            />
            <div className="w-[280px] min-h-[280px] max-h-[650px] flex items-center justify-center overflow-visible">
              <AlbumStack
                currentAlbumId={currentAlbumId}
                onAlbumChange={setCurrentAlbumId}
                isMobile={isMobile}
              />
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
