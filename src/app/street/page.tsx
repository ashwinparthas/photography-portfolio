import CategoryGallery from "@/components/CategoryGallery";

const images = [
  { src: "/photos/street/Phone_Booth.JPG", alt: "Phone Booth" },
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
  { src: "/photos/street/_DSC1117.JPG", alt: "DSC1117" },
];

export default function StreetPage() {
  return <CategoryGallery images={images} currentCategory="Street" />;
}
