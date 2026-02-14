export type ImageItem = {
  src: string;
  alt: string;
};

export type FeaturedPhoto = {
  title: string;
  src: string;
  featured: boolean;
};

export type AlbumItem = {
  title: string;
  src: string;
  category: string;
};


export const FEATURED_PHOTOS: FeaturedPhoto[] = [
  {
    title: "Brooklyn Bridge",
    src: "/photos/Bridge.png",
    featured: true
  },
  {
    title: "Monarch Butterfly",
    src: "/photos/Butterfly.png",
    featured: true
  },
  {
    title: "Dreamy Subway Station",
    src: "/photos/Dreamy_Subway.PNG",
    featured: true
  },
  {
    title: "Big Sur Waves",
    src: "/photos/Big_Sur.JPEG",
    featured: true
  },
  {
    title: "Wilhelmina Windmill",
    src: "/photos/Windmill.png",
    featured: true
  }
];

export const LANDSCAPE_IMAGES: ImageItem[] = [
  { src: "/photos/landscape/Golden_Gate.JPG", alt: "Golden Gate" },
  { src: "/photos/landscape/Crater_Rim.JPG", alt: "Crater Rim" },
  { src: "/photos/landscape/Ocean_Swimmer.JPG", alt: "Ocean Swimmer" },
  { src: "/photos/landscape/Evening_Angler.JPG", alt: "Evening Angler" },
  { src: "/photos/landscape/Palace_Corner.JPG", alt: "Palace Corner" },
  { src: "/photos/landscape/Palace_Fine_Arts.JPG", alt: "Palace Fine Arts" },
  { src: "/photos/landscape/Temple.PNG", alt: "Temple" },
  { src: "/photos/landscape/Temple_Figures.PNG", alt: "Temple Figures" },
  { src: "/photos/landscape/Temple_Tower.PNG", alt: "Temple Tower" },
  { src: "/photos/landscape/Temple_Facade.PNG", alt: "Temple Facade" },
  { src: "/photos/landscape/Framed_Archway.jpg", alt: "Framed Archway" },
  { src: "/photos/landscape/Stone_Colonnade.PNG", alt: "Stone Colonnade" },
  { src: "/photos/landscape/Carved_Steps.PNG", alt: "Carved Steps" },
  { src: "/photos/landscape/Courtyard_Columns.PNG", alt: "Courtyard Columns" },
  { src: "/photos/landscape/Hazy_Memorial.PNG", alt: "Hazy Memorial" }
];

export const NATURE_IMAGES: ImageItem[] = [
  { src: "/photos/nature/Cloud_Hiker.JPG", alt: "Cloud Hiker" },
  { src: "/photos/nature/Cloud_Runners.JPG", alt: "Cloud Runners" },
  { src: "/photos/nature/Cloud_Sunset.JPG", alt: "Cloud Sunset" },
  { src: "/photos/nature/Dawn_Clouds.JPG", alt: "Dawn Clouds" },
  { src: "/photos/nature/Single_Surfer.JPG", alt: "Single Surfer" },
  { src: "/photos/nature/Coastal_Ridges.JPG", alt: "Coastal Ridges" },
  { src: "/photos/nature/SF_Bird.jpg", alt: "SF Bird" },
  { src: "/photos/nature/SF_Swimmer.JPG", alt: "SF Swimmer" },
  { src: "/photos/nature/Lone_Surfer.JPEG", alt: "Lone Surfer" },
  { src: "/photos/nature/Empty_Shoreline.JPEG", alt: "Empty Shoreline" },
  { src: "/photos/nature/Coastal_Rocks.JPEG", alt: "Coastal Rocks" },
  { src: "/photos/nature/Cliffside_Sea_Lion.JPEG", alt: "Cliffside Sea Lion" },
  { src: "/photos/nature/Tidal_Sands.JPEG", alt: "Tidal Sands" },
  { src: "/photos/nature/Rocky_Shore.JPEG", alt: "Rocky Shore" },
  { src: "/photos/nature/Crashing_Surf.JPEG", alt: "Crashing Surf" },
  { src: "/photos/nature/Seabird_Flight.JPEG", alt: "Seabird Flight" },
  { src: "/photos/nature/Sea_Cave.JPEG", alt: "Sea Cave" },
  { src: "/photos/nature/Dry_Grass.JPEG", alt: "Dry Grass" },
  { src: "/photos/nature/Turquoise_Cove.JPEG", alt: "Turquoise Cove" }
];

export const STREET_IMAGES: ImageItem[] = [
  { src: "/photos/street/Phone_Booth.JPG", alt: "Phone Booth" },
  { src: "/photos/street/SF_House.PNG", alt: "SF House" },
  { src: "/photos/street/Hanging_Cables.PNG", alt: "Hanging Cables" },
  { src: "/photos/street/Seaside_Fort.PNG", alt: "Seaside Fort" },
  { src: "/photos/street/Colorful_Boats.PNG", alt: "Colorful Boats" },
  { src: "/photos/street/Subway_Ceiling.JPG", alt: "Subway Ceiling" },
  { src: "/photos/street/Graffiti_Wall.JPG", alt: "Graffiti Wall" },
  { src: "/photos/street/Hanging_Sign.JPG", alt: "Hanging Sign" },
  { src: "/photos/street/Sun_Flare.JPG", alt: "Sun Flare" },
  { src: "/photos/street/City_Dome.jpg", alt: "City Dome" },
  { src: "/photos/street/Flagged_Bench.JPG", alt: "Flagged Bench" },
  { src: "/photos/street/Bay_Windows.jpg", alt: "Bay Windows" },
  { src: "/photos/street/Angled_Buildings.JPG", alt: "Angled Buildings" },
  { src: "/photos/street/Victorian_Facade.JPG", alt: "Victorian Facade" },
  { src: "/photos/street/Painted_Ladies.JPG", alt: "Painted Ladies" },
  { src: "/photos/street/Parked_Bus.JPG", alt: "Parked Bus" },
  { src: "/photos/street/Painted_Rock.JPG", alt: "Painted Rock" },
  { src: "/photos/street/Rooftop_Birds.JPG", alt: "Rooftop Birds" }
];

export const ALL_ALBUMS: AlbumItem[] = [
  ...LANDSCAPE_IMAGES.map((photo) => ({
    title: photo.alt,
    src: photo.src,
    category: "Landscape"
  })),
  ...NATURE_IMAGES.map((photo) => ({
    title: photo.alt,
    src: photo.src,
    category: "Nature"
  })),
  ...STREET_IMAGES.map((photo) => ({
    title: photo.alt,
    src: photo.src,
    category: "Street"
  }))
];
