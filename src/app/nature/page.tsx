import CategoryGallery from "@/components/CategoryGallery";

const images = [
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
  { src: "/photos/nature/_DSC0824.JPEG", alt: "DSC0824" },
];

export default function NaturePage() {
  return <CategoryGallery images={images} currentCategory="Nature" />;
}
