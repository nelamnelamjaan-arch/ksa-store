const DEFAULT_WA = "966500000000";

function buildWhatsAppUrl(phoneDigits, message) {
  const n = String(phoneDigits || "").replace(/\D/g, "") || DEFAULT_WA;
  const text = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${text}`;
}

export default function ProductWhatsAppFab({ productName }) {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WA;
  const msg = `Hi, I am interested in ${String(productName || "this product")}. Is it available?`;
  const href = buildWhatsAppUrl(raw, msg);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl shadow-[0_8px_32px_rgba(37,211,102,0.45)] transition hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/40"
      title="Ask on WhatsApp"
      aria-label="Chat on WhatsApp about this product"
    >
      <svg className="h-7 w-7" viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.003 3C9.383 3 4 8.003 4 14.235c0 2.43.713 4.696 1.942 6.605L4 29l8.302-2.195A11.34 11.34 0 0016.003 25.47C22.623 25.47 28 20.467 28 14.235 28 8.003 22.623 3 16.003 3zm0 19.94c-1.936 0-3.746-.536-5.29-1.464l-.38-.227-4.89 1.293 1.31-4.56-.25-.398A8.904 8.904 0 015.87 14.235C5.87 9.29 10.47 5.06 16.003 5.06c5.532 0 10.132 4.23 10.132 9.175 0 4.946-4.6 9.705-10.132 9.705zm5.45-6.84c-.298-.15-1.763-.87-2.036-.97-.273-.1-.472-.15-.67.148-.198.297-.767.97-.94 1.17-.173.198-.347.223-.644.074-.297-.15-1.254-.462-2.39-1.475-.883-.788-1.478-1.76-1.652-2.057-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.148-.173.198-.297.297-.495.1-.198.05-.372-.025-.521-.074-.148-.67-1.612-.92-2.207-.242-.58-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.48 0 1.462 1.067 2.875 1.215 3.072.148.198 2.1 3.2 5.08 4.487.71.307 1.264.49 1.697.627.713.227 1.362.195 1.875.118.572-.085 1.763-.72 2.012-1.417.25-.696.25-1.293.175-1.417-.074-.124-.272-.198-.57-.347z"
        />
      </svg>
    </a>
  );
}
