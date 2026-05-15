const CONTACT = "nelamnelamjaan@gmail.com";

export default function AboutUs() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-white/[0.08] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan/90">Company</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          About KSA Store
        </h1>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-white/75">
        <p>
          KSA Store is a premium, multi-vendor marketplace built to bring curated global inventory to
          customers with enterprise-grade operations, transparent economics, and a concierge-level
          experience.
        </p>
        <p>
          Our platform combines intelligent sourcing automation, secure payments, and rigorous
          compliance workflows so vendors can scale while buyers enjoy trusted fulfilment.
        </p>
        <p>
          For partnerships, press, or enterprise onboarding, reach us at{" "}
          <a className="text-neon-cyan hover:underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
