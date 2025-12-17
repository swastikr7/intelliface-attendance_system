import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-glow mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Attendance Platform
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Face Recognition
            <br />
            <span className="text-gradient">Attendance System</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            A smart, secure and automated attendance solution for colleges.
            No proxies. No manual work. Just accuracy.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            {/* Primary */}
            <Button
              size="lg"
              className="glow-primary group px-8"
              onClick={() => navigate("/signup")}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Secondary */}
            <Button
              variant="outline"
              size="lg"
              className="border-glow px-8 backdrop-blur-xl"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>

          {/* Demo Stats Card (kept – looks premium) */}
          <div
            className="glass rounded-2xl p-6 md:p-8 max-w-xl mx-auto border-glow opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">
                Live Classroom Demo
              </span>
            </div>

            <h3 className="text-lg font-medium mb-1">
              CS-101 • Data Structures
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Prof. Smith • Room 204
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">29</span>
                </div>
                <span className="text-xs text-muted-foreground">Present</span>
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold text-muted-foreground">3</span>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">91%</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Attendance
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
