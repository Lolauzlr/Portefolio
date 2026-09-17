"use client";

import { useState } from "react";
import { socialLinks } from "@/components/SocialIcons";

// Web3Forms access keys are public identifiers meant to be embedded in
// client-side code (see https://docs.web3forms.com) - not a secret.
const WEB3FORMS_ACCESS_KEY = "ef5961a2-2875-452c-9c35-88058bcf4540";
const CONTACT_EMAIL = "marie.chalandre@hotmail.fr";

const FLOATING_LABEL_CLASSES =
  "absolute left-0 top-0 font-[family-name:var(--font-body)] font-semibold text-[12px] tracking-[0.96px] text-white transition-all duration-150 pointer-events-none group-hover:text-[#7FECFB] peer-focus:text-[#8F8F8F] peer-[:placeholder-shown:not(:focus)]:top-[18px] peer-[:placeholder-shown:not(:focus)]:text-[16px] peer-[:placeholder-shown:not(:focus)]:tracking-[1.28px]";

function FormField({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="w-full border-b border-[#8F8F8F] focus-within:border-[#0FD1EA] pb-4 md:pb-6 transition-colors">
      <div className="group relative pt-[18px]">
        <input
          id={name}
          type={type}
          name={name}
          placeholder=" "
          aria-label={label}
          className="peer w-full bg-transparent font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none"
        />
        <label htmlFor={name} className={FLOATING_LABEL_CLASSES}>
          {label}
        </label>
      </div>
    </div>
  );
}

function FormTextArea({ label, name }: { label: string; name: string }) {
  return (
    <div className="w-full border-b border-[#8F8F8F] focus-within:border-[#0FD1EA] pb-4 md:pb-6 transition-colors">
      <div className="group relative pt-[18px]">
        <textarea
          id={name}
          name={name}
          placeholder=" "
          aria-label={label}
          rows={4}
          className="peer w-full bg-transparent resize-none font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none"
        />
        <label htmlFor={name} className={FLOATING_LABEL_CLASSES}>
          {label}
        </label>
      </div>
    </div>
  );
}

function openMailtoFallback(subject: string, body: string, email: string) {
  const params = [
    `subject=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(body)}`,
  ];
  if (email) params.push(`reply-to=${encodeURIComponent(email)}`);
  window.location.href = `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

export default function HomeContactSection() {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const message = (formData.get("message") as string)?.trim() ?? "";

    const subject = "Prise de contact - Portefolio";
    const body = `${message}\n\n${name}`;

    setStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject,
          name,
          email,
          message: body,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Web3Forms request failed");
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      openMailtoFallback(subject, body, email);
    }
  }

  return (
    <section className="bg-[#0D0D10] backdrop-blur-[3.15px] pt-6 md:pt-[40px] pb-[40px] md:pb-[80px] px-3 md:px-[120px]">
      <div className="flex flex-col gap-6 md:gap-[24px]">
        <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[80px] tracking-[3.2px] md:tracking-[6.4px] leading-none text-white uppercase">
          Get in touch
        </h2>

        <div className="flex flex-col md:flex-row gap-6 md:justify-between">
          {/* Left: description + contact */}
          <div className="flex flex-col gap-6 md:gap-[40px] w-full md:w-[470px] md:shrink-0">
            <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
              Interested in my work? Please feel free to get in touch or follow me on social media
            </p>
            <div className="flex flex-col">
              <div className="flex flex-col gap-[10px] items-start self-start">
                <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                  CONTACT
                </h3>
                <div className="w-full h-[4px] bg-[#ddff6e]" />
              </div>
              <a
                href="mailto:marie.chalandre@hotmail.fr"
                className="mt-[24px] font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
              >
                marie.chalandre@hotmail.fr
              </a>
              <div className="mt-[12px] flex items-center gap-4">
                {socialLinks.map(({ Icon, alt, href }) => (
                  <a
                    key={alt}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={alt}
                    className="text-[24px] text-white hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleContactSubmit}
            className="flex flex-col gap-[40px] w-full md:w-[690px] md:shrink-0"
          >
            <div className="flex flex-col gap-6 md:gap-[24px]">
              <FormField label="Name" name="name" />
              <FormField label="Email" name="email" type="email" />
              <FormTextArea label="How can I help you?" name="message" />
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0FD1EA] border-2 border-[#0FD1EA] rounded-[40px] px-[40px] py-[20px] hover:text-[#7FECFB] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] focus:text-[#7FECFB] focus:border-[#7FECFB] focus:bg-[rgba(15,209,234,0.1)] active:text-[#0897A9] active:border-[#0897A9] active:bg-[rgba(8,151,169,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "sending" ? "Sending..." : "Let's talk"}
              </button>
              {status === "success" && (
                <p className="font-[family-name:var(--font-body)] text-[14px] text-[#7FECFB]">
                  Message sent, thank you!
                </p>
              )}
              {status === "error" && (
                <p className="font-[family-name:var(--font-body)] text-[14px] text-[#8F8F8F]">
                  Couldn&apos;t send automatically, opening your mail app instead.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
