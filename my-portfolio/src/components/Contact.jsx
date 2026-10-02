import { useState } from "react";
import useReveal from "../hooks/useReveal";

// Replace YOUR_FORM_ID with the ID from formspree.io (see Phase 7)
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const ref = useReveal();

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container reveal" ref={ref}>
        <div className="contact-wrap">
          <h2 className="section-title">Get in touch</h2>
          <p className="contact-intro">
            Have a project, an opportunity, or just want to say hi? Send me a
            message.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            {status === "success" && (
              <p className="form-status success" role="status">
                Thanks! Your message was sent.
              </p>
            )}
            {status === "error" && (
              <p className="form-status error" role="alert">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>

          <div className="social-links">
            <a href="mailto:you@example.com">Email</a>
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/your-username"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
