import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Investment from "@/components/sections/Investment";
import Connect from "@/components/sections/Connect";

export default function Home() {
  return (
    <main className="bg-canvas text-white">
      <Header />
      <Hero />
      <Services />
      <Investment />
      <Connect />
    </main>
  );
}
