const CONTACT = "nelamnelamjaan@gmail.com";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-white/[0.08] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan/90">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-white/55">Last updated: May 14, 2026 · KSA Store</p>
      </header>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-white/75">
        <p>
          This Privacy Policy describes how KSA Store (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
          collects, uses, stores, and protects information when you use our website, marketplace
          services, and related features. By using KSA Store, you agree to the practices described
          here. For questions or data requests, contact{" "}
          <a className="text-neon-cyan hover:underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
          .
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">1. Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white/90">Account data:</strong> name, email address, and
              authentication identifiers when you register or sign in with Google.
            </li>
            <li>
              <strong className="text-white/90">Order &amp; payment data:</strong> billing and
              shipping details, cart contents, and transaction references processed by our payment
              partners (for example Stripe or Coinbase). We do not store full card numbers on our
              servers.
            </li>
            <li>
              <strong className="text-white/90">Technical &amp; usage data:</strong> IP address,
              device type, browser language, approximate region (for currency and compliance), and
              diagnostic logs to secure and improve the service.
            </li>
            <li>
              <strong className="text-white/90">Cookies &amp; local storage:</strong> session tokens,
              preference keys, and consent flags as described in our cookie notice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">2. How we use information</h2>
          <p className="mt-3">
            We use personal data to operate the marketplace, authenticate users, process orders,
            prevent fraud, comply with law, analyze aggregate performance, and communicate
            service-related notices. Marketing communications, if any, will be opt-in where
            required by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">3. AI-assisted features</h2>
          <p className="mt-3">
            Certain catalogue or SEO features may use third-party AI providers (such as Google
            Gemini or OpenAI) to transform product text. Content is sent only as needed to
            deliver those features and must not include payment card data. Provider terms and
            safeguards apply in addition to this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">4. Sharing &amp; processors</h2>
          <p className="mt-3">
            We share data with subprocessors who help us run KSA Store (hosting, databases, email,
            payments, analytics, AI, and security). We require appropriate contractual protections.
            We may disclose information if required by law or to protect rights, safety, and
            integrity of users and the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">5. Retention</h2>
          <p className="mt-3">
            We retain information as long as necessary to provide the service, meet legal and
            accounting obligations, and resolve disputes. Some aggregated or de-identified data may
            be kept longer for analytics.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">6. Your rights</h2>
          <p className="mt-3">
            Depending on your jurisdiction, you may have rights to access, correct, delete, or
            export your personal data, and to object to or restrict certain processing. To exercise
            these rights, email{" "}
            <a className="text-neon-cyan hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            from the address associated with your account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">7. International transfers</h2>
          <p className="mt-3">
            KSA Store may process data in multiple countries. Where we transfer personal data across
            borders, we implement safeguards consistent with applicable regulations.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">8. Security</h2>
          <p className="mt-3">
            We use industry-standard technical and organizational measures to protect data.
            However, no method of transmission over the Internet is completely secure; you use the
            service at your own risk within reasonable bounds.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">9. Children</h2>
          <p className="mt-3">
            KSA Store is not directed at children under 16. We do not knowingly collect personal
            information from children. If you believe we have, contact us and we will delete it
            promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">10. Changes</h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. Material changes will be indicated
            by updating the date above and, where appropriate, additional notice on the site.
          </p>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md">
          <h2 className="font-display text-lg font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Privacy &amp; data protection inquiries:{" "}
            <a className="font-medium text-neon-cyan hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
