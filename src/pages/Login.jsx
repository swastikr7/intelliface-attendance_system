import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // 🔥 DEMO AUTH LOGIC
    if (
      role === "student" &&
      email === "student@demo.com" &&
      password === "student123"
    ) {
      navigate("/student/dashboard");
      return;
    }

    if (
      role === "teacher" &&
      email === "teacher@demo.com" &&
      password === "teacher123"
    ) {
      navigate("/teacher/dashboard");
      return;
    }

    // ❌ Invalid
    setError("Invalid demo credentials");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-6">
      <div className="glass w-full max-w-md rounded-2xl p-8 border-glow">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">IntelliFace</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>

        {/* Role Switch */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm transition-all
              ${
                role === "student"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              }`}
          >
            Student
          </button>

          <button
            onClick={() => setRole("teacher")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm transition-all
              ${
                role === "teacher"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              }`}
          >
            Teacher
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-background/60 border border-border px-4 py-3 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-background/60 border border-border px-4 py-3 outline-none"
            required
          />

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500
                       py-3 text-sm font-semibold text-white
                       shadow-lg transition-all
                       hover:scale-[1.04]"
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create account
          </Link>
        </p>

        {/* Demo hint */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>Student → student@demo.com / student123</p>
          <p>Teacher → teacher@demo.com / teacher123</p>
        </div>
      </div>
    </div>
  );
}
