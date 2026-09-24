"use client";

import { useState, type FormEvent } from "react";

export default function FooterNewsletter() {
  const [status, setStatus] = useState("");

  function requestUpdates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const email = (new FormData(form).get("email") as string).trim();
    const subject = encodeURIComponent("KenyalangKu studio updates request");
    const body = encodeURIComponent(`Please keep ${email} informed about future KenyalangKu studio updates.`);
    setStatus("Your email app will open with a request. Send it to complete your request.");
    window.location.href = `mailto:kenyalangku@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <form id="studio-updates" action="mailto:kenyalangku@gmail.com" method="post" encType="text/plain" onSubmit={requestUpdates}>
      <label className="kk-footer__sr-only" htmlFor="studio-updates-email">Your email address</label>
      <div className="kk-footer__email-row">
        <input id="studio-updates-email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
        <button type="submit">Get updates</button>
      </div>
      <p className="kk-footer__form-note">Opens your email app to request updates.</p>
      <p className="kk-footer__form-status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
