import { ArrowRight, Sparkles, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-glow mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Attendance Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Face Recognition
            <br />
            <span className="text-gradient">Attendance System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            A smart, secure and automated attendance solution for colleges.
            No proxies. No manual work. Just accuracy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            {/* Primary */}
            <button
              onClick={() => navigate("/signup")}
              className="group inline-flex items-center justify-center rounded-xl
                         bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground
                         shadow-lg shadow-primary/30
                         transition-all duration-300
                         hover:scale-[1.05]
                         hover:shadow-primary/60"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Secondary */}
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded-xl
                         border border-border bg-card/50 px-8 py-4 text-sm font-medium
                         backdrop-blur-xl transition-all duration-300
                         hover:bg-card hover:scale-[1.05]"
            >
              Login
            </button>
          </div>

          {/* Demo Card */}
          <div className="glass rounded-2xl p-6 md:p-8 max-w-xl mx-auto border-glow">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold">29</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">3</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>

              <div className="text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold">91%</div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
