import { Users, Camera, ShieldCheck } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Stat 1 */}
          <div
            className="group glass rounded-2xl p-6 border-glow
                       transition-all duration-300
                       hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
          >
            <Users className="w-6 h-6 text-primary mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold mb-1">1000+</h3>
            <p className="text-sm text-muted-foreground">
              Students Managed
            </p>
          </div>

          {/* Stat 2 */}
          <div
            className="group glass rounded-2xl p-6 border-glow
                       transition-all duration-300
                       hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
          >
            <Camera className="w-6 h-6 text-primary mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold mb-1">99%</h3>
            <p className="text-sm text-muted-foreground">
              Face Recognition Accuracy
            </p>
          </div>

          {/* Stat 3 */}
          <div
            className="group glass rounded-2xl p-6 border-glow
                       transition-all duration-300
                       hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
          >
            <ShieldCheck className="w-6 h-6 text-primary mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold mb-1">0%</h3>
            <p className="text-sm text-muted-foreground">
              Proxy Attendance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
