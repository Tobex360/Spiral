import React from "react";
import logo from '../../assets/logo.svg'
import { Badge } from "antd";
import H1 from '../../assets/landing1.svg'
import H2 from '../../assets/landing2.svg'
import H3 from '../../assets/landing3.svg'
import H4 from '../../assets/landing4.svg'
import { Divider } from "../../components/Reuseable";

const FEATURES = [
  {
    title: "Check out reviews on your favorite games",
    desc: "Dive into a global community and see what players worldwide are saying about the latest hits and hidden gems.",
    img: H2,
    reversed: false,
  },
  {
    title: "Post your review on games",
    desc: "Your voice matters. Share your experiences, rate your gameplay, and help others find their next favorite title.",
    img: H3,
    reversed: true,
  },
  {
    title: "Find out the latest gaming news",
    desc: "Stay ahead of the curve with our dedicated news board featuring updates, patches, and industry leaks.",
    img: H4,
    reversed: false,
  },
];

function Landing() {
  return (
    <main className="text-white font-tomorrow overflow-hidden">
      
      {/* 🔥 HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="z-10">
          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="Spiral Logo" className="h-16 w-auto" />
            <h1 className="text-5xl md:text-7xl font-audiowide text-red-500 tracking-tighter">
              SPIRAL
            </h1>
          </div>

          <p className="text-xl text-gray-300 mb-8 max-w-md leading-relaxed">
            The prime destination for <span className="text-white font-bold">Rating</span> and <span className="text-white font-bold">Reviewing</span> the games you love.
          </p>

          {/* Stats Chips */}
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <Badge color='blue' className="animate-pulse"/> 550,000 Games
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <Badge color='green' className="animate-pulse"/> 1,400 Users
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <Badge color='red' className="animate-pulse"/> 80,000 Reviews
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-full rounded-xl overflow-hidden bg-secondary flex items-center justify-center transform group-hover:scale-[1.02] transition-transform duration-500">
            <img src={H1} alt="Hero illustration" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <Divider />

      {/* SECTION TITLE */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <h2 className="text-red-500 text-2xl md:text-3xl font-audiowide mb-4 uppercase tracking-widest">
          Explore Our Massive Catalogue
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          From retro classics to next-gen blockbusters, we have more than 500,000 games ready for your verdict.
        </p>
      </section>

      <Divider />

      {/* FEATURE SECTIONS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32 py-24">
        {FEATURES.map((f, idx) => (
          <div key={idx} className="group">
            <div className={`grid md:grid-cols-2 gap-16 items-center`}>
              <div className={`${f.reversed ? "md:order-2" : ""}`}>
                <h3 className="text-3xl font-audiowide text-red-500 mb-6 leading-tight">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className={`relative ${f.reversed ? "md:order-1" : ""}`}>
                 <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
                 <img 
                  src={f.img} 
                  alt={f.title} 
                  className="relative w-full h-auto rounded-2xl shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500" 
                />
              </div>
            </div>
            {idx !== FEATURES.length - 1 && <div className="mt-32 opacity-50"><Divider /></div>}
          </div>
        ))}
      </section>

    </main>
  );
}

export default Landing;