import CategoryGallery from "@/components/CategoryGallery";
import { LANDSCAPE_IMAGES } from "@/lib/photoData";

export default function LandscapePage() {
  return (
    <CategoryGallery images={LANDSCAPE_IMAGES} currentCategory="Landscape" />
  );
}
