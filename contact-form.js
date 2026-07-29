// Handles the contact form's submission without navigating away to a
// separate "thank you" page. If JS fails to load or an error occurs
// before this runs, the form still works via a normal POST to its
// action/method attributes — this is a progressive enhancement on top
// of that, not a requirement for the form to function.
//
// ABOUT THE BACKEND: a plain static site (HTML/CSS/JS with no server)
// has nowhere to actually receive and send this form's data — the
// <form action="..."> needs to point at *something* that can turn a
// submission into an email. This file is written for Formspree
// (https://formspree.io), a free-tier-available service built for
// exactly this: you sign up, create a form, and get a URL to paste into
// contact.html's <form action="...">. No server code needed on your
// end. A couple of alternatives if you'd rather use something else:
//   - Netlify Forms: if you end up hosting on Netlify, add
//     data-netlify="true" to the <form> and a hidden
//     <input name="form-name" value="contact">, and Netlify handles
//     the rest automatically — no external service or endpoint needed
//     at all, and this file's fetch() call still works unmodified.
//   - Your own backend/serverless function that emails you (e.g. via
//     SendGrid, Resend, Mailgun) — more setup, but full control. Point
//     the form's action at that endpoint instead.

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    status.textContent = "Sending…";
    status.className = "form-status";

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      status.textContent = "Thanks — your message has been sent.";
      status.className = "form-status is-success";
      form.reset();
    } catch (err) {
      console.error("Contact form submission failed:", err);
      status.textContent = "Something went wrong — please email hello@annemarieschubert.com directly.";
      status.className = "form-status is-error";
    } finally {
      submitButton.disabled = false;
    }
  });
}

initContactForm();
