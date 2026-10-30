import Link from "next/link";

export default function MembershipPage() {
  const tiers = [
    {
      name: "Scribe", price: "Free", features: [
        "Full game access", "Local saves", "Rule-based advisor", "Leaderboard (local)",
      ], cta: "Play Now", href: "/play",
    },
    {
      name: "Noble", price: "$4.99 / month", features: [
        "Everything in Scribe", "Cloud saves (multiple slots)", "Exclusive chronicle titles", "Priority feature votes",
      ], cta: "Coming Soon", href: "#",
    },
    {
      name: "King of Kings", price: "$9.99 / month", features: [
        "Everything in Noble", "Early access builds", "Cosmetic palace decorations", "Support indie development",
      ], cta: "Coming Soon", href: "#",
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl text-center text-[#d4a017] mb-3">Membership</h1>
      <p className="text-center text-[#b8a888] mb-10 max-w-xl mx-auto">
        The game is free. Paid tiers are planned — <b>no payments are processed yet</b>
        {" "}because no payment provider is connected. Nothing here charges you.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.name} className="panel p-6 flex flex-col">
            <h2 className="text-xl text-[#d4a017]">{t.name}</h2>
            <p className="text-2xl my-3">{t.price}</p>
            <ul className="text-sm text-[#b8a888] space-y-2 flex-1">
              {t.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <Link href={t.href} className="btn-royal text-center mt-6">{t.cta}</Link>
          </div>
        ))}
      </div>
    </main>
  );
}