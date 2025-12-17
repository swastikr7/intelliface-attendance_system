import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Student Dashboard
        </h1>

        <p className="text-muted-foreground mb-8">
          Welcome! This is the student demo dashboard.
        </p>

        <div className="glass rounded-2xl p-6 border-glow mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Attendance Status
          </h2>
          <p className="text-muted-foreground">
            No active class right now.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-primary px-6 py-3 text-primary-foreground
                     transition-all hover:scale-[1.05]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
