import CategoryGallery from "@/components/CategoryGallery";

const images = [
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
  { src: "/photos/landscape/_DSC0625.PNG", alt: "DSC0625" },
];

export default function LandscapePage() {
  return <CategoryGallery images={images} currentCategory="Landscape"/>;
}
