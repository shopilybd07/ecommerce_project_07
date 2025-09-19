import Image from "next/image";
import { getBannerAssets } from "@/lib/asset-api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export async function HeroCarousel() {
  const bannerAssets = await getBannerAssets();

  if (bannerAssets.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-8">
        <Image
          src={"/placeholder.svg"}
          alt="Placeholder"
          width={500}
          height={500}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {bannerAssets.map((asset) => (
          <CarouselItem key={asset.id}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-8">
              <Image
                src={asset.url}
                alt={asset.name}
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
