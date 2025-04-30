import Header from "@/components/Header";
import HeroNew from "@/components/HeroNew";
import MatchStats from "@/components/MatchStats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroNew />
        <MatchStats />
      </main>
      <Footer />
    </div>
  );
}
