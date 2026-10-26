// "Recent posts" list, newest first. Shown only on the home page (slug "index").
// "Newest" means the post's own date (frontmatter `created` / `date`), not when
// it was last edited, so touching up an old post doesn't bump it to the top.
// Hand-written ESM (no build step). Options are set in quartz.config.yaml.
import { h } from "preact"

const css = `
.recent-posts {
  margin: 2.5rem 0 1rem;
}
.recent-posts > h2 {
  margin: 0 0 1rem;
}
.recent-posts > ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.recent-posts > ul > li {
  margin: 0 0 1.25rem;
}
.recent-posts .post-title {
  font-size: 1.1rem;
  font-weight: 600;
}
.recent-posts .post-meta {
  margin: 0.15rem 0 0;
  color: var(--gray);
  font-size: 0.85rem;
}
.recent-posts .post-desc {
  margin: 0.25rem 0 0;
  color: var(--darkgray);
}
`

const defaults = { title: "Recent posts", limit: 5, folder: "posts" }

// Relative link from the current page to a target slug (works from any depth).
function link(from, to) {
  const up = from
    .split("/")
    .filter((s) => s !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return `${up === "" ? "." : up}/${to}`
}

const postDate = (f) => f.dates?.created ?? f.dates?.published ?? f.dates?.modified

function formatDate(d, locale = "en-US") {
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" })
}

export const RecentPosts = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  const Component = ({ allFiles, fileData, cfg }) => {
    if (fileData.slug !== "index") return null

    const prefix = `${opts.folder}/`
    const posts = allFiles
      .filter((f) => typeof f.slug === "string")
      .filter((f) => f.slug.startsWith(prefix) && f.slug !== `${prefix}index`)
      .filter((f) => f.unlisted !== true && f.frontmatter?.draft !== true)
      .sort((a, b) => {
        const da = postDate(a)?.getTime() ?? 0
        const db = postDate(b)?.getTime() ?? 0
        if (db !== da) return db - da // newest first
        return (b.dates?.modified?.getTime() ?? 0) - (a.dates?.modified?.getTime() ?? 0)
      })
      .slice(0, opts.limit)

    if (posts.length === 0) return null

    return h(
      "div",
      { class: "recent-posts" },
      h("h2", null, opts.title),
      h(
        "ul",
        null,
        posts.map((p) => {
          const d = postDate(p)
          return h(
            "li",
            null,
            h(
              "a",
              { class: "internal post-title", href: link(fileData.slug, p.slug) },
              p.frontmatter?.title ?? "Untitled",
            ),
            d &&
              h(
                "p",
                { class: "post-meta" },
                h("time", { datetime: d.toISOString() }, formatDate(d, cfg?.locale)),
              ),
            p.frontmatter?.description && h("p", { class: "post-desc" }, p.frontmatter.description),
          )
        }),
      ),
    )
  }

  Component.css = css
  return Component
}
