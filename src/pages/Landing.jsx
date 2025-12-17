import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b1e] via-[#070f2b] to-[#0b163f] text-white">

      {/* NAVBAR */}
      <nav className="w-full border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="text-2xl font-extrabold tracking-wide">
            Intelli<span className="text-cyan-400">Face</span>
          </div>

          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Smart Attendance <br />
            Powered by{" "}
            <span className="text-cyan-400">Face Recognition</span>
          </h1>

          <p className="text-gray-300 text-lg mb-10 max-w-xl">
            IntelliFace is an AI-powered attendance system for colleges and
            universities that ensures secure, fast, and proxy-free attendance
            for students and effortless management for teachers.
          </p>

          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition"
            >
              Student Login
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
            >
              Teacher Login
            </Link>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6 text-cyan-400">
            Why IntelliFace?
          </h3>

          <ul className="space-y-4 text-gray-300 text-lg">
            <li>✔ Face-based attendance (no manual entry)</li>
            <li>✔ Prevents proxy & fake attendance</li>
            <li>✔ Real-time student verification</li>
            <li>✔ Attendance analytics & insights</li>
            <li>✔ Student engagement with gamification</li>
          </ul>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Built for{" "}
          <span className="text-cyan-400">Students & Teachers</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            title="🎓 For Students"
            text="Mark attendance using face recognition, track attendance percentage, view schedules, and stay motivated with gamified insights."
          />

          <FeatureCard
            title="🧑‍🏫 For Teachers"
            text="Enroll students securely, manage classes, and view attendance records without manual effort or proxy issues."
          />

          <FeatureCard
            title="🤖 AI Powered"
            text="Uses face-api.js for real-time face detection and recognition, ensuring accuracy and reliability."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="text-4xl font-extrabold mb-6">
          Experience the Future of Attendance
        </h2>

        <p className="text-gray-300 text-lg mb-10">
          Simple. Secure. Smart. Built as a modern solution for educational
          institutions.
        </p>

        <Link
          to="/login"
          className="inline-block px-10 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition"
        >
          Try Demo Login
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} IntelliFace — Face Recognition Attendance
        System
        <br />
        College Mini Project
      </footer>
    </div>
  );
}

/* ---------- Feature Card ---------- */
function FeatureCard({ title, text }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:scale-[1.03] transition">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">
        {title}
      </h3>
      <p className="text-gray-300 text-lg">
        {text}
      </p>
    </div>
  );
}
