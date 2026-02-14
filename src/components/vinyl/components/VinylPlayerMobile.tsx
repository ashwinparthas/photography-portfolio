import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "motion/react";
import svgPaths from "../imports/svg-gn53mo47my";
import imgEllipse1 from "../assets/8a9ed19f53e6eb9d518e5f7ee658b6488187f89b.png";
import { withBasePath } from "@/lib/basePath";

function Frame1Mobile({ onClick, totalRotation }: { onClick: () => void; totalRotation: number }) {
  return (
    <motion.div
      className="absolute left-[127.36px] size-[36.228px] top-[385.04px] cursor-pointer"
      animate={{ rotate: totalRotation }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={onClick}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 37">
        <g id="Frame 1">
          <rect fill="var(--fill-0, #0F0F0F)" height="16.5738" id="Rectangle 2" width="2.22564" x="16.9405" y="18.7933" />
          <path d={svgPaths.p1153ad80} fill="url(#paint0_radial_6_84)" id="Ellipse 4" />
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(18.1144 0.000105557) rotate(90) scale(36.2285)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_84" r="1">
            <stop stopColor="#848482" />
            <stop offset="0.498857" stopColor="#A2A2A2" />
            <stop offset="0.730769" stopColor="#A0A0A0" />
            <stop offset="1" stopColor="#7B7B79" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

function TonearmGroupMobile({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="absolute h-[29.922px] left-[50.45px] top-[347.94px] w-[272.394px] cursor-pointer origin-[218px_6.6px]"
      animate={{
        rotate: isPlaying ? 25.913 : 0,
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      onClick={onClick}
    >
      <div className="absolute inset-[-5.75%_-1.91%_-27.27%_-1.7%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 283 41">
          <g filter="url(#filter0_d_6_77)" id="Group 1">
            <path d={svgPaths.p2c85b000} fill="url(#paint0_radial_6_77)" id="Rectangle 4" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="39.8049" id="filter0_d_6_77" width="282.223" x="0.36471" y="0.278638">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.96753" />
              <feGaussianBlur stdDeviation="2.59658" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_6_77" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_6_77" mode="normal" result="shape" />
            </filter>
            <radialGradient cx="0" cy="0" gradientTransform="translate(141.197 16.9615) scale(136.197 14.9613)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_77" r="1">
              <stop stopColor="#060606" />
              <stop offset="1" stopColor="#222222" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

function Frame2Mobile() {
  return (
    <div className="absolute left-[188.31px] size-[36.228px] top-[385.04px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 37">
        <g id="Frame 2">
          <rect fill="var(--fill-0, #0F0F0F)" height="16.5738" id="Rectangle 3" width="2.22564" x="17.0633" y="18.7933" />
          <path d={svgPaths.p1a363f00} fill="url(#paint0_radial_6_53)" id="Ellipse 3" />
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(18.1141 0.000105557) rotate(90) scale(36.2285)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_53" r="1">
            <stop stopColor="#848482" />
            <stop offset="0.498857" stopColor="#A2A2A2" />
            <stop offset="0.730769" stopColor="#A0A0A0" />
            <stop offset="1" stopColor="#7B7B79" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function VinylRecordMobile({ 
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

  useEffect(() => {
    rotateValue.set(currentRotation);
  }, [currentRotation, rotateValue]);

  const handleAnimationComplete = () => {
    if (!isPlaying) {
      const finalRotation = rotateValue.get() % 360;
      setCurrentRotation(finalRotation);
    }
  };

  const handleAnimationUpdate = (latest: any) => {
    if (typeof latest.rotate === 'number') {
      rotateValue.set(latest.rotate);
    }
  };

  return (
    <motion.div
      className="absolute size-[294.65px] top-[48.86px]"
      data-name="CD"
      style={{ left: "calc(50% - 0.351px)", x: "-50%", rotate: rotateValue }}
      animate={isPlaying ? { rotate: currentRotation + 360 } : { rotate: currentRotation }}
      transition={{
        duration: isPlaying ? rotationDuration : 0,
        repeat: isPlaying ? Infinity : 0,
        ease: "linear",
      }}
      onUpdate={handleAnimationUpdate}
      onAnimationComplete={handleAnimationComplete}
    >
      {/* Main vinyl record image */}
      <div className="absolute left-0 size-[294.65px] top-0">
        <div className="absolute inset-[-7.39%_-4.2%_-3.52%_-6.71%]">
          <img className="block max-w-none size-full" height="326.799" src={imgEllipse1.src} width="326.799" />
        </div>
      </div>

      {/* Center label area */}
      <div className="absolute left-[107.33px] size-[79.505px] top-[107.33px]">
        <div className="absolute inset-[-11.042%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 98 98">
            <circle cx="48.7525" cy="48.7525" fill="var(--fill-0, #CDCDCD)" id="Ellipse 8" r="44.1419" stroke="var(--stroke-0, #383836)" strokeWidth="8.77893" />
          </svg>
        </div>
      </div>

      {/* Center spindle hole */}
      <div className="absolute left-[141.38px] size-[11.499px] top-[141.38px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <circle cx="5.74958" cy="5.74958" fill="url(#paint0_radial_6_67)" id="Ellipse 9" r="5.74958" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(5.74958 5.74958) rotate(91.8476) scale(1.91752 2.00216)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_67" r="1">
              <stop stopColor="#515151" />
              <stop offset="1" stopColor="#353535" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* All concentric groove circles */}
      <div className="absolute left-[4.44px] size-[285.73px] top-[4.44px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 286 286">
          <circle cx="142.865" cy="142.865" id="Ellipse 12" opacity="0.3" r="142.495" stroke="url(#paint0_linear_6_65)" strokeWidth="0.740232" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_65" x1="142.865" x2="142.865" y1="0" y2="285.73">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[267.89px] top-[13.32px] translate-x-[-50%]" style={{ left: "calc(50% - 0.058px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 268 268">
          <circle cx="133.945" cy="133.945" id="Ellipse 14" opacity="0.3" r="133.575" stroke="url(#paint0_linear_6_63)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_63" x1="133.945" x2="133.945" y1="0" y2="267.89">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[250.051px] top-[22.21px] translate-x-[-50%]" style={{ left: "calc(50% - 0.094px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 251 251">
          <circle cx="125.025" cy="125.025" id="Ellipse 16" opacity="0.3" r="124.655" stroke="url(#paint0_linear_6_61)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_61" x1="125.025" x2="125.025" y1="0" y2="250.051">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[232.211px] top-[31.09px] translate-x-[-50%]" style={{ left: "calc(50% - 0.131px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 233 233">
          <circle cx="116.105" cy="116.105" id="Ellipse 18" opacity="0.3" r="115.735" stroke="url(#paint0_linear_6_59)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_59" x1="116.105" x2="116.105" y1="0" y2="232.211">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[214.371px] top-[39.97px] translate-x-[-50%]" style={{ left: "calc(50% - 0.168px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 215 215">
          <circle cx="107.186" cy="107.186" id="Ellipse 20" opacity="0.3" r="106.816" stroke="url(#paint0_linear_6_57)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_57" x1="107.186" x2="107.186" y1="0" y2="214.371">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[196.532px] top-[49.59px] translate-x-[-50%]" style={{ left: "calc(50% - 0.204px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 197 197">
          <circle cx="98.2659" cy="98.2659" id="Ellipse 22" opacity="0.3" r="97.8958" stroke="url(#paint0_linear_6_69)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_69" x1="98.2659" x2="98.2659" y1="0" y2="196.532">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[178.692px] top-[57.74px] translate-x-[-50%]" style={{ left: "calc(50% - 0.242px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 179 179">
          <circle cx="89.3461" cy="89.3461" id="Ellipse 24" opacity="0.3" r="88.976" stroke="url(#paint0_linear_6_51)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_51" x1="89.3461" x2="89.3461" y1="0" y2="178.692">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[160.853px] top-[66.62px] translate-x-[-50%]" style={{ left: "calc(50% - 0.279px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 161 161">
          <circle cx="80.4263" cy="80.4263" id="Ellipse 26" opacity="0.3" r="80.0562" stroke="url(#paint0_linear_6_47)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_47" x1="80.4263" x2="80.4263" y1="0" y2="160.853">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[143.013px] top-[75.5px] translate-x-[-50%]" style={{ left: "calc(50% - 0.316px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 144 144">
          <circle cx="71.5065" cy="71.5065" id="Ellipse 28" opacity="0.3" r="71.1363" stroke="url(#paint0_linear_6_82)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_82" x1="71.5065" x2="71.5065" y1="0" y2="143.013">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[125.173px] top-[84.39px] translate-x-[-50%]" style={{ left: "calc(50% - 0.353px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 126 126">
          <circle cx="62.5867" cy="62.5867" id="Ellipse 30" opacity="0.3" r="62.2165" stroke="url(#paint0_linear_6_49)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_49" x1="62.5867" x2="62.5867" y1="0" y2="125.173">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute size-[107.334px] top-[94.01px] translate-x-[-50%]" style={{ left: "calc(50% + 0.35px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108 108">
          <circle cx="53.6669" cy="53.6669" id="Ellipse 32" opacity="0.3" r="53.2967" stroke="url(#paint0_linear_6_45)" strokeWidth="0.740233" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_45" x1="53.6669" x2="53.6669" y1="0" y2="107.334">
              <stop stopColor="#464646" />
              <stop offset="1" stopColor="#2C2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

interface VinylPlayerMobileProps {
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
      title: "Being So Normal",
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

export function VinylPlayerMobile({ 
  isPlaying, 
  setIsPlaying, 
  speedIndex, 
  setSpeedIndex, 
  speedSettings,
  currentAlbumId 
}: VinylPlayerMobileProps) {
  const [tonearmEngaged, setTonearmEngaged] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0);
  const [vinylRotation, setVinylRotation] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const lastTrackRef = useRef("");
  
  const musicLibrary = getMusicLibrary();
  const currentTrack = musicLibrary[currentAlbumId as keyof typeof musicLibrary] || musicLibrary.fallen;

  const handleTonearmClick = () => {
    if (!tonearmEngaged) {
      setTonearmEngaged(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setTonearmEngaged(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative shadow-[0px_0px_80px_8px_rgba(255,255,255,0.08)] w-[360.678px] h-[444.14px]"
      style={{ width: "360.678px", height: "444.14px", flex: "0 0 360.678px" }}
      data-name="Vinyl"
    >
      {/* Background */}
      <div
        className="absolute bg-gradient-to-b from-[#d5d5d3] h-[444.14px] left-0 to-[#c4c4c2] top-0 w-[360.678px]"
        style={{
          width: "360.678px",
          height: "444.14px",
          backgroundImage: "linear-gradient(to bottom, #d5d5d3, #c4c4c2)",
        }}
      />
      
      {/* Size dial */}
      <div className="absolute left-[226.77px] size-[88.531px] top-[310.23px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 89 89">
          <path d={svgPaths.p28353f00} fill="url(#paint0_radial_6_80)" id="Ellipse 5" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(44.2656) rotate(90) scale(88.5312)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_80" r="1">
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      
      {/* Vinyl Record */}
      <VinylRecordMobile 
        isPlaying={isPlaying} 
        rotationDuration={speedSettings[speedIndex].duration}
        currentRotation={vinylRotation}
        setCurrentRotation={setVinylRotation}
      />

      {/* Speed Dial 1 (Left) with rotation */}
      <Frame1Mobile onClick={handleSpeedClick} totalRotation={totalRotation} />

      {/* Tonearm handle */}
      <div className="absolute h-[23.493px] left-[170.26px] top-[363.64px] w-[10.757px]">
        <div className="absolute inset-[-2.11%_-18.39%_-14.74%_-18.39%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 28">
            <g filter="url(#filter0_d_6_88)" id="Ellipse 7">
              <ellipse cx="7.37864" cy="12.7465" fill="var(--fill-0, #080806)" rx="5.37864" ry="11.7465" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="27.4496" id="filter0_d_6_88" width="14.714" x="0.0216502" y="0.505413">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1.48376" />
                <feGaussianBlur stdDeviation="0.989175" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_6_88" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_6_88" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Tonearm Group */}
      <TonearmGroupMobile
        isPlaying={tonearmEngaged}
        onClick={handleTonearmClick}
      />

      {/* Speed Dial 2 (Right) */}
      <Frame2Mobile />

      {/* Pairing dial */}
      <div className="absolute left-[19.54px] size-[30.912px] top-[33.26px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <path d={svgPaths.p36595800} fill="url(#paint0_radial_6_73)" id="Ellipse 10" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(15.4559) rotate(90) scale(30.9117)" gradientUnits="userSpaceOnUse" id="paint0_radial_6_73" r="1">
              <stop stopColor="#848482" />
              <stop offset="0.498857" stopColor="#A2A2A2" />
              <stop offset="0.730769" stopColor="#A0A0A0" />
              <stop offset="1" stopColor="#7B7B79" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute flex h-[15.969px] items-center justify-center left-[32.34px] top-[40.8px] w-[4.5px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[3.957px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">PAIRING</p>
          </div>
        </div>
      </div>
      
      <div className="absolute flex h-[13.406px] items-center justify-center left-[166.37px] top-[396.54px] w-[4.5px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[3.957px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SPEED</p>
          </div>
        </div>
      </div>
      
      <div className="absolute flex h-[8.797px] items-center justify-center left-[227.33px] top-[398.88px] w-[4.5px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Instrument_Sans:Medium',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[3.957px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SIZE</p>
          </div>
        </div>
      </div>
      
      <div className="absolute flex h-[28.031px] items-center justify-center left-[336.81px] top-[30.79px] w-[11.5px]">
        <div className="flex-none rotate-[90deg]">
          <div className="font-['Old_Standard_TT:Bold',_sans-serif] leading-[0] not-italic relative text-[#2a2a2a] text-[9.892px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">SONY</p>
          </div>
        </div>
      </div>

      {/* Bottom accent circle */}
      <div className="absolute left-[250.26px] size-[41.545px] top-[333.97px]">
        <div className="absolute inset-[-32.74%_-27.98%_-23.21%_-27.98%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 66 66">
            <g filter="url(#filter0_dd_6_75)" id="Ellipse 6">
              <circle cx="32.7727" cy="34.7727" fill="var(--fill-0, #060606)" r="20.7727" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="64.791" id="filter0_dd_6_75" width="64.791" x="0.377196" y="0.398847">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="-1.97835" />
                <feGaussianBlur stdDeviation="5.8114" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_6_75" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="-1.23647" dy="-1.23647" />
                <feGaussianBlur stdDeviation="0.247294" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0" />
                <feBlend in2="effect1_dropShadow_6_75" mode="normal" result="effect2_dropShadow_6_75" />
                <feBlend in="SourceGraphic" in2="effect2_dropShadow_6_75" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
