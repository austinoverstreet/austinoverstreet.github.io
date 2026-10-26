// Site footer: social links, copyright line, and links to Privacy / Contact.
// Hand-written ESM (no build step). Everything is set in quartz.config.yaml
// under this plugin's `options:`:
//   owner:  "Austin Overstreet"
//   social: [{ label: "Instagram", href: "https://..." }, ...]
//   pages:  [{ label: "Privacy", href: "privacy" }, ...]   (relative to the site root)
import { h } from "preact"

const defaults = { owner: "", social: [], pages: [] }

// "../" prefixes needed to get from the current page back to the site root
function toRoot(slug) {
  const depth = slug.split("/").filter((s) => s !== "").length - 1
  return depth <= 0 ? "./" : "../".repeat(depth)
}

export const SiteFooter = (userOpts) => {
  const opts = { ...defaults, ...userOpts }
  const year = new Date().getFullYear()

  const Component = ({ fileData }) => {
    const root = toRoot(fileData.slug ?? "index")
    return h(
      "footer",
      { class: "site-footer" },
      opts.social.length > 0 &&
        h(
          "ul",
          { class: "sf-social" },
          opts.social.map((s) =>
            h(
              "li",
              null,
              h("a", { href: s.href, rel: "me noopener", target: "_blank" }, s.label),
            ),
          ),
        ),
      h("p", { class: "sf-copy" }, `© ${year} ${opts.owner}. All rights reserved.`),
      opts.pages.length > 0 &&
        h(
          "ul",
          { class: "sf-pages" },
          opts.pages.map((p) => h("li", null, h("a", { href: root + (p.href ?? "") }, p.label))),
        ),
    )
  }

  Component.css = `
.site-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  text-align: center;
}
.site-footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 0.6rem;
}
.site-footer p {
  margin: 0;
}
.site-footer .sf-social a {
  display: inline-block;
  padding: 0.25rem 0.9rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  background: transparent;
  color: var(--darkgray);
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.site-footer .sf-social a:hover {
  border-color: var(--secondary);
  color: var(--secondary);
}
.site-footer .sf-pages a {
  background: transparent;
  color: var(--gray);
}
.site-footer .sf-pages a:hover {
  color: var(--secondary);
}
.site-footer .sf-pages li + li::before {
  content: "·";
  margin-right: 0.6rem;
  color: var(--gray);
}
`
  return Component
}
