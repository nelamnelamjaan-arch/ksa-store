/** Client path for PDP — prefers SEO slug when present. */
export function productPath(p) {
  if (!p) return "/browse";
  const slug = p.slug && String(p.slug).trim();
  if (slug) return `/products/${encodeURIComponent(slug)}`;
  const id = p._id ?? p.id;
  return id ? `/products/${id}` : "/browse";
}
