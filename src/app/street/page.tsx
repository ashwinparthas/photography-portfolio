import CategoryGallery from "@/components/CategoryGallery";
import { STREET_IMAGES } from "@/lib/photoData";

export default function StreetPage() {
  return <CategoryGallery images={STREET_IMAGES} currentCategory="Street" />;
}
