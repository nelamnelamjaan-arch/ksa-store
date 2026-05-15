const CONTACT = "nelamnelamjaan@gmail.com";

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-white/[0.08] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan/90">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-white/55">Last updated: May 14, 2026</p>
      </header>

      <div className="space-y-10 text-sm leading-relaxed text-white/75">
        <p className="text-[15px] leading-7 text-white/80">
          Welcome to the KSA Store experience. These Terms of Service (&quot;Terms&quot;) constitute a
          binding agreement between you and KSA Store governing access to our digital properties,
          concierge commerce tools, and related services. By creating an account, browsing curated
          assortments, or completing a transaction, you confirm that you have read, understood, and
          accepted these Terms in full.
        </p>

        <section className="glass-panel rounded-2xl border border-white/[0.08] p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            1. Facilitator &amp; aggregator model
          </h2>
          <p className="mt-3">
            <strong className="text-white/90">KSA Store is an independent facilitator and aggregator.</strong>{" "}
            We curate demand, orchestrate checkout, and coordinate fulfilment introductions with{" "}
            <strong className="text-white/90">licensed third-party partner retailers, pharmacies, and
            distributors</strong> (for example, where applicable, Nahdi Pharmacy, Carrefour, Panda, or other
            named partners appearing on your order confirmation). Unless expressly stated otherwise in
            writing, KSA Store does not take title to inventory, does not act as the dispensing pharmacist,
            and does not manufacture groceries, medicines, or general merchandise listed on the platform.
          </p>
          <p className="mt-3">
            Partner stores remain solely responsible for regulatory licensing, batch traceability where
            required, cold-chain handling, product authenticity, manufacturer warranties, and any
            mandatory consumer disclosures imposed on them under Saudi Arabian law and applicable Gulf
            standards. KSA Store may display &quot;Sourced from&quot; attribution tags to preserve transparency
            between you and the fulfilling partner.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">2. Accounts &amp; eligibility</h2>
          <p className="mt-3">
            You agree to provide accurate, current identification and contact data, to safeguard your
            credentials, and to notify us promptly of unauthorised access. We may suspend or terminate
            accounts that present fraud risk, abuse our staff or partners, or breach these Terms.
          </p>
        </section>

        <section className="glass-panel rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-6">
          <h2 className="font-display text-lg font-semibold text-emerald-100/95">
            3. Medical &amp; pharmacy disclaimer
          </h2>
          <p className="mt-3">
            <strong className="text-white/90">KSA Store does not provide medical advice, diagnosis, or
            treatment.</strong> Any educational copy on product detail pages is for general orientation
            only and must not replace the professional judgment of a physician, dentist, or licensed
            pharmacist. Prescription medicines may only be supplied in accordance with applicable
            regulations and the policies of the fulfilling licensed pharmacy. You acknowledge that
            fulfilment, counselling, and pharmacovigilance obligations rest with the dispensing partner,
            not with KSA Store as a technology layer.
          </p>
        </section>

        <section className="glass-panel rounded-2xl border border-teal-500/15 bg-teal-500/[0.04] p-6">
          <h2 className="font-display text-lg font-semibold text-teal-100/95">
            4. Perishable goods &amp; fresh produce
          </h2>
          <p className="mt-3">
            Fruits, vegetables, chilled dairy, bakery items, and other perishables are sourced for
            freshness subject to partner availability and seasonal variance.{" "}
            <strong className="text-white/90">
              Any quality, safety, or temperature concern relating to perishable goods must be reported
              within two (2) hours of recorded delivery
            </strong>{" "}
            so that our partner can initiate spoilage review, photographic verification, and any
            permitted exchange or credit in line with their policies. Claims submitted after this window
            may be declined except where mandatory consumer laws provide otherwise.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">5. Pricing, taxes &amp; shipping</h2>
          <p className="mt-3">
            Displayed prices may reflect platform facilitation fees, partner surcharges, estimated VAT,
            and shipping assumptions. Final totals are confirmed at checkout. Currency presentation may be
            converted for convenience; settlement occurs in the denomination presented at payment capture.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">6. Payments &amp; chargebacks</h2>
          <p className="mt-3">
            Payments are processed by certified third-party providers (such as Stripe or Coinbase
            Commerce). You agree to their supplemental terms. Chargebacks, refunds, and disputes follow
            the timeline communicated at checkout and may require cooperation with both KSA Store and the
            fulfilling partner.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">7. Prohibited conduct</h2>
          <p className="mt-3">
            You may not circumvent partner pricing rules, interfere with platform security, harvest data in
            violation of our technical policies, or use KSA Store to procure unlawful goods. We cooperate
            with competent authorities where legally required.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">8. Intellectual property</h2>
          <p className="mt-3">
            KSA Store branding, interface design, and proprietary selection algorithms remain our
            exclusive property. Partner trademarks appear for identification only and remain the property
            of their respective owners.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">9. Disclaimers &amp; liability cap</h2>
          <p className="mt-3">
            Except where prohibited, the service is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest
            extent permitted under the law of the Kingdom of Saudi Arabia, KSA Store disclaims implied
            warranties and limits aggregate liability arising out of or related to these Terms to the
            greater of (a) the facilitation fees actually retained by KSA Store in respect of the disputed
            order or (b) five hundred Saudi riyals (SAR 500), unless a mandatory statute dictates a
            different outcome.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">10. Governing law &amp; venue</h2>
          <p className="mt-3">
            These Terms are governed by the laws of the Kingdom of Saudi Arabia, without regard to
            conflict-of-law principles. Exclusive jurisdiction shall rest with the competent courts of
            Riyadh, subject to any non-waivable rights you may have as a consumer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">11. Contact &amp; legal notices</h2>
          <p className="mt-3">
            For VIP concierge support, compliance questions, or formal legal notices, please write to{" "}
            <a className="text-neon-cyan hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
            . We endeavour to acknowledge privileged inquiries within two business days.
          </p>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="font-display text-lg font-semibold text-white">12. Updates</h2>
          <p className="mt-3">
            We may revise these Terms to reflect regulatory guidance, partner obligations, or product
            innovation. Material changes will be highlighted on this page with an updated effective date.
            Continued use after posting constitutes acceptance unless applicable law requires a different
            consent mechanism.
          </p>
        </section>
      </div>
    </div>
  );
}
