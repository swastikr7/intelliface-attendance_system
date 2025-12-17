import { Scan, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Scan className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-semibold">IntelliFace</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/swastikr7/intelliface-attendance_system" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 IntelliFace. Built with ❤️ for modern education.</p>
        </div>
      </div>
    </footer>
  );
}
