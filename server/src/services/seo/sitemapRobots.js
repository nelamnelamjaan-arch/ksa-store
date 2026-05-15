import { Product } from "../../models/Product.js";
import { Category } from "../../models/Category.js";

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * @param {string} siteOrigin e.g. https://ksa-store.com (no trailing slash)
 */
export async function buildSitemapXml(siteOrigin) {
  const origin = String(siteOrigin || "https://example.com").replace(/\/$/, "");
  const urls = [];

  urls.push({ loc: `${origin}/`, changefreq: "daily", priority: "1.0" });
  urls.push({ loc: `${origin}/browse`, changefreq: "daily", priority: "0.9" });

  const categories = await Category.find({ parent: { $ne: null } })
    .select("slug updatedAt")
    .lean()
    .limit(400);

  for (const c of categories) {
    if (!c?.slug) continue;
    const lastmod = c.updatedAt ? new Date(c.updatedAt).toISOString().slice(0, 10) : undefined;
    urls.push({
      loc: `${origin}/browse?catalog_key=${encodeURIComponent(c.slug)}`,
      changefreq: "weekly",
      priority: "0.75",
      lastmod,
    });
  }

  const products = await Product.find({ isActive: true })
    .select("slug updatedAt _id")
    .sort({ updatedAt: -1 })
    .limit(8000)
    .lean();

  for (const p of products) {
    const pathSeg = p.slug && String(p.slug).trim() ? encodeURIComponent(p.slug) : String(p._id);
    const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : undefined;
    urls.push({
      loc: `${origin}/products/${pathSeg}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod,
    });
  }

  const body = urls
    .map((u) => {
      const lm = u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : "";
      return `  <url>
    <loc>${escapeXml(u.loc)}</loc>${lm}
    <changefreq>${escapeXml(u.changefreq || "weekly")}</changefreq>
    <priority>${escapeXml(u.priority || "0.5")}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function buildRobotsTxt(siteOrigin) {
  const origin = String(siteOrigin || "https://example.com").replace(/\/$/, "");
  return `# KSA Store — robots
User-agent: *
Allow: /
Allow: /browse
Allow: /products/
Allow: /about
Allow: /privacy
Allow: /terms

Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /account/

Sitemap: ${origin}/sitemap.xml
`;
}
