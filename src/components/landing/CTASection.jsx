import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-10 md:p-16 border-glow">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Eliminate Proxy Attendance?
          </h2>
          <p className="text-muted-foreground mb-10">
            Start using IntelliFace today and transform attendance management.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="group inline-flex items-center justify-center rounded-xl
                       bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground
                       shadow-xl shadow-primary/40
                       transition-all duration-300
                       hover:scale-[1.07]
                       hover:shadow-primary/70"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
