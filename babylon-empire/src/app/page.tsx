import Link from "next/link";

const CINEMATIC_URL = "https://d3p662obnq9uz2.cloudfront.net/video-artifacts/31ce6168-Rise_of_Babylon_opening_cinematic.mp4";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={CINEMATIC_URL}
          autoPlay muted loop playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#0d0b08]" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-[#e8dcc3] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Rise of the Babylonian Empire
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-[#d4c4a0] drop-shadow">
            Rule the cradle of civilization. Feed your people, raise ziggurats,
            command armies and let the Euphrates carry your name to eternity.
          </p>
          <Link href="/play" className="btn-royal inline-block mt-8 text-lg px-10 py-3">
            ▶ Play Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          ["🏛️", "Build Babylon", "Place farms, granaries, markets, walls and the great ziggurat on living terrain."],
          ["🌾", "Rule the Seasons", "Weather, drought and floods reshape your harvest every season."],
          ["🧙", "Royal Advisor", "A read-only Grand Vizier analyzes your kingdom and counsels you — never rules it."],
        ].map(([icon, title, text]) => (
          <div key={title} className="panel p-6">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="text-xl text-[#d4a017] mb-2">{title}</h3>
            <p className="text-sm text-[#b8a888]">{text}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-10 text-sm text-[#6a5a3a]">
        RetroRevive · Rise of the Babylonian Empire — original work inspired by public-domain 1978 educational literature.
      </footer>
    </main>
  );
}