// Fixed full-page wallpaper behind the whole site.
//
//  - Everyone gets a small still image (`poster`). It is the only thing phones,
//    slow connections, and "save data" users ever download.
//  - On wide screens, a silent looping video (`video`) is added on top of the
//    still, unless the visitor asked their system for reduced motion or data
//    saving. Add ?motion=on to the address to force the video (and ?motion=off
//    to turn it back off); the choice is remembered in this browser.
//
// The layer is position: fixed and sits behind everything else. Its darkening
// and tinting are plain CSS in quartz/styles/custom.scss (.wp-scrim).
//
// Hand-written ESM (no build step). Options go in quartz.config.yaml.
import { h } from "preact"

const defaults = { poster: "", video: "", minWidth: 1000, alternates: {} }

export const SiteWallpaper = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  const Component = ({ displayClass }) => {
    if (!opts.poster) return null
    return h(
      "div",
      {
        class: ["site-wallpaper", displayClass].filter(Boolean).join(" "),
        "aria-hidden": "true",
        "data-video": opts.video || "",
        "data-min-width": String(opts.minWidth),
        "data-poster": opts.poster,
        // other named wallpapers, selectable with ?wallpaper=name (for previewing choices)
        "data-alternates": JSON.stringify(opts.alternates || {}),
      },
      h("img", { class: "wp-still", src: opts.poster, alt: "", decoding: "async" }),
      h("div", { class: "wp-scrim" }),
    )
  }

  Component.css = `
.site-wallpaper {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--light);
}
.site-wallpaper .wp-still,
.site-wallpaper .wp-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.site-wallpaper .wp-video {
  opacity: 0;
  transition: opacity 1.2s ease;
}
.site-wallpaper .wp-video.ready {
  opacity: 1;
}
`

  // Runs in the browser after the page loads (and again after each in-site navigation).
  Component.afterDOMLoaded = `
    (function () {
      function setup() {
        var wp = document.querySelector(".site-wallpaper");
        if (!wp || wp.querySelector("video")) return;

        // ?wallpaper=name picks one of the configured alternates (preview only)
        try {
          var pick = new URLSearchParams(location.search).get("wallpaper");
          if (pick) localStorage.setItem("wallpaper-pick", pick);
          pick = localStorage.getItem("wallpaper-pick");
          var alts = JSON.parse(wp.getAttribute("data-alternates") || "{}");
          if (pick && alts[pick]) {
            wp.setAttribute("data-video", alts[pick].video || "");
            wp.setAttribute("data-poster", alts[pick].poster || "");
            var still = wp.querySelector(".wp-still");
            if (still && alts[pick].poster) still.src = alts[pick].poster;
          }
        } catch (e) {}

        var src = wp.getAttribute("data-video");
        if (!src) return;

        var force = null;
        try {
          var q = new URLSearchParams(location.search).get("motion");
          if (q === "on" || q === "off") localStorage.setItem("wallpaper-motion", q);
          force = localStorage.getItem("wallpaper-motion");
        } catch (e) {}

        var minWidth = parseInt(wp.getAttribute("data-min-width") || "1000", 10);
        var wide = window.matchMedia("(min-width: " + minWidth + "px)").matches;
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var saveData = !!(navigator.connection && navigator.connection.saveData);

        var allow = force === "on" || (force !== "off" && wide && !reduced && !saveData);
        if (force === "on" && !wide) allow = false; // never push video onto small screens
        if (!allow) return;

        var v = document.createElement("video");
        v.className = "wp-video";
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
        v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
        v.preload = "auto";
        v.poster = wp.getAttribute("data-poster") || "";
        v.addEventListener("canplay", function () { v.classList.add("ready"); v.play().catch(function () {}); }, { once: true });
        v.src = src;
        wp.insertBefore(v, wp.querySelector(".wp-scrim"));

        // pause when the tab is hidden to save battery
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) v.pause(); else v.play().catch(function () {});
        });
      }
      document.addEventListener("nav", setup);
      setup();
    })();
  `

  return Component
}
