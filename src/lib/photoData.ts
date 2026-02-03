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
  { src: "/photos/landscape/IMG_6490.JPG", alt: "IMG 6490" },
  { src: "/photos/landscape/IMG_6494.JPG", alt: "IMG 6494" },
  { src: "/photos/landscape/IMG_6507.JPG", alt: "IMG 6507" },
  { src: "/photos/landscape/Palace_Corner.JPG", alt: "Palace Corner" },
  { src: "/photos/landscape/Palace_Fine_Arts.JPG", alt: "Palace Fine Arts" },
  { src: "/photos/landscape/Temple.PNG", alt: "Temple" },
  { src: "/photos/landscape/_DSC0343.PNG", alt: "DSC0343" },
  { src: "/photos/landscape/_DSC0353.PNG", alt: "DSC0353" },
  { src: "/photos/landscape/_DSC0375.PNG", alt: "DSC0375" },
  { src: "/photos/landscape/_DSC0400.jpg", alt: "DSC0400" },
  { src: "/photos/landscape/_DSC0406.PNG", alt: "DSC0406" },
  { src: "/photos/landscape/_DSC0432.PNG", alt: "DSC0432" },
  { src: "/photos/landscape/_DSC0433.PNG", alt: "DSC0433" },
  { src: "/photos/landscape/_DSC0625.PNG", alt: "DSC0625" }
];

export const NATURE_IMAGES: ImageItem[] = [
  { src: "/photos/nature/IMG_6486.JPG", alt: "IMG 6486" },
  { src: "/photos/nature/IMG_6487.JPG", alt: "IMG 6487" },
  { src: "/photos/nature/IMG_6488.JPG", alt: "IMG 6488" },
  { src: "/photos/nature/IMG_6491.JPG", alt: "IMG 6491" },
  { src: "/photos/nature/IMG_6492.JPG", alt: "IMG 6492" },
  { src: "/photos/nature/IMG_6493.JPG", alt: "IMG 6493" },
  { src: "/photos/nature/SF_Bird.jpg", alt: "SF Bird" },
  { src: "/photos/nature/SF_Swimmer.JPG", alt: "SF Swimmer" },
  { src: "/photos/nature/_DSC0450.JPEG", alt: "DSC0450" },
  { src: "/photos/nature/_DSC0473.JPEG", alt: "DSC0473" },
  { src: "/photos/nature/_DSC0535.JPEG", alt: "DSC0535" },
  { src: "/photos/nature/_DSC0543.JPEG", alt: "DSC0543" },
  { src: "/photos/nature/_DSC0550.JPEG", alt: "DSC0550" },
  { src: "/photos/nature/_DSC0609.JPEG", alt: "DSC0609" },
  { src: "/photos/nature/_DSC0631.JPEG", alt: "DSC0631" },
  { src: "/photos/nature/_DSC0638.JPEG", alt: "DSC0638" },
  { src: "/photos/nature/_DSC0651.JPEG", alt: "DSC0651" },
  { src: "/photos/nature/_DSC0737.JPEG", alt: "DSC0737" },
  { src: "/photos/nature/_DSC0824.JPEG", alt: "DSC0824" }
];

export const STREET_IMAGES: ImageItem[] = [
  { src: "/photos/street/Phone_Booth.JPG", alt: "Phone Booth" },
  { src: "/photos/street/SF_House.PNG", alt: "SF House" },
  { src: "/photos/street/_DSC0354.PNG", alt: "DSC0354" },
  { src: "/photos/street/_DSC0502.PNG", alt: "DSC0502" },
  { src: "/photos/street/_DSC0514.PNG", alt: "DSC0514" },
  { src: "/photos/street/_DSC0929.JPG", alt: "DSC0929" },
  { src: "/photos/street/_DSC0964.JPG", alt: "DSC0964" },
  { src: "/photos/street/_DSC0974.JPG", alt: "DSC0974" },
  { src: "/photos/street/_DSC0977.JPG", alt: "DSC0977" },
  { src: "/photos/street/_DSC1026.jpg", alt: "DSC1026" },
  { src: "/photos/street/_DSC1029.JPG", alt: "DSC1029" },
  { src: "/photos/street/_DSC1059.jpg", alt: "DSC1059" },
  { src: "/photos/street/_DSC1060.JPG", alt: "DSC1060" },
  { src: "/photos/street/_DSC1068.JPG", alt: "DSC1068" },
  { src: "/photos/street/_DSC1081.JPG", alt: "DSC1081" },
  { src: "/photos/street/_DSC1084.JPG", alt: "DSC1084" },
  { src: "/photos/street/_DSC1107.JPG", alt: "DSC1107" },
  { src: "/photos/street/_DSC1117.JPG", alt: "DSC1117" }
];

export const ALL_ALBUMS: AlbumItem[] = [
  ...FEATURED_PHOTOS.map((photo) => ({
    title: photo.title,
    src: photo.src,
    category: "Featured"
  })),
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
