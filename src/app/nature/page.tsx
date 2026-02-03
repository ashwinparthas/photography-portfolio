import CategoryGallery from "@/components/CategoryGallery";
import { NATURE_IMAGES } from "@/lib/photoData";

export default function NaturePage() {
  return <CategoryGallery images={NATURE_IMAGES} currentCategory="Nature" />;
}
