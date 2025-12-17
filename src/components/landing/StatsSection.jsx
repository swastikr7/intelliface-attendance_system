const stats = [
  { value: "99.9%", label: "Recognition Accuracy" },
  { value: "<1s", label: "Check-in Time" },
  { value: "50K+", label: "Students Enrolled" },
  { value: "24/7", label: "System Uptime" },
];

export default function StatsSection() {
  return (
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
