import { Link } from "react-router-dom";

export default function AuthLanding() {
  return (
    <section className="page container" style={{ maxWidth: 500 }}>
      <h1 className="page-title">Welcome to IntelliFace</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Please login or create an account to continue.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>
          Login
        </Link>
        <Link to="/signup" className="btn btn-outline" style={{ flex: 1 }}>
          Signup
        </Link>
      </div>
    </section>
  );
}
