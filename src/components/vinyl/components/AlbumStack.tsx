import { useState, useEffect, type MouseEvent } from "react";
import { motion } from "motion/react";

interface AlbumStackProps {
  currentAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  isMobile?: boolean;
}

export function AlbumStack({ currentAlbumId, onAlbumChange, isMobile = false }: AlbumStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [topAlbumId, setTopAlbumId] = useState(currentAlbumId);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with external album changes (e.g., from other components)
  useEffect(() => {
    if (currentAlbumId !== topAlbumId && !isAnimating) {
      setTopAlbumId(currentAlbumId);
    }
  }, [currentAlbumId, topAlbumId, isAnimating]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAlbumClick = (albumId: string, event: MouseEvent) => {
    event.stopPropagation(); // Prevent container click
    
    // If clicking the same album that's already on top, just collapse
    if (albumId === topAlbumId) {
      setIsExpanded(false);
      return;
    }
    
    // Update the current album in the parent component (changes the music)
    onAlbumChange(albumId);
    
    // Set the selected album for smooth front animation
    setSelectedAlbumId(albumId);
    setIsAnimating(true);
    
    // Give time for the selected album to animate to front smoothly
    setTimeout(() => {
      setIsExpanded(false);
      
      // After collapse completes, reorder the stack
      setTimeout(() => {
        setTopAlbumId(albumId);
        setSelectedAlbumId(null);
        setIsAnimating(false);
      }, 800); // Wait for collapse animation to complete
    }, 300); // Increased delay to allow for smooth selection animation
  };

  const smoothTransition = {
    duration: 0.8,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number] // Smooth easing for all transitions
  };

  const baseAlbums = [
    {
      id: "gravity",
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/30/1b/30/301b30ef-9bb5-8fbd-6bdc-30552aefd0c6/8DrDvnuaSqqztj1vOGwY_Wasteland-Final6.jpg/600x600bb.jpg",
      name: "WASTELAND",
      defaultRotation: 3.4
    },
    {
      id: "vivid_dreams", 
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/03/bc/17/03bc17d6-c072-b62e-f41f-0d1adc311338/634904076566.png/600x600bb.jpg",
      name: "99.9%",
      defaultRotation: 8.14
    },
    {
      id: "hereditary",
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/61/51/72/61517260-a1b5-f741-3432-988777ee212d/16UMGIM88340.rgb.jpg/600x600bb.jpg", 
      name: "The Never Story",
      defaultRotation: 2.33
    },
    {
      id: "being_so_normal",
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c1/d4/3d/c1d43d94-2c88-d796-6c62-5efa41cfcc74/886447136270.jpg/600x600bb.jpg",
      name: "Being So Normal", 
      defaultRotation: -2.77
    },
    {
      id: "fallen",
      image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ce/36/1b/ce361b69-a148-1626-0302-2018fa475b52/06UMGIM09838.rgb.jpg/600x600bb.jpg",
      name: "Moodring",
      defaultRotation: -6.16
    }
  ];

  // Get albums with proper ordering and positioning
  const getOrderedAlbums = () => {
    const rotations = [-6.16, -2.77, 2.33, 8.14, 3.4]; // Top to bottom rotations
    const expandedPositions = isMobile 
      ? [{ x: -120, y: 0 }, { x: -60, y: 0 }, { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 120, y: 0 }] // Tighter horizontal positions for mobile
      : [{ x: 0, y: -200 }, { x: 0, y: -100 }, { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 0, y: 200 }]; // Vertical positions for desktop
    
    let orderedIds;
    
    // When expanded or animating, keep original order to prevent jumping
    if (isExpanded || isAnimating) {
      orderedIds = baseAlbums.map(a => a.id);
    } else {
      // Only reorder in the collapsed state
      const topAlbum = baseAlbums.find(album => album.id === topAlbumId);
      const otherAlbums = baseAlbums.filter(album => album.id !== topAlbumId);
      orderedIds = [topAlbum!.id, ...otherAlbums.map(a => a.id)];
    }
    
    return orderedIds.map((id, index) => {
      const album = baseAlbums.find(a => a.id === id)!;
      const baseZIndex = 50 - (index * 10); // 50, 40, 30, 20, 10
      // Boost z-index for selected album during animation
      const finalZIndex = selectedAlbumId === id ? 100 : baseZIndex;
      
      return {
        ...album,
        stackedPosition: { x: 0, y: 0, rotate: rotations[index] },
        expandedPosition: { x: expandedPositions[index].x, y: expandedPositions[index].y, rotate: 0 },
        zIndex: finalZIndex
      };
    });
  };

  const albums = getOrderedAlbums();

  // Responsive sizing
  const albumSize = isMobile ? 140 : 232;
  const containerWidth = isMobile ? 170 : 280;
  const containerHeight = isMobile ? 170 : 280;
  const expandedWidth = isMobile ? 380 : 280; // Reduced width for better mobile fit
  const expandedHeight = isMobile ? 170 : 600; // Keep same height for mobile horizontal

  return (
    <div className="relative cursor-pointer" data-name="Album_Selected" onClick={handleClick}>
      <motion.div
        className="relative flex items-center justify-center overflow-visible"
        animate={{
          width: isExpanded ? `${expandedWidth}px` : `${containerWidth}px`,
          height: isExpanded ? `${expandedHeight}px` : `${containerHeight}px`
        }}
        transition={smoothTransition}
      >
        {albums.map((album) => (
          <motion.div
            key={album.id}
            className="absolute flex items-center justify-center"
            style={{
              width: `${albumSize}px`,
              height: `${albumSize}px`,
              zIndex: album.zIndex,
              cursor: isExpanded ? "pointer" : "inherit"
            }}
            animate={{
              x: isExpanded ? album.expandedPosition.x : album.stackedPosition.x,
              y: isExpanded ? album.expandedPosition.y : album.stackedPosition.y,
              rotate: isExpanded ? album.expandedPosition.rotate : album.stackedPosition.rotate,
              scale: selectedAlbumId === album.id ? 1.05 : 1, // Smooth scale animation for selected album
            }}
            transition={{
              ...smoothTransition,
              // Faster, smoother transition for scale changes
              scale: {
                type: "spring",
                stiffness: 350,
                damping: 25,
                mass: 0.6,
              }
            }}
            onClick={isExpanded ? (e) => handleAlbumClick(album.id, e) : undefined}
          >
            <motion.div 
              className="bg-center bg-cover bg-no-repeat" 
              data-name={album.name}
              style={{ 
                backgroundImage: `url('${album.image}')`,
                width: `${albumSize}px`,
                height: `${albumSize}px`
              }}
              animate={{
                boxShadow: selectedAlbumId === album.id 
                  ? "0px 8px 32px 0px rgba(0,0,0,0.4)" 
                  : "0px 2px 24px 0px rgba(0,0,0,0.25)"
              }}
              transition={{
                boxShadow: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.6,
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
