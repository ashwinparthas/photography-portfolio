import { useRef, useEffect, useCallback, useState } from 'react';

interface PatternCanvasProps {
  patternType: 'dots' | 'waves' | 'spiral' | 'noise' | 'grid';
  density: number;
  size: number;
  intensity: number;
  speed: number;
  colorMode: 'mono';
  backgroundColor: string;
  foregroundColor: string;
  gradientColor: string;
  isAnimated: boolean;
  mouseInteractive: boolean;
  morphing: boolean;
  dotShape?: 'circle' | 'triangle' | 'square' | 'diamond';
  animationEffect?: 'wave' | 'noise' | 'spiral' | 'diamond' | 'ripple' | 'orbit' | 'vortex' | 'breathing' | 'zigzag' | 'scatter' | 'tornado' | 'gravity' | 'magnetic' | 'explosion' | 'galaxy' | 'hypnotic' | 'cosmic_hurricane' | 'quantum_entanglement' | 'dark_energy' | 'multiverse_collapse';
}

export function PatternCanvas({
  patternType,
  density,
  size,
  intensity,
  speed,
  colorMode,
  backgroundColor,
  foregroundColor,
  gradientColor,
  isAnimated,
  mouseInteractive,
  morphing,
  dotShape = 'circle',
  animationEffect = 'wave'
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Measure the real canvas box so interactions stay aligned in embedded sections.
  useEffect(() => {
    const updateDimensions = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const viewportWidth = Math.max(
        1,
        Math.round(rect.width || canvas.clientWidth || window.innerWidth)
      );
      const viewportHeight = Math.max(
        1,
        Math.round(rect.height || canvas.clientHeight || window.innerHeight)
      );

      setDimensions({
        width: viewportWidth,
        height: viewportHeight
      });
    };

    updateDimensions();
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateDimensions)
      : null;
    if (canvas && observer) observer.observe(canvas);
    if (parent && observer) observer.observe(parent);
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Mouse and touch tracking
  useEffect(() => {
    if (!mouseInteractive) return;

    const updateMousePosition = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    // Add event listeners for both mouse and touch
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mouseInteractive]);

  // Color utilities
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [255, 255, 255];
  };

  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getColor = (x: number, y: number, distance: number = 0): string => {
    return foregroundColor;
  };

  // Shape drawing functions with better anti-aliasing
  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, shape: string) => {
    // Ensure minimum size to prevent gaps
    const minRadius = Math.max(0.5, radius);
    
    ctx.beginPath();
    
    switch (shape) {
      case 'circle':
        ctx.arc(x, y, minRadius, 0, Math.PI * 2);
        break;
        
      case 'triangle':
        const height = minRadius * 1.732; // sqrt(3) for equilateral triangle
        ctx.moveTo(x, y - height * 0.6);
        ctx.lineTo(x - minRadius, y + height * 0.4);
        ctx.lineTo(x + minRadius, y + height * 0.4);
        ctx.closePath();
        break;
        
      case 'square':
        // Use slightly larger squares to prevent gaps
        const squareSize = minRadius * 2.1;
        ctx.rect(x - squareSize/2, y - squareSize/2, squareSize, squareSize);
        break;
        
      case 'diamond':
        const diamondSize = minRadius * 1.1;
        ctx.moveTo(x, y - diamondSize);
        ctx.lineTo(x + diamondSize, y);
        ctx.lineTo(x, y + diamondSize);
        ctx.lineTo(x - diamondSize, y);
        ctx.closePath();
        break;
        
      default:
        ctx.arc(x, y, minRadius, 0, Math.PI * 2);
    }
    
    ctx.fill();
  };

  // Pattern generators
  const drawDots = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    const spacing = Math.max(3, Math.round(60 - density * 0.8)); // MUCH smaller spacing = MORE PIXELS!
    const dotSize = Math.max(1, size * 0.4); // Smaller dots for higher density
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Calculate grid bounds to ensure complete coverage with overlap
    const startX = -spacing;
    const endX = canvasWidth + spacing;
    const startY = -spacing;
    const endY = canvasHeight + spacing;
    
    // Use proper grid iteration to prevent gaps
    for (let x = startX; x <= endX; x += spacing) {
      for (let y = startY; y <= endY; y += spacing) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        
        // Mouse interaction
        let mouseInfluence = 1;
        if (mouseInteractive) {
          const mouseDist = Math.sqrt((x - mouseRef.current.x) ** 2 + (y - mouseRef.current.y) ** 2);
          mouseInfluence = 1 + Math.max(0, (80 - mouseDist) / 80) * 2;
        }

        // Animation effects
        let animationFactor = 1;
        let posOffsetX = 0;
        let posOffsetY = 0;
        
        if (isAnimated) {
          switch (animationEffect) {
            case 'wave':
              animationFactor = 0.5 + 0.5 * Math.sin(time * 0.003 * speed + distance * 0.01);
              posOffsetX = Math.sin(time * 0.002 * speed + y * 0.01) * 3;
              break;
              
            case 'noise':
              animationFactor = 0.3 + 0.7 * Math.sin(time * 0.005 * speed + x * 0.02 + y * 0.02);
              posOffsetX = Math.sin(time * 0.003 * speed + x * 0.05) * 3;
              posOffsetY = Math.cos(time * 0.003 * speed + y * 0.05) * 3;
              break;
              
            case 'spiral':
              const angle = Math.atan2(y - centerY, x - centerX);
              animationFactor = 0.4 + 0.6 * Math.sin(time * 0.004 * speed + angle * 3 + distance * 0.02);
              posOffsetX = Math.cos(time * 0.001 * speed + angle) * 2;
              posOffsetY = Math.sin(time * 0.001 * speed + angle) * 2;
              break;
              
            case 'diamond':
              const gridFactor = Math.sin((x + y) * 0.02 + time * 0.003 * speed);
              animationFactor = 0.3 + 0.7 * gridFactor;
              posOffsetX = gridFactor * 4;
              posOffsetY = -gridFactor * 4;
              break;
              
            case 'ripple':
              const ripplePhase = time * 0.003 * speed;
              const rippleDistance = distance * 0.02;
              animationFactor = 0.2 + 0.8 * Math.abs(Math.sin(rippleDistance - ripplePhase));
              const rippleOffset = Math.sin(rippleDistance - ripplePhase) * 2;
              posOffsetX = rippleOffset * Math.cos(Math.atan2(y - centerY, x - centerX));
              posOffsetY = rippleOffset * Math.sin(Math.atan2(y - centerY, x - centerX));
              break;
              
            case 'orbit':
              const orbitAngle = Math.atan2(y - centerY, x - centerX);
              const orbitRadius = distance * 0.001;
              const orbitSpeed = time * 0.002 * speed;
              animationFactor = 0.5 + 0.5 * Math.sin(orbitSpeed + orbitAngle * 2);
              posOffsetX = Math.cos(orbitSpeed + orbitAngle) * orbitRadius * 8;
              posOffsetY = Math.sin(orbitSpeed + orbitAngle) * orbitRadius * 8;
              break;
              
            case 'vortex':
              const vortexAngle = Math.atan2(y - centerY, x - centerX);
              const vortexRadius = distance / maxDistance;
              const vortexSpeed = time * 0.001 * speed;
              const vortexRotation = vortexSpeed + vortexRadius * 4;
              animationFactor = 0.3 + 0.7 * Math.sin(vortexRotation);
              posOffsetX = Math.cos(vortexAngle + vortexRotation) * vortexRadius * 6;
              posOffsetY = Math.sin(vortexAngle + vortexRotation) * vortexRadius * 6;
              break;
              
            case 'breathing':
              const breathingPhase = time * 0.002 * speed;
              const breathingWave = Math.sin(breathingPhase);
              animationFactor = 0.4 + 0.6 * (0.5 + 0.5 * breathingWave);
              const breathingScale = breathingWave * 0.3;
              posOffsetX = Math.sin(breathingPhase + x * 0.01) * breathingScale * 4;
              posOffsetY = Math.cos(breathingPhase + y * 0.01) * breathingScale * 4;
              break;
              
            case 'zigzag':
              const zigzagX = Math.sin(time * 0.004 * speed + y * 0.05);
              const zigzagY = Math.sin(time * 0.003 * speed + x * 0.05);
              animationFactor = 0.5 + 0.5 * Math.abs(zigzagX * zigzagY);
              posOffsetX = zigzagX * 6;
              posOffsetY = zigzagY * 4;
              break;
              
            case 'scatter':
              const scatterSeed1 = Math.sin(time * 0.003 * speed + x * 0.1 + y * 0.1);
              const scatterSeed2 = Math.cos(time * 0.004 * speed + x * 0.08 + y * 0.12);
              animationFactor = 0.3 + 0.7 * Math.abs(scatterSeed1);
              posOffsetX = scatterSeed1 * 8;
              posOffsetY = scatterSeed2 * 6;
              break;
              
            case 'tornado':
              const tornadoAngle = Math.atan2(y - centerY, x - centerX);
              const tornadoRadius = distance / maxDistance;
              const tornadoSpeed = time * 0.002 * speed;
              const tornadoSpiral = tornadoSpeed * (1 + tornadoRadius * 3);
              animationFactor = 0.2 + 0.8 * Math.abs(Math.sin(tornadoSpiral));
              const tornadoPower = Math.sin(tornadoSpeed) * tornadoRadius * 10;
              posOffsetX = Math.cos(tornadoAngle + tornadoSpiral) * tornadoPower;
              posOffsetY = Math.sin(tornadoAngle + tornadoSpiral) * tornadoPower;
              break;
              
            case 'gravity':
              const gravityCenter = distance / maxDistance;
              const gravityPull = Math.sin(time * 0.001 * speed) * (1 - gravityCenter);
              animationFactor = 0.3 + 0.7 * (1 - gravityCenter);
              const gravityAngle = Math.atan2(y - centerY, x - centerX);
              posOffsetX = Math.cos(gravityAngle) * gravityPull * 15;
              posOffsetY = Math.sin(gravityAngle) * gravityPull * 15;
              break;
              
            case 'magnetic':
              const magneticField = Math.sin(time * 0.003 * speed + x * 0.02) * Math.cos(time * 0.003 * speed + y * 0.02);
              animationFactor = 0.4 + 0.6 * Math.abs(magneticField);
              const magneticForce = magneticField * 6;
              posOffsetX = Math.sin(x * 0.05 + time * 0.002 * speed) * magneticForce;
              posOffsetY = Math.cos(y * 0.05 + time * 0.002 * speed) * magneticForce;
              break;
              
            case 'explosion':
              const explosionPhase = (Math.sin(time * 0.002 * speed) + 1) / 2;
              const explosionRadius = distance / maxDistance;
              animationFactor = explosionPhase * (1 - explosionRadius * 0.5);
              const explosionForce = explosionPhase * explosionRadius * 12;
              const explosionAngle = Math.atan2(y - centerY, x - centerX);
              posOffsetX = Math.cos(explosionAngle) * explosionForce;
              posOffsetY = Math.sin(explosionAngle) * explosionForce;
              break;
              
            case 'galaxy':
              const galaxyAngle = Math.atan2(y - centerY, x - centerX);
              const galaxyRadius = distance / maxDistance;
              const galaxyRotation = time * 0.0005 * speed * (1 + galaxyRadius * 2);
              const galaxyArm = Math.sin(galaxyAngle * 3 + galaxyRotation) * galaxyRadius;
              animationFactor = 0.3 + 0.7 * Math.abs(galaxyArm);
              posOffsetX = Math.cos(galaxyAngle + galaxyRotation) * galaxyArm * 8;
              posOffsetY = Math.sin(galaxyAngle + galaxyRotation) * galaxyArm * 8;
              break;
              
            case 'hypnotic':
              const hypnoticRings = Math.sin(distance * 0.02 - time * 0.004 * speed);
              const hypnoticRotation = time * 0.001 * speed;
              animationFactor = 0.3 + 0.7 * Math.abs(hypnoticRings);
              const hypnoticRadius = hypnoticRings * 4;
              const hypnoticAngle = Math.atan2(y - centerY, x - centerX) + hypnoticRotation;
              posOffsetX = Math.cos(hypnoticAngle) * hypnoticRadius;
              posOffsetY = Math.sin(hypnoticAngle) * hypnoticRadius;
              break;

            // NEW MIND-BENDING EFFECTS
            case 'cosmic_hurricane':
              const hurricaneAngle = Math.atan2(y - centerY, x - centerX);
              const hurricaneRadius = distance / maxDistance;
              const hurricaneSpeed = time * 0.003 * speed;
              const hurricaneSpiral = hurricaneAngle * 4 + hurricaneRadius * 8 + hurricaneSpeed;
              const hurricaneIntensity = Math.sin(hurricaneSpiral) * (1 - hurricaneRadius * 0.3);
              animationFactor = 0.2 + 0.8 * Math.abs(hurricaneIntensity);
              const hurricaneForce = hurricaneIntensity * hurricaneRadius * 15;
              posOffsetX = Math.cos(hurricaneAngle + hurricaneSpeed * 2) * hurricaneForce;
              posOffsetY = Math.sin(hurricaneAngle + hurricaneSpeed * 2) * hurricaneForce;
              break;

            case 'quantum_entanglement':
              const quantumPhase = time * 0.004 * speed;
              const quantumField1 = Math.sin(x * 0.02 + quantumPhase);
              const quantumField2 = Math.cos(y * 0.02 + quantumPhase * 1.5);
              const quantumField3 = Math.sin(distance * 0.01 + quantumPhase * 0.7);
              const quantumCorrelation = quantumField1 * quantumField2 * quantumField3;
              animationFactor = 0.4 + 0.6 * Math.abs(quantumCorrelation);
              const quantumTeleport = quantumCorrelation * 8;
              posOffsetX = Math.sin(quantumPhase + x * 0.01) * quantumTeleport;
              posOffsetY = Math.cos(quantumPhase + y * 0.01) * quantumTeleport;
              break;

            case 'dark_energy':
              const darkPhase = time * 0.002 * speed;
              const darkRadius = distance / maxDistance;
              const darkExpansion = Math.sin(darkPhase) * (1 - darkRadius);
              const darkField = Math.cos(darkPhase + darkRadius * Math.PI * 2) * darkExpansion;
              animationFactor = 0.1 + 0.9 * (0.5 + 0.5 * darkField);
              const darkForce = darkField * darkRadius * 10;
              const darkAngle = Math.atan2(y - centerY, x - centerX);
              posOffsetX = Math.cos(darkAngle + darkPhase) * darkForce;
              posOffsetY = Math.sin(darkAngle + darkPhase) * darkForce;
              break;

            case 'multiverse_collapse':
              const collapsePhase = time * 0.003 * speed;
              const layer1 = Math.sin(x * 0.02 + collapsePhase);
              const layer2 = Math.cos(y * 0.02 + collapsePhase * 1.3);
              const layer3 = Math.sin(distance * 0.015 + collapsePhase * 0.8);
              const convergence = (layer1 + layer2 + layer3) / 3;
              const collapseIntensity = Math.abs(Math.sin(collapsePhase * 0.5));
              animationFactor = 0.3 + 0.7 * Math.abs(convergence) * collapseIntensity;
              const collapseForce = convergence * collapseIntensity * 8;
              posOffsetX = layer1 * collapseForce + Math.sin(collapsePhase) * 3;
              posOffsetY = layer2 * collapseForce + Math.cos(collapsePhase) * 3;
              break;
              
            default: // fallback
              animationFactor = 1;
          }
        }

        // Morphing
        let morphFactor = 1;
        if (morphing) {
          morphFactor = 0.3 + 0.7 * Math.sin(time * 0.001 + x * 0.01 + y * 0.01);
        }

        const intensity_factor = Math.max(0.3, intensity * 0.01); // Ensure minimum visibility
        const radius_factor = Math.max(0.2, 1 - (distance / maxDistance) * intensity_factor);
        const finalRadius = dotSize * radius_factor * animationFactor * mouseInfluence * morphFactor;
        
        const finalX = x + posOffsetX;
        const finalY = y + posOffsetY;

        // Ensure minimum size for visible patterns
        const minRadius = Math.max(1.5, finalRadius);
        
        if (minRadius > 0.8) {
          ctx.fillStyle = getColor(finalX, finalY, distance);
          drawShape(ctx, finalX, finalY, minRadius, dotShape);
        }
      }
    }
  }, [density, size, intensity, speed, colorMode, foregroundColor, gradientColor, isAnimated, mouseInteractive, morphing, dimensions, dotShape, animationEffect]);

  const drawWaves = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    const waveHeight = size;
    const frequency = density * 0.01;
    const speedFactor = speed * 0.001;

    for (let x = 0; x < canvasWidth; x += 2) {
      const baseY = canvasHeight / 2;
      const waveY = baseY + Math.sin((x * frequency) + (time * speedFactor)) * waveHeight;
      
      let mouseInfluence = 0;
      if (mouseInteractive) {
        const mouseDist = Math.abs(x - mouseRef.current.x);
        mouseInfluence = Math.max(0, (100 - mouseDist) / 100) * 50;
      }

      const finalY = waveY + mouseInfluence;
      const distance = Math.abs(finalY - canvasHeight / 2);
      
      ctx.fillStyle = getColor(x, finalY, distance);
      ctx.fillRect(x, Math.min(baseY, finalY), 2, Math.abs(finalY - baseY) + 1);
    }
  }, [density, size, speed, mouseInteractive, colorMode, foregroundColor, gradientColor, dimensions]);

  const drawSpiral = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.min(canvasWidth, canvasHeight) / 2;
    const spiralTightness = density * 0.1;
    const dotSize = Math.max(1, size * 0.3);

    for (let angle = 0; angle < Math.PI * 20; angle += 0.1) {
      const radius = (angle / (Math.PI * 20)) * maxRadius;
      const x = centerX + Math.cos(angle + time * speed * 0.001) * radius;
      const y = centerY + Math.sin(angle + time * speed * 0.001) * radius;

      if (x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight) {
        let finalDotSize = dotSize;
        
        if (mouseInteractive) {
          const mouseDist = Math.sqrt((x - mouseRef.current.x) ** 2 + (y - mouseRef.current.y) ** 2);
          finalDotSize *= 1 + Math.max(0, (80 - mouseDist) / 80) * 2;
        }

        const intensity_factor = (intensity * 0.01) * (1 - radius / maxRadius);
        finalDotSize *= intensity_factor;

        if (finalDotSize > 0.5) {
          ctx.fillStyle = getColor(x, y, radius);
          ctx.beginPath();
          ctx.arc(x, y, finalDotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [density, size, intensity, speed, mouseInteractive, colorMode, foregroundColor, gradientColor, dimensions]);

  const drawNoise = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    const pixelSize = Math.max(2, 8 - density * 0.1);
    const noiseScale = size * 0.01;
    const timeOffset = time * speed * 0.0001;

    for (let x = 0; x < canvasWidth; x += pixelSize) {
      for (let y = 0; y < canvasHeight; y += pixelSize) {
        // Simple noise function
        const noiseValue = Math.sin(x * noiseScale + timeOffset) * Math.cos(y * noiseScale + timeOffset);
        const threshold = (intensity - 50) * 0.02;
        
        if (noiseValue > threshold) {
          let alpha = (noiseValue - threshold) * 2;
          
          if (mouseInteractive) {
            const mouseDist = Math.sqrt((x - mouseRef.current.x) ** 2 + (y - mouseRef.current.y) ** 2);
            alpha *= 1 + Math.max(0, (100 - mouseDist) / 100);
          }

          const distance = Math.sqrt(x ** 2 + y ** 2);
          ctx.fillStyle = getColor(x, y, distance);
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.fillRect(x, y, pixelSize, pixelSize);
          ctx.globalAlpha = 1;
        }
      }
    }
  }, [density, size, intensity, speed, mouseInteractive, colorMode, foregroundColor, gradientColor, dimensions]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    const gridSize = Math.max(10, 80 - density);
    const lineWidth = Math.max(1, size * 0.1);
    const timeOffset = time * speed * 0.001;

    ctx.lineWidth = lineWidth;
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      const wave = Math.sin(x * 0.01 + timeOffset) * (intensity * 0.2);
      
      let opacity = 1;
      if (mouseInteractive) {
        const mouseDist = Math.abs(x - mouseRef.current.x);
        opacity = 0.3 + Math.max(0, (100 - mouseDist) / 100) * 0.7;
      }

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = getColor(x, 0, x);
      ctx.beginPath();
      ctx.moveTo(x + wave, 0);
      ctx.lineTo(x + wave, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      const wave = Math.cos(y * 0.01 + timeOffset) * (intensity * 0.2);
      
      let opacity = 1;
      if (mouseInteractive) {
        const mouseDist = Math.abs(y - mouseRef.current.y);
        opacity = 0.3 + Math.max(0, (100 - mouseDist) / 100) * 0.7;
      }

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = getColor(0, y, y);
      ctx.beginPath();
      ctx.moveTo(0, y + wave);
      ctx.lineTo(canvasWidth, y + wave);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }, [density, size, intensity, speed, mouseInteractive, colorMode, foregroundColor, gradientColor, dimensions]);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use device pixel ratio for crisp rendering
    const devicePixelRatio = window.devicePixelRatio || 1;
    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;
    
    // Set actual canvas size in memory (scaled for device pixel ratio)
    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;
    
    // Scale CSS size back to display size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Enable anti-aliasing and smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw pattern using display dimensions (context is already scaled)
    const time = timeRef.current;
    
    switch (patternType) {
      case 'dots':
        drawDots(ctx, time);
        break;
      case 'waves':
        drawWaves(ctx, time);
        break;
      case 'spiral':
        drawSpiral(ctx, time);
        break;
      case 'noise':
        drawNoise(ctx, time);
        break;
      case 'grid':
        drawGrid(ctx, time);
        break;
    }

    if (isAnimated) {
      timeRef.current += 16; // ~60fps
      animationRef.current = requestAnimationFrame(render);
    }
  }, [
    patternType, backgroundColor, dimensions, 
    drawDots, drawWaves, drawSpiral, drawNoise, drawGrid, isAnimated
  ]);

  // Start/stop animation
  useEffect(() => {
    if (isAnimated) {
      animationRef.current = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationRef.current);
      render(); // Render once for static
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isAnimated, render]);

  // Render when parameters change
  useEffect(() => {
    if (!isAnimated) {
      render();
    }
  }, [render, isAnimated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        imageRendering: 'auto',
        touchAction: 'manipulation',
        display: 'block',
        margin: 0,
        padding: 0,
        border: 'none',
        outline: 'none'
      }}
    />
  );
}
