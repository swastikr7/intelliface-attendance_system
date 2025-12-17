import { Link } from "react-router-dom";
import { Scan, Menu, X, Github } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <Scan className="h-6 w-6 text-glow" />
            <span className="font-bold text-lg">IntelliFace</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#about">About</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/swastikr7/intelliface-attendance_system"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center"
            >
              <Github className="h-4 w-4" />
            </a>

            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

