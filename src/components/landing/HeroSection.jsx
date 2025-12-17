import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Clock } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-glow mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Attendance System</span>
          </div>

          {/* Main heading */}
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Smart Attendance
            <br />
            <span className="text-gradient">Made Simple</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Transform your classroom with face recognition powered attendance tracking. 
            Automated, accurate, and effortless.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button size="lg" className="glow-primary group">
              Start Check-in
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-glow">
              Enroll Students
            </Button>
          </div>

          {/* Stats Card */}
          <div 
            className="glass rounded-2xl p-6 md:p-8 max-w-xl mx-auto border-glow opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">Live Session</span>
            </div>
            <h3 className="text-lg font-medium mb-1">CS 101 - Data Structures</h3>
            <p className="text-sm text-muted-foreground mb-6">Prof. Smith • Room 204</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">29</span>
                </div>
                <span className="text-xs text-muted-foreground">Present</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-muted-foreground">3</span>
                </div>
                <span className="text-xs text-muted-foreground">Absent</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">91%</span>
                </div>
                <span className="text-xs text-muted-foreground">Attendance</span>
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
