import Image from "next/image";
import { getBannerAssets } from "@/lib/asset-api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export async function HomeCarousel() {
  const banners = await getBannerAssets();

  console.log("banners", banners);


  if (!banners || banners.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Banners Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            There are currently no banners to display.
          </p>
        </div>
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
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="relative h-[500px] w-full object-cover">
              <Image
                src={banner.url}
                alt={banner.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
    </Carousel>
  );
}