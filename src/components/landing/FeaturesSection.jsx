import { Camera, ShieldCheck, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Face Recognition",
    desc: "Real-time AI based face detection ensures accurate attendance every time.",
  },
  {
    icon: ShieldCheck,
    title: "No Proxy",
    desc: "Prevents fake attendance using unique facial verification.",
  },
  {
    icon: Zap,
    title: "Instant Check-in",
    desc: "Attendance marked in seconds — no manual effort required.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    desc: "Generate and export attendance reports effortlessly.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to manage attendance intelligently.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="group glass rounded-2xl p-6 border-glow
                         transition-all duration-300
                         hover:-translate-y-2
                         hover:shadow-xl hover:shadow-primary/20"
            >
              <f.icon className="w-7 h-7 text-primary mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
