import AutoFoodCarousel from "@/components/home/AutoFoodCarousel";
import Hero from "@/components/home/Hero";

export default async function Home() {
  return (
    <main className="">
      <Hero />
      <AutoFoodCarousel />
    </main>
  );
}
