// "Subscribe to Chaos" box shown at the bottom of every post: pages under
// /<folder>/, but not the folder's own listing page. Hand-written ESM (no build
// step). Text and the Kit form URL are set in quartz.config.yaml under this
// plugin's `options:`.
import { h } from "preact"

const css = `
.post-signup {
  margin: 3rem 0 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 8px;
}
.post-signup h3,
.post-signup .signup-title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark);
}
.post-signup p {
  margin: 0 0 1rem;
  color: var(--darkgray);
}
.post-signup form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.post-signup input[type="email"] {
  flex: 1 1 14rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray);
  border-radius: 6px;
  background: var(--light);
  color: var(--dark);
  font: inherit;
}
.post-signup button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--secondary);
  border-radius: 6px;
  background: var(--secondary);
  color: var(--light);
  font: inherit;
  cursor: pointer;
}
.post-signup button:hover {
  opacity: 0.9;
}
`

const defaults = {
  formAction: "",
  folder: "posts",
  heading: "Chaos Theory",
  text: "Letters, stories, and updates from behind the curtain, delivered to your inbox.",
  placeholder: "Email Address",
  button: "Subscribe to Chaos",
}

export const PostSignup = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  const Component = ({ fileData }) => {
    const slug = fileData.slug ?? ""
    const prefix = `${opts.folder}/`
    const isPost = slug.startsWith(prefix) && slug !== `${prefix}index`
    if (!isPost || !opts.formAction) return null

    return h(
      "div",
      { class: "post-signup" },
      h("h3", null, opts.heading),
      h("p", null, opts.text),
      h(
        "form",
        { action: opts.formAction, method: "post" },
        h("input", {
          type: "email",
          name: "email_address",
          "aria-label": opts.placeholder,
          placeholder: opts.placeholder,
          required: true,
        }),
        h("button", { type: "submit" }, opts.button),
      ),
    )
  }

  Component.css = css
  return Component
}
