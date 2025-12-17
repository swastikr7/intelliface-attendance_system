import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b1e] via-[#070f2b] to-[#0b163f] text-white">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="text-xl font-bold tracking-wide">
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
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Smart Attendance <br />
            Powered by <span className="text-cyan-400">Face Recognition</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            IntelliFace is an AI-powered attendance system designed for
            colleges and universities.  
            It ensures secure, fast, and proxy-free attendance for students
            and effortless management for teachers.
          </p>

          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
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

        {/* Right Side Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">
            Why IntelliFace?
          </h3>

          <ul className="space-y-4 text-gray-300">
            <li>✔ Face-based attendance (no manual entry)</li>
            <li>✔ Prevents proxy & fake attendance</li>
            <li>✔ Real-time student verification</li>
            <li>✔ Attendance analytics & insights</li>
            <li>✔ Student engagement with gamification</li>
          </ul>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Built for <span className="text-cyan-400">Students & Teachers</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:scale-[1.02] transition">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">
              🎓 For Students
            </h3>
            <p className="text-gray-300">
              Mark attendance using face recognition, track attendance
              percentage, view schedules, and stay motivated with
              gamified insights.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:scale-[1.02] transition">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">
              🧑‍🏫 For Teachers
            </h3>
            <p className="text-gray-300">
              Enroll students securely, manage classes, and view
              attendance records without manual effort or proxies.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:scale-[1.02] transition">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">
              🤖 AI Powered
            </h3>
            <p className="text-gray-300">
              Uses face-api.js for real-time face detection and recognition,
              ensuring accuracy and reliability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-6">
          Experience the Future of Attendance
        </h2>
        <p className="text-gray-300 mb-8">
          Simple. Secure. Smart.  
          Built as a modern solution for educational institutions.
        </p>

        <Link
          to="/login"
          className="inline-block px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition"
        >
          Try Demo Login
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} IntelliFace — Face Recognition Attendance System  
        <br />
        College Mini Project
      </footer>
    </div>
  );
}
