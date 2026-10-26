// Top navigation links for the site bar, plus the default theme for first-time
// visitors. Hand-written ESM (no build step). Links are set in
// quartz.config.yaml under this plugin's `options:`.
//
// Each link: { label: "books", href: "#books" }
//   href is relative to the site root, e.g. "" (home), "posts/", "#books",
//   "posts/" or "#subscribe". An optional `pill: true` styles it as a button.
import { h } from "preact"

const defaults = {
  links: [
    { label: "home", href: "" },
    { label: "posts", href: "posts/" },
  ],
  defaultTheme: "dark",
}

// "../" prefixes needed to get from the current page back to the site root
function toRoot(slug) {
  const depth = slug.split("/").filter((s) => s !== "").length - 1
  return depth <= 0 ? "./" : "../".repeat(depth)
}

export const SiteNav = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  const Component = ({ fileData, displayClass }) => {
    const slug = fileData.slug ?? "index"
    const root = toRoot(slug)
    const cls = ["site-nav", displayClass].filter(Boolean).join(" ")
    return h(
      "nav",
      { class: cls, "aria-label": "Main" },
      opts.links.map((l) => {
        const href = root + (l.href ?? "")
        const isHome = (l.href ?? "") === ""
        const section = (l.href ?? "").replace(/\/$/, "")
        const current = !l.href?.includes("#") && (isHome ? slug === "index" : section !== "" && slug.startsWith(section))
        return h("a", { href, class: ["site-nav-link", l.pill ? "pill" : "", current ? "current" : ""].filter(Boolean).join(" ") }, l.label)
      }),
    )
  }

  // Runs in <head> before the page paints. First-time visitors (no saved choice)
  // get the configured default theme instead of whatever their computer prefers;
  // anyone who has used the toggle keeps their own choice.
  Component.beforeDOMLoaded = `
    try {
      // Preview only: ?accent=blue|sapphire|teal|green|peach|mauve tries an accent color.
      var A = {
        mauve:    { d: ["#cba6f7", "#f5c2e7", "203,166,247"], l: ["#8839ef", "#ea76cb", "136,57,239"] },
        blue:     { d: ["#89b4fa", "#89dceb", "137,180,250"], l: ["#1e66f5", "#04a5e5", "30,102,245"] },
        sapphire: { d: ["#74c7ec", "#89dceb", "116,199,236"], l: ["#209fb5", "#04a5e5", "32,159,181"] },
        teal:     { d: ["#94e2d5", "#a6e3a1", "148,226,213"], l: ["#179299", "#40a02b", "23,146,153"] },
        green:    { d: ["#a6e3a1", "#94e2d5", "166,227,161"], l: ["#40a02b", "#179299", "64,160,43"] },
        peach:    { d: ["#fab387", "#f9e2af", "250,179,135"], l: ["#fe640b", "#df8e1d", "254,100,11"] }
      };
      var aq = new URLSearchParams(location.search).get("accent");
      if (aq && A[aq]) localStorage.setItem("accent-preview", aq);
      if (aq === "default") localStorage.removeItem("accent-preview");
      var ap = localStorage.getItem("accent-preview");
      if (ap && A[ap]) {
        var mk = function (m, c) {
          return 'html:root[saved-theme="' + m + '"]{--secondary:' + c[0] + ' !important;--tertiary:' + c[1] + ' !important;--accent-rgb:' + c[2] + ' !important;--highlight:rgba(' + c[2] + ',0.14) !important;}';
        };
        var st = document.createElement("style");
        st.id = "accent-preview";
        st.textContent = mk("dark", A[ap].d) + mk("light", A[ap].l);
        document.head.appendChild(st);
      }
    } catch (e) {}
    try {
      // ?theme=light or ?theme=dark in the address bar sets (and remembers) the theme
      var q = new URLSearchParams(location.search).get("theme");
      if (q === "light" || q === "dark") localStorage.setItem("theme", q);
      if (!localStorage.getItem("theme")) {
        localStorage.setItem("theme", ${JSON.stringify(opts.defaultTheme)});
      }
      document.documentElement.setAttribute("saved-theme", localStorage.getItem("theme"));
    } catch (e) {}
  `

  Component.css = `
.site-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  font-family: var(--headerFont);
  font-size: 0.85rem;
}
.site-nav-link {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  color: var(--darkgray);
  background: transparent !important;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}
.site-nav-link:hover {
  color: var(--dark);
  background: var(--highlight) !important;
}
.site-nav-link.current {
  color: var(--secondary);
  background: var(--highlight) !important;
}
.site-nav-link.pill {
  color: var(--light);
  background: var(--secondary) !important;
}
.site-nav-link.pill:hover {
  color: var(--light);
  opacity: 0.9;
}
`
  return Component
}
