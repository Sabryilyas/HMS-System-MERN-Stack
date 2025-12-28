import React from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"

const AboutPage = () => {
  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Passionate about hospitality with 20+ years of experience.",
      icon: "👨‍💼",
    },
    {
      name: "Priya Sharma",
      role: "COO & Booking Expert",
      bio: "Expert in luxury travel logistics and customer satisfaction.",
      icon: "👩‍💼",
    },
    {
      name: "Ahmed Hassan",
      role: "CTO & Tech Lead",
      bio: "Tech innovator driving seamless booking experiences.",
      icon: "👨‍💻",
    },
    {
      name: "Lisa Anderson",
      role: "Head of Customer Care",
      bio: "Award-winning customer service leader.",
      icon: "👩‍🎓",
    },
  ]
  
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest bg-blue-100/50 px-4 py-2 rounded-full inline-block mb-6 opacity-0 animate-fade-in-up">
            🌟 About Us
          </span>
          <h1 className="text-6xl font-bold text-slate-900 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Who We Are
          </h1>
          <p className="text-2xl text-slate-600 max-w-3xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Dedicated to delivering the finest luxury hotel experiences worldwide.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 rounded-2xl border border-slate-200 opacity-0 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              To create unforgettable luxury hotel experiences by connecting travelers with the finest accommodations and seamless booking services.
            </p>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <Card 
                key={idx} 
                className="p-8 rounded-2xl border border-slate-200 shadow-lg group hover:scale-105 transition-transform opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">{member.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                <p className="text-slate-600">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default AboutPage