import { Shield, Users, Target, Zap, Eye, Sun, Wifi, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

export default function About() {
  const teamMembers = [
    { name: "Ayush Kumar", role: "Team Leader/ ML devloper" },
    { name: "Ashish Kumar", role: "AI/ML devloper" },
    { name: "Ayoan Singh", role: "3D artist" },
    { name: "Aryan Kumar", role: "ML devloper" },
    { name: "Ayushman Praharaj", role: "Full stack ai devloper" }
  ];

  const problems = [
    {
      icon: AlertTriangle,
      title: "Conventional Large Scale Drones",
      description: "Compromise mission stealth and are easily detectable"
    },
    {
      icon: Target,
      title: "Vulnerable to Enemy Interception",
      description: "Posing risks of detection or disruption during operations"
    },
    {
      icon: Users,
      title: "Manual Monitoring Dependence",
      description: "Escalates manpower demands and exposes soldiers to elevated risks"
    }
  ];

  const solutions = [
    {
      icon: Shield,
      title: "Compact & Intelligent",
      description: "Designed to operate covertly in high-risk environments"
    },
    {
      icon: Eye,
      title: "AI-Powered Detection",
      description: "Uses AI model to detect unusual human activities in high risky zones"
    },
    {
      icon: Zap,
      title: "Proactive & Anticipatory",
      description: "Always vigilant, discrete yet immense impact"
    }
  ];

  const techStack = [
    "CNNs & YOLO Neural Networks",
    "Neural Engine for Edge Computing",
    "Thermal Imaging & RGB Cameras",
    "Image Processing Algorithms",
    "SLAM & Path Planning",
    "Solar Panel Integration"
  ];

  const useCases = [
    {
      title: "Border Security",
      description: "Covert drones patrol India–Pakistan and India–China borders, detecting unusual movements and preventing infiltration attempts",
      icon: Shield
    },
    {
      title: "Counter-Terrorism",
      description: "AI surveillance aids operations in Jammu & Kashmir by identifying suspicious activities in hostile zones",
      icon: Target
    },
    {
      title: "Naxal-Affected Areas",
      description: "Silent monitoring in Chhattisgarh, Jharkhand, and Odisha, reducing risks for CRPF during anti-insurgency missions",
      icon: AlertTriangle
    },
    {
      title: "Disaster Response & Rescue",
      description: "In floods or earthquakes, AI-powered drones detect trapped survivors and guide rescue teams",
      icon: MapPin
    }
  ];

  const benefits = [
    "Monitoring where soldiers cannot be present manually",
    "Multi-terrain support across diverse geographical areas",
    "Internal aid to reserve forces during natural calamities",
    "Wide variety coverage both by air and land",
    "Swarm deployment for larger scalability",
    "Return-to-base (RTB) model for fault recovery"
  ];

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-400/30">
            <Shield className="w-12 h-12 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">NEXTECH 1.0</h1>
        <h2 className="text-2xl text-emerald-400 mb-4">Smart Sentinel Surveillance</h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          A compact, intelligent, and covert AI-powered surveillance solution that proactively detects 
          unusual human activities in high-risk zones—anticipatory, vigilant, and discreet yet immensely impactful.
        </p>
      </div>

      {/* Team Information */}
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
          <Users className="w-6 h-6 text-emerald-400" />
          Team Guard-X
        </h3>
        <div className="text-center mb-6">
          <p className="text-emerald-400 font-semibold">NIST University</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-slate-700/50 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-white">{member.name}</h4>
              <p className="text-emerald-400 text-sm">{member.role}</p>
              {member.contact && (
                <p className="text-slate-400 text-xs mt-1">{member.contact}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-red-900/20 rounded-xl p-8 border border-red-500/50">
        <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">THE PROBLEM</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-red-400" />
                </div>
                <h4 className="font-semibold text-red-300 mb-2">{problem.title}</h4>
                <p className="text-red-200 text-sm">{problem.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solution */}
      <div className="bg-emerald-900/20 rounded-xl p-8 border border-emerald-500/50">
        <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">THE SOLUTION</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-emerald-300 mb-2">{solution.title}</h4>
                <p className="text-emerald-200 text-sm">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">TECHNOLOGY STACK</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Use Case Scenarios */}
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">USE CASE SCENARIOS</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <div key={index} className="bg-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                    <IconComponent className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-white">{useCase.title}</h4>
                </div>
                <p className="text-slate-300 text-sm">{useCase.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact and Benefits */}
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">IMPACT AND BENEFITS</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-xl p-8 border border-emerald-500/50">
        <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">FUTURE SCOPE</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-emerald-300 mb-2">SWARM DEPLOYMENT</h4>
            <p className="text-emerald-200 text-sm">Huge number of deployment for larger scalability</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-emerald-300 mb-2">GEOGRAPHICAL SCALING</h4>
            <p className="text-emerald-200 text-sm">Implementation in various terrain depending upon situation</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-emerald-300 mb-2">RTB MODEL</h4>
            <p className="text-emerald-200 text-sm">Return to base model for fault recovery and maintenance</p>
          </div>
        </div>
      </div>

      {/* Guard-X Acronym */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 text-center">
        <h3 className="text-3xl font-bold text-white mb-8">GUARD-X</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
          <div>
            <span className="text-4xl font-bold text-emerald-400">G</span>
            <span className="text-white ml-2">UIDING</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">U</span>
            <span className="text-white ml-2">NSEEN</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">A</span>
            <span className="text-white ml-2">UTONOMOUS</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">R</span>
            <span className="text-white ml-2">ELIABLE</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">D</span>
            <span className="text-white ml-2">EFENCE</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">X</span>
            <span className="text-white ml-2">FACTOR</span>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-2xl font-bold text-emerald-400">JAI HIND</p>
          <p className="text-slate-400 mt-2">Serving the Nation with Innovation</p>
        </div>
      </div>
    </div>
  );
}