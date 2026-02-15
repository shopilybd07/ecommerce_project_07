 "use client";
 
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGetAssetsQuery } from "@/store/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
 
 export function HomeCarousel() {
   const { data: banners = [], isLoading } = useGetAssetsQuery();
   const [api, setApi] = useState<CarouselApi | null>(null);
   const [selectedIndex, setSelectedIndex] = useState(0);
  const [device, setDevice] = useState<"MOBILE" | "TABLET" | "DESKTOP">(
    "DESKTOP"
  );

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDevice("MOBILE");
        return;
      }
      if (width < 1024) {
        setDevice("TABLET");
        return;
      }
      setDevice("DESKTOP");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);
 
   useEffect(() => {
     if (!api) return;
     const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
     api.on("select", onSelect);
     onSelect();
     return () => {
       api.off("select", onSelect);
     };
   }, [api]);
 
   useEffect(() => {
     if (!api) return;
     const interval = setInterval(() => {
       api.scrollNext();
     }, 10000);
     return () => clearInterval(interval);
   }, [api]);
 
   if (isLoading) {
     return (
      <div className="w-full">
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="flex items-center justify-center gap-2 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-2 w-2 rounded-full" />
          ))}
        </div>
      </div>
     );
   }
 
  const filteredBanners = banners.filter(
    (banner: any) => banner.device === device
  );

  if (!filteredBanners || filteredBanners.length === 0) {
     return (
       <div className="w-full h-[450px] bg-gray-100">
       </div>
     );
   }
 
   return (
     <Carousel
       className="w-full"
       opts={{
         loop: true,
       }}
       setApi={setApi}
     >
       <CarouselContent>
        {filteredBanners.map((banner: any) => (
           <CarouselItem key={banner.id}>
             <div className="relative h-[450px] w-full object-cover">
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
      <CarouselPrevious className="left-4 bg-white/80 hover:bg-white" />
      <CarouselNext className="right-4 bg-white/80 hover:bg-white" />
       <div className="flex items-center justify-center gap-2 py-4">
        {filteredBanners.map((_: any, idx: number) => (
           <button
             key={idx}
             aria-label={`Go to slide ${idx + 1}`}
             onClick={() => api?.scrollTo(idx)}
             className={`h-2 w-2 rounded-full transition-colors ${selectedIndex === idx ? "bg-purple-600" : "bg-gray-300"}`}
           />
         ))}
       </div>
     </Carousel>
   );
 }
