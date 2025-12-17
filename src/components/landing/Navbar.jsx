import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <span className="text-primary">⦿</span>
          IntelliFace
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <button
            onClick={() => scrollTo("features")}
            className="hover:text-foreground transition-colors"
          >
            Features
          </button>

          <button
            onClick={() => scrollTo("how-it-works")}
            className="hover:text-foreground transition-colors"
          >
            How it Works
          </button>

          <button
            onClick={() => scrollTo("about")}
            className="hover:text-foreground transition-colors"
          >
            About
          </button>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex items-center justify-center rounded-lg
                       border border-border bg-card/50 px-4 py-2 text-sm
                       backdrop-blur-xl transition-all duration-300
                       hover:bg-card hover:scale-[1.05]"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center justify-center rounded-lg
                       bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground
                       shadow-lg shadow-primary/30
                       transition-all duration-300
                       hover:scale-[1.05]
                       hover:shadow-primary/60"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
