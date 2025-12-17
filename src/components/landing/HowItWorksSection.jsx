import { UserPlus, ScanFace, CheckCircle2, LineChart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Enroll Students",
    description: "Quick one-time face registration. Students simply look at the camera for 3 seconds.",
  },
  {
    number: "02",
    icon: ScanFace,
    title: "Start Class Session",
    description: "Teacher initiates the session. The system automatically activates face scanning.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Automatic Check-in",
    description: "Students are recognized instantly as they enter. Attendance is logged in real-time.",
  },
  {
    number: "04",
    icon: LineChart,
    title: "Review & Export",
    description: "Access detailed reports, track trends, and export data to your LMS or spreadsheets.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-radial opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary mb-4 block">How it Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple setup, powerful results
          </h2>
          <p className="text-muted-foreground">
            Get started in minutes with our intuitive workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group flex gap-6 items-start opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.15 * (index + 1)}s` }}
              >
                {/* Number indicator */}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-border to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-primary">{step.number}</span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
