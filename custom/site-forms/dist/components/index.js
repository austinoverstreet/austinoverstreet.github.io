// Background form sending. Renders nothing; it only ships a small script.
//
// Any <form data-ajax-form data-success="Message to show"> on the page is sent
// with fetch() instead of a normal page-changing submit, and the thank-you (or
// an error) appears in place of the form. If JavaScript is unavailable the form
// still works as a plain form post, so nothing is lost.
//
// Used by the contact form (Formspree). Hand-written ESM (no build step).

export const SiteForms = () => {
  const Component = () => null

  Component.afterDOMLoaded = `
    (function () {
      function enhance() {
        document.querySelectorAll("form[data-ajax-form]").forEach(function (form) {
          if (form.__enhanced) return;
          form.__enhanced = true;

          form.addEventListener("submit", function (ev) {
            ev.preventDefault();
            var button = form.querySelector("button[type=submit]");
            var note = form.querySelector(".form-status");
            if (!note) {
              note = document.createElement("p");
              note.className = "form-status";
              note.setAttribute("role", "status");
              form.appendChild(note);
            }
            if (button) { button.disabled = true; button.dataset.label = button.textContent; button.textContent = "Sending..."; }
            note.textContent = "";
            note.classList.remove("error");

            fetch(form.action, {
              method: "POST",
              body: new FormData(form),
              headers: { Accept: "application/json" }
            }).then(function (res) {
              if (!res.ok) throw new Error("bad response " + res.status);
              // Some form services answer 200 but say "success: false" in the body
              // (for example, a form that has not been activated yet). Treat that as a failure.
              return res.json().catch(function () { return null; });
            }).then(function (data) {
              if (data && (data.success === false || String(data.success).toLowerCase() === "false")) {
                throw new Error("service reported failure");
              }
              var done = document.createElement("div");
              done.className = "form-done";
              done.setAttribute("role", "status");
              done.textContent = form.getAttribute("data-success") || "Thank you! Your message has been sent.";
              form.replaceWith(done);
            }).catch(function () {
              note.textContent = "Sorry, that did not go through. Please try again, or email me directly using the address above.";
              note.classList.add("error");
              if (button) { button.disabled = false; button.textContent = button.dataset.label || "Send message"; }
            });
          });
        });
      }
      document.addEventListener("nav", enhance);
      enhance();
    })();
  `
  return Component
}
