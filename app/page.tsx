import Hero from "@/components/Hero";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Navigation from "@/components/Navigation";
import Background from "@/components/Background";

export default function Home() {
  return (
    <main className="relative">
      <Background />
      <Navigation />
      <Hero />
      <About />
      <Contact />
    </main>
  );
}
