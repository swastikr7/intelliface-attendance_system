import { UserPlus, Camera, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Student Enrollment",
    desc: "Register students once with their facial data.",
  },
  {
    icon: Camera,
    title: "Scan Face",
    desc: "Students scan their face during class in real time.",
  },
  {
    icon: CheckCircle,
    title: "Attendance Marked",
    desc: "System automatically records attendance securely.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 bg-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple steps to smart attendance.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-12 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group text-center glass rounded-2xl p-6 border-glow
                         transition-all duration-300
                         hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
            >
              <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full
                              bg-primary/10 text-primary
                              transition-transform group-hover:scale-110">
                <step.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
