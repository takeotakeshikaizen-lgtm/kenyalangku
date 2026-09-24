"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

export default function ContactForm() {
  const [emailDraft, setEmailDraft] = useState<{
    url: string;
    body: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "General hello");
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) return;
    const body = `Hello Syahmir,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}\nInterest: ${topic}`;
    setEmailDraft({
      url: `mailto:kenyalangku@gmail.com?subject=${encodeURIComponent(`KenyalangKu — ${topic}`)}&body=${encodeURIComponent(body)}`,
      body,
    });
    setCopied(false);
    setCopyError(false);
  }

  return (
    <form
      className="contact-form"
      onSubmit={prepare}
      onChange={() => setEmailDraft(null)}
    >
      <div className="form-heading">
        <h2>Start a conversation.</h2>
        <span>01 — SAY HELLO</span>
      </div>
      <div className="form-row">
        <label>
          Your name
          <input
            name="name"
            placeholder="What should we call you?"
            autoComplete="name"
            required
            maxLength={100}
            pattern=".*\S.*"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            maxLength={200}
          />
        </label>
      </div>
      <label>
        I’d like to talk about
        <select name="topic" defaultValue="Collaboration">
          <option>Collaboration</option>
          <option>Investment & publishing</option>
          <option>Creative work</option>
          <option>Press & media</option>
          <option>General hello</option>
        </select>
      </label>
      <label>
        A little about your idea
        <textarea
          name="message"
          placeholder="Tell us what you have in mind…"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          onInput={(event) =>
            event.currentTarget.setCustomValidity(
              event.currentTarget.value.trim().length < 10
                ? "Please include at least 10 characters about your idea."
                : "",
            )
          }
        />
      </label>
      <div className="form-submit">
        <button className="button button-dark" type="submit">
          Prepare my email <ArrowUpRight size={17} />
        </button>
        <p>
          Your message stays in your browser.
          <br />
          You’ll send it through your email app.
        </p>
      </div>
      {emailDraft && (
        <div className="email-draft" role="status">
          <Check size={20} />
          <div>
            <h3>Your email is ready.</h3>
            <p>
              Open your email app to review and send it to
              kenyalangku@gmail.com. Nothing has been sent yet.
            </p>
            <div className="draft-actions">
              <a className="text-link" href={emailDraft.url}>
                Open email app <ArrowUpRight size={16} />
              </a>
              <button
                type="button"
                className="text-link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(emailDraft.body);
                    setCopied(true);
                    setCopyError(false);
                  } catch {
                    setCopyError(true);
                  }
                }}
              >
                <Copy size={15} />
                {copied ? "Copied!" : "Copy message"}
              </button>
            </div>
            {copyError && (
              <p>
                Copy is unavailable here. Select the text below to copy it
                manually.
              </p>
            )}
            <details>
              <summary>Preview your message</summary>
              <pre>{emailDraft.body}</pre>
            </details>
          </div>
        </div>
      )}
    </form>
  );
}
