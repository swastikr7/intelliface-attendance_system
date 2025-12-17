import { Scan, Shield, BarChart3, Clock, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Face Recognition",
    description: "Advanced AI-powered facial recognition for instant, contactless check-ins with 99.9% accuracy.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Live attendance updates as students enter. No manual roll calls, no delays.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Comprehensive dashboards with attendance trends, patterns, and engagement insights.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade encryption. Face data is processed locally and never stored externally.",
  },
  {
    icon: Users,
    title: "Easy Enrollment",
    description: "Simple one-time face registration process. Students are ready in seconds.",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description: "Generate attendance reports, export data, and integrate with your existing systems.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for modern attendance
          </h2>
          <p className="text-muted-foreground">
            Designed for educators who want to spend less time on admin and more time teaching.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group glass rounded-xl p-6 border-glow opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
