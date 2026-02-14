import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "motion/react";
import svgPaths from "../imports/svg-witqoke8dj";
import imgEllipse1 from "../assets/90b583e555306e1af2081d8031bcfb3e37b9514b.png";
import { withBasePath } from "@/lib/basePath";

function TonearmGroup({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="absolute h-[40.423px] left-[68.15px] top-[470.05px] w-[367.984px] cursor-pointer origin-[298px_8.95px]"
      animate={{
        rotate: isPlaying ? 25.913 : 0,
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      onClick={onClick}
    >
      <div className="absolute inset-[-5.75%_-1.91%_-27.27%_-1.7%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 382 55"
        >
          <g filter="url(#filter0_d_2_325)" id="Group 1">
            <path
              d={svgPaths.p22b3bc70}
              fill="url(#paint0_radial_2_325)"
              id="Rectangle 4"
            />
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="53.7735"
              id="filter0_d_2_325"
              width="381.262"
              x="0.738416"
              y="0.674335"
            >
              <feFlood
                floodOpacity="0"
                result="BackgroundImageFix"
              />
              <feColorMatrix
                in="SourceAlpha"
                result="hardAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset dy="4.00891" />
              <feGaussianBlur stdDeviation="3.5078" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
              />
              <feBlend
                in2="BackgroundImageFix"
                mode="normal"
                result="effect1_dropShadow_2_325"
              />
              <feBlend
                in="SourceGraphic"
                in2="effect1_dropShadow_2_325"
                mode="normal"
                result="shape"
              />
            </filter>
            <radialGradient
              cx="0"
              cy="0"
              gradientTransform="translate(190.993 23.2117) scale(183.992 20.2116)"
              gradientUnits="userSpaceOnUse"
              id="paint0_radial_2_325"
              r="1"
            >
              <stop stopColor="#060606" />
              <stop offset="1" stopColor="#222222" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function VinylRecord({ 
  isPlaying, 
  rotationDuration, 
  currentRotation, 
  setCurrentRotation 
}: { 
  isPlaying: boolean; 
  rotationDuration: number;
  currentRotation: number;
  setCurrentRotation: (rotation: number) => void;
}) {
  const rotateValue = useMotionValue(currentRotation);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    // Update motion value when currentRotation changes
    rotateValue.set(currentRotation);
  }, [currentRotation, rotateValue]);

  const handleAnimationComplete = () => {
    if (!isPlaying) {
      // When stopped, capture the current rotation position
      const finalRotation = rotateValue.get() % 360;
      setCurrentRotation(finalRotation);
    }
  };

  return (
    <motion.div
      className="absolute size-[398.051px] top-[66px]"
      data-name="CD"
      style={{ left: "calc(50% - 0.475px)", x: "-50%", rotate: rotateValue }}
      animate={isPlaying ? { rotate: currentRotation + 360 } : { rotate: currentRotation }}
      transition={{
        duration: isPlaying ? rotationDuration : 0,
        repeat: isPlaying ? Infinity : 0,
        ease: "linear",
      }}
      onUpdate={(latest) => {
        // Continuously update the motion value during animation
        if (typeof latest.rotate === 'number') {
          rotateValue.set(latest.rotate);
        }
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      <div className="absolute left-0 size-[398.051px] top-0">
        <div className="absolute inset-[-7.39%_-4.2%_-3.52%_-6.71%]">
          <img className="block max-w-none size-full" height="441.481" src={imgEllipse1.src} width="441.481" />
        </div>
      </div>
      <div className="absolute left-[145px] size-[107.405px] top-[145px]">
        <div className="absolute inset-[-11.042%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 132 132">
            <circle cx="65.7027" cy="65.7027" fill="var(--fill-0, #CDCDCD)" id="Ellipse 8" r="59.6325" stroke="var(--stroke-0, #383836)" strokeWidth="11.8597" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[191px] size-[15.534px] top-[191px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="7.76726" cy="7.76726" fill="url(#paint0_radial_2_247)" id="Ellipse 9" r="7.76726" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(7.76726 7.76726) rotate(91.8476) scale(2.59043 2.70477)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_247" r="1">
              <stop stopColor="#515151" />
              <stop offset="1" stopColor="#353535" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute left-1.5 size-[386px] top-1.5">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 386 386">
          <circle cx="193" cy="193" id="Ellipse 12" opacity="0.3" r="192.5" stroke="url(#paint0_linear_4_89)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_89" x1="193" x2="193" y1="0" y2="386">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[361.9px] top-[18px] translate-x-[-50%]" style={{ left: "calc(50% - 0.076px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 362 362">
          <circle cx="180.95" cy="180.95" id="Ellipse 14" opacity="0.3" r="180.45" stroke="url(#paint0_linear_4_85)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_85" x1="180.95" x2="180.95" y1="0" y2="361.9">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[337.8px] top-[30px] translate-x-[-50%]" style={{ left: "calc(50% - 0.126px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 338 338">
          <circle cx="168.9" cy="168.9" id="Ellipse 16" opacity="0.3" r="168.4" stroke="url(#paint0_linear_4_79)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_79" x1="168.9" x2="168.9" y1="0" y2="337.8">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[313.7px] top-[42px] translate-x-[-50%]" style={{ left: "calc(50% - 0.176px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 314 314">
          <circle cx="156.85" cy="156.85" id="Ellipse 18" opacity="0.3" r="156.35" stroke="url(#paint0_linear_4_83)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_83" x1="156.85" x2="156.85" y1="0" y2="313.7">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[289.6px] top-[54px] translate-x-[-50%]" style={{ left: "calc(50% - 0.226px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 290 290">
          <circle cx="144.8" cy="144.8" id="Ellipse 20" opacity="0.3" r="144.3" stroke="url(#paint0_linear_4_67)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_67" x1="144.8" x2="144.8" y1="0" y2="289.6">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[265.5px] top-[67px] translate-x-[-50%]" style={{ left: "calc(50% - 0.276px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 266 266">
          <circle cx="132.75" cy="132.75" id="Ellipse 22" opacity="0.3" r="132.25" stroke="url(#paint0_linear_4_71)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_71" x1="132.75" x2="132.75" y1="0" y2="265.5">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[241.4px] top-[78px] translate-x-[-50%]" style={{ left: "calc(50% - 0.326px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 242 242">
          <circle cx="120.7" cy="120.7" id="Ellipse 24" opacity="0.3" r="120.2" stroke="url(#paint0_linear_4_65)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_65" x1="120.7" x2="120.7" y1="0" y2="241.4">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[217.3px] top-[90px] translate-x-[-50%]" style={{ left: "calc(50% - 0.376px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 218 218">
          <circle cx="108.65" cy="108.65" id="Ellipse 26" opacity="0.3" r="108.15" stroke="url(#paint0_linear_4_61)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_61" x1="108.65" x2="108.65" y1="0" y2="217.3">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[193.2px] top-[102px] translate-x-[-50%]" style={{ left: "calc(50% - 0.426px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 194 194">
          <circle cx="96.6" cy="96.6" id="Ellipse 28" opacity="0.3" r="96.1" stroke="url(#paint0_linear_4_59)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_59" x1="96.6" x2="96.6" y1="0" y2="193.2">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[169.1px] top-[114px] translate-x-[-50%]" style={{ left: "calc(50% - 0.476px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 170 170">
          <circle cx="84.55" cy="84.55" id="Ellipse 30" opacity="0.3" r="84.05" stroke="url(#paint0_linear_4_55)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_55" x1="84.55" x2="84.55" y1="0" y2="169.1">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[145px] top-[127px] translate-x-[-50%]" style={{ left: "calc(50% + 0.474px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 145 145">
          <circle cx="72.5" cy="72.5" id="Ellipse 32" opacity="0.3" r="72" stroke="url(#paint0_linear_4_53)" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_53" x1="72.5" x2="72.5" y1="0" y2="145">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

interface VinylPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speedIndex: number;
  setSpeedIndex: (index: number) => void;
  speedSettings: { rpm: number; rate: number; duration: number }[];
  currentAlbumId: string;
}

// Music library (full local files only)
const getMusicLibrary = () => {
  return {
    gravity: {
      title: "Gravity",
      artist: "Brent Faiyaz",
      sources: [withBasePath("/songs/gravity.mp3")],
      duration: 215,
    },
    vivid_dreams: {
      title: "VIVID DREAMS",
      artist: "KAYTRANADA", 
      sources: [withBasePath("/songs/vivid-dreams.mp3")],
      duration: 277,
    },
    hereditary: {
      title: "Hereditary",
      artist: "JID",
      sources: [withBasePath("/songs/hereditary.mp3")],
      duration: 243,
    },
    being_so_normal: {
      title: "Being so Normal",
      artist: "Peach Pit",
      sources: [withBasePath("/songs/being-so-normal.mp3")],
      duration: 220,
    },
    fallen: {
      title: "Fallen",
      artist: "Mya",
      sources: [withBasePath("/songs/fallen.mp3")],
      duration: 215,
    },
  };
};

export function VinylPlayer({ 
  isPlaying, 
  setIsPlaying, 
  speedIndex, 
  setSpeedIndex, 
  speedSettings,
  currentAlbumId 
}: VinylPlayerProps) {
  const [tonearmEngaged, setTonearmEngaged] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0); // Track cumulative rotation
  const [vinylRotation, setVinylRotation] = useState(0); // Track vinyl current rotation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const lastTrackRef = useRef("");
  
  const musicLibrary = getMusicLibrary();
  const currentTrack = musicLibrary[currentAlbumId as keyof typeof musicLibrary] || musicLibrary.fallen;

  const handleTonearmClick = () => {
    if (!tonearmEngaged) {
      // Start sequence immediately to stay within user gesture timing.
      setTonearmEngaged(true);
      setIsPlaying(true);
    } else {
      // Stop sequence: stop playing immediately, then move tonearm back
      setIsPlaying(false);
      setTonearmEngaged(false);
      
      // Clear timeout if tonearm was clicked before reaching position
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // The vinyl will stop at its current position automatically
      // The rotation position will be captured in the VinylRecord component
    }
  };

  const handleSpeedClick = () => {
    const newSpeedIndex = (speedIndex + 1) % speedSettings.length;
    setSpeedIndex(newSpeedIndex);
    setTotalRotation((prev) => prev + 120);
  };

  // Handle audio playback with HTML source tags
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentSpeed = speedSettings[speedIndex];
    
    if (isPlaying) {
      const shouldRestart = !hasStartedRef.current || lastTrackRef.current !== currentTrack.title;
      if (shouldRestart) {
        audio.currentTime = 0;
      }
      // Set playback rate based on speed setting
      audio.playbackRate = currentSpeed.rate;
      audio.volume = 0.7;
      
      // Try to play
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasStartedRef.current = true;
            lastTrackRef.current = currentTrack.title;
          })
          .catch((error) => {
            void error;
            setIsPlaying(false);
            setTonearmEngaged(false);
          });
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      hasStartedRef.current = false;
      lastTrackRef.current = currentTrack.title;
    }
  }, [isPlaying, speedIndex, speedSettings, currentTrack.title]);

  // Update playback rate when speed changes during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.playbackRate = speedSettings[speedIndex].rate;
    }
  }, [speedIndex, isPlaying, speedSettings]);

  // Handle album changes - stop current audio and reload
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Stop current audio
      audio.pause();
      audio.currentTime = 0;
      
      // Load new audio sources
      audio.load();

      // If currently playing, start new track
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            void error;
            setIsPlaying(false);
            setTonearmEngaged(false);
          });
        }
      }
    }
  }, [currentAlbumId, currentTrack.title]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative shadow-[0px_0px_80px_8px_rgba(255,255,255,0.08)] w-[487.249px] h-[600px]"
      style={{ width: "487.249px", height: "600px", flex: "0 0 487.249px" }}
      data-name="Vinyl"
    >
      <div
        className="absolute bg-gradient-to-b from-[#d5d5d3] h-[600px] left-0 to-[#c4c4c2] top-0 w-[487.249px]"
        style={{
          width: "487.249px",
          height: "600px",
          backgroundImage: "linear-gradient(to bottom, #d5d5d3, #c4c4c2)",
        }}
      />
      <div className="absolute left-[306.35px] size-[119.599px] top-[419.1px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 120 120"
        >
          <path
            d={svgPaths.p3ae94380}
            fill="url(#paint0_radial_2_243)"
            id="Ellipse 5"
          />
          <defs>
            <radialGradient
              cx="0"
              cy="0"
              gradientTransform="translate(59.7996) rotate(90) scale(119.599)"
              gradientUnits="userSpaceOnUse"
              id="paint0_radial_2_243"
              r="1"
            >
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <VinylRecord 
        isPlaying={isPlaying} 
        rotationDuration={speedSettings[speedIndex].duration}
        currentRotation={vinylRotation}
        setCurrentRotation={setVinylRotation}
      />
      
      {/* Speed Dial 1 (Left) with rotation */}
      <motion.div
        className="absolute left-[172.05px] size-[48.942px] top-[520.16px] cursor-pointer"
        animate={{ rotate: totalRotation }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={handleSpeedClick}
      >
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 49">
          <g id="Frame 1">
            <rect fill="var(--fill-0, #0F0F0F)" height="22.39" id="Rectangle 2" width="3.00668" x="22.8848" y="25.3896" />
            <path d={svgPaths.p25fd6580} fill="url(#paint0_radial_2_770)" id="Ellipse 4" />
          </g>
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(24.471) rotate(90) scale(48.9421)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_770" r="1">
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Tonearm handle */}
      <div className="absolute h-[31.737px] left-[230.01px] top-[491.26px] w-[14.532px]">
        <div className="absolute inset-[-2.11%_-18.39%_-14.74%_-18.39%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 38">
            <g filter="url(#filter0_d_2_241)" id="Ellipse 7">
              <ellipse cx="10.2661" cy="16.8686" fill="var(--fill-0, #080806)" rx="7.26615" ry="15.8686" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="37.0824" id="filter0_d_2_241" width="19.8775" x="0.327394" y="0.331849">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="2.00445" />
                <feGaussianBlur stdDeviation="1.3363" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_241" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_241" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <TonearmGroup
        isPlaying={tonearmEngaged}
        onClick={handleTonearmClick}
      />
      

      
      {/* Speed Dial 2 (Right) */}
      <div className="absolute left-[254.4px] size-[48.942px] top-[520.16px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 49">
          <g id="Frame 2">
            <rect fill="var(--fill-0, #0F0F0F)" height="22.39" id="Rectangle 3" width="3.00668" x="23.0508" y="25.3896" />
            <path d={svgPaths.p25fd6580} fill="url(#paint0_radial_2_766)" id="Ellipse 3" />
          </g>
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(24.471) rotate(90) scale(48.9421)" gradientUnits="userSpaceOnUse" id="paint0_radial_2_766" r="1">
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute left-[26.39px] size-[41.76px] top-[44.93px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 42 42"
        >
          <path
            d={svgPaths.p335e7800}
            fill="url(#paint0_radial_2_229)"
            id="Ellipse 10"
          />
          <defs>
            <radialGradient
              cx="0"
              cy="0"
              gradientTransform="translate(20.8797) rotate(90) scale(41.7595)"
              gradientUnits="userSpaceOnUse"
              id="paint0_radial_2_229"
              r="1"
            >
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {/* PAIRING label */}
      <div className="absolute flex h-[22px] items-center justify-center left-[43.44px] top-[55.12px] w-[6px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[5.345px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">PAIRING</p>
          </div>
        </div>
      </div>
      
      {/* SPEED label */}
      <div className="absolute flex h-[18px] items-center justify-center left-[224.51px] top-[535.69px] w-[6px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[5.345px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SPEED</p>
          </div>
        </div>
      </div>
      
      {/* SIZE label */}
      <div className="absolute flex h-[12px] items-center justify-center left-[306.86px] top-[538.86px] w-[6px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[5.345px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SIZE</p>
          </div>
        </div>
      </div>
      
      {/* SONY brand */}
      <div className="absolute flex h-[38px] items-center justify-center left-[454.21px] top-[41.59px] w-[16px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Old_Standard_TT:Bold',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[13.363px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SONY</p>
          </div>
        </div>
      </div>
      

      <div className="absolute left-[338.08px] size-[56.125px] top-[451.17px]">
        <div className="absolute inset-[-32.74%_-27.98%_-23.21%_-27.98%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 88 89"
          >
            <g filter="url(#filter0_dd_2_231)" id="Ellipse 6">
              <circle
                cx="44.0624"
                cy="47.0624"
                fill="var(--fill-0, #060606)"
                r="28.0624"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="87.5278"
                id="filter0_dd_2_231"
                width="87.5278"
                x="0.298441"
                y="0.625835"
              >
                <feFlood
                  floodOpacity="0"
                  result="BackgroundImageFix"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset dy="-2.67261" />
                <feGaussianBlur stdDeviation="7.85078" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_2_231"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset dx="-1.67038" dy="-1.67038" />
                <feGaussianBlur stdDeviation="0.334076" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
                />
                <feBlend
                  in2="effect1_dropShadow_2_231"
                  mode="normal"
                  result="effect2_dropShadow_2_231"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect2_dropShadow_2_231"
                  mode="normal"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
