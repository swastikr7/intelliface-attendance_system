import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import AboutSection from "../components/landing/AboutSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Hero */}
        <HeroSection />

        {/* Social proof / stats */}
        <StatsSection />

        {/* Core features */}
        <FeaturesSection />

        {/* Workflow explanation */}
        <HowItWorksSection />

        {/* About section (IMPORTANT for navbar scroll) */}
        <AboutSection />

        {/* Final call to action */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
