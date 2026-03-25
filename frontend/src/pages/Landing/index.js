import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayout, FiActivity, FiCpu, FiZap, FiShield, FiDollarSign } from 'react-icons/fi';

const features = [
  {
    icon: FiLayout,
    title: 'Visual Architecture Builder',
    description:
      'Drag-and-drop components to design complex distributed systems. Support for microservices, databases, caches, load balancers, and more.',
    accent: 'text-blue-400',
  },
  {
    icon: FiActivity,
    title: 'Traffic Simulation',
    description:
      'Simulate real-world traffic patterns and observe how your system handles load. Identify bottlenecks before they become production incidents.',
    accent: 'text-green-400',
  },
  {
    icon: FiCpu,
    title: 'AI-Powered Analysis',
    description:
      'Get intelligent recommendations for improving reliability, scalability, and cost efficiency. Powered by advanced analysis engines.',
    accent: 'text-purple-400',
  },
];

const stats = [
  { icon: FiZap, label: 'Simulations Run', value: '50K+' },
  { icon: FiShield, label: 'Architectures Built', value: '12K+' },
  { icon: FiDollarSign, label: 'Cost Saved', value: '$2M+' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCpu className="text-primary-500 text-2xl" />
            <span className="text-white font-bold text-xl">SysDesign AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-dark-300 hover:text-white transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-primary-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/30 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary-700/50 bg-primary-900/20">
            <span className="text-primary-400 text-sm font-medium">
              Design smarter systems, faster
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            AI System Design
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              Simulator
            </span>
          </h1>

          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Design, simulate, and optimize distributed system architectures with
            AI-powered insights. From concept to production-ready in minutes.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg shadow-primary-900/50"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border border-dark-600 hover:border-dark-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors bg-dark-800/50"
            >
              Login
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="text-primary-500 text-xl" />
                <span className="text-3xl font-bold text-white">{value}</span>
                <span className="text-dark-400 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to design at scale
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            A complete toolkit for architecting, testing, and optimizing
            distributed systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-dark-600 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center mb-4 group-hover:bg-dark-600 transition-colors">
                <Icon className={`text-2xl ${accent}`} />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
              <p className="text-dark-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-primary-900/40 to-blue-900/40 rounded-2xl p-12 text-center border border-primary-800/30">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build better systems?
          </h2>
          <p className="text-dark-300 mb-8 max-w-lg mx-auto">
            Join thousands of engineers designing resilient, cost-effective
            architectures.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Start Building Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-400">
            <FiCpu className="text-primary-500" />
            <span className="font-medium">SysDesign AI</span>
          </div>
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} SysDesign AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
