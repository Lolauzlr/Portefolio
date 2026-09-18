"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { socialLinks } from "@/components/SocialIcons";

// Web3Forms access keys are public identifiers meant to be embedded in
// client-side code (see https://docs.web3forms.com) - not a secret.
const WEB3FORMS_ACCESS_KEY = "ef5961a2-2875-452c-9c35-88058bcf4540";
const CONTACT_EMAIL = "mariechalandre.pro@gmail.com";
const SNACKBAR_AUTO_DISMISS_MS = 5000;

function XCircleFillIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

function CopySimpleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M184,72V216H40V72Z" opacity="0.2" />
      <path d="M184,64H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V72A8,8,0,0,0,184,64Zm-8,144H48V80H176ZM224,40V184a8,8,0,0,1-16,0V48H72a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40Z" />
    </svg>
  );
}

const FLOATING_LABEL_CLASSES =
  "absolute left-0 top-0 font-[family-name:var(--font-body)] font-semibold text-[12px] tracking-[0.96px] text-white transition-all duration-150 pointer-events-none group-hover:text-[#7FECFB] peer-focus:text-[#8F8F8F] peer-[:placeholder-shown:not(:focus)]:top-[18px] peer-[:placeholder-shown:not(:focus)]:text-[16px] peer-[:placeholder-shown:not(:focus)]:tracking-[1.28px]";

function ClearFieldButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={-1}
      className="absolute right-0 top-[18px] text-[#8F8F8F] hover:text-[#7FECFB] transition-colors"
    >
      <XCircleFillIcon className="w-5 h-5" />
    </button>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onClear,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="w-full border-b border-[#8F8F8F] focus-within:border-[#0FD1EA] pb-4 md:pb-6 transition-colors">
      <div className="group relative pt-[18px]">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-label={label}
          className="peer w-full bg-transparent pr-8 font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none"
        />
        <label htmlFor={name} className={FLOATING_LABEL_CLASSES}>
          {label}
        </label>
        {value && <ClearFieldButton label={`Clear ${label}`} onClick={onClear} />}
      </div>
    </div>
  );
}

function FormTextArea({
  label,
  name,
  value,
  onChange,
  onClear,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="w-full border-b border-[#8F8F8F] focus-within:border-[#0FD1EA] pb-4 md:pb-6 transition-colors">
      <div className="group relative pt-[18px]">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-label={label}
          rows={4}
          className="peer w-full bg-transparent resize-none pr-8 font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none"
        />
        <label htmlFor={name} className={FLOATING_LABEL_CLASSES}>
          {label}
        </label>
        {value && <ClearFieldButton label={`Clear ${label}`} onClick={onClear} />}
      </div>
    </div>
  );
}

type SendStatus = "idle" | "sending";
type SnackbarState = { icon: "success" | "error"; message: string; oneLine?: boolean } | null;

function Snackbar({
  icon,
  message,
  oneLine,
  onClose,
}: {
  icon: "success" | "error";
  message: string;
  oneLine?: boolean;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 z-50 flex gap-3 rounded-[12px] border border-[#2E2F38] bg-[#1C1D24] px-5 py-4 shadow-lg shadow-black/40 md:left-auto md:right-6 md:bottom-6 md:max-w-[420px] ${
        oneLine ? "items-center" : "items-start"
      }`}
    >
      <img
        src={asset(icon === "success" ? "/images/icons/smiley.svg" : "/images/icons/smiley-x-eyes.svg")}
        alt=""
        width={24}
        height={24}
        className={`shrink-0 ${oneLine ? "" : "mt-0.5"}`}
      />
      <p className="flex-1 font-[family-name:var(--font-body)] text-[14px] tracking-[1.12px] text-white">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="self-center shrink-0 text-[#8F8F8F] hover:text-[#7FECFB] transition-colors"
      >
        <XCircleFillIcon className="w-5 h-5" />
      </button>
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

export default function HomeContactSection() {
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!snackbar) return;
    dismissTimer.current = setTimeout(() => setSnackbar(null), SNACKBAR_AUTO_DISMISS_MS);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [snackbar]);

  function showSnackbar(next: SnackbarState) {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSnackbar(next);
  }

  function closeSnackbar() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSnackbar(null);
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      showSnackbar({ icon: "success", message: "Copied!", oneLine: true });
    } catch {
      // clipboard access denied or unavailable - nothing to show, mailto link still works
    }
  }

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const subject = "Prise de contact - Portefolio";
    const body = `${message.trim()}\n\n${name.trim()}`;

    setSendStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject,
          email: email.trim(),
          message: body,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Web3Forms request failed");
      }
      setSendStatus("idle");
      showSnackbar({ icon: "success", message: "Message sent, thank you! I'll get back to you as soon as possible." });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setSendStatus("idle");
      showSnackbar({
        icon: "error",
        message: "Oh no, I didn't receive your message! Please try again or reach out to me on social media.",
      });
      openMailtoFallback(subject, body, email.trim());
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-[120px] bg-[#0D0D10] backdrop-blur-[3.15px] pt-6 md:pt-[40px] pb-[40px] md:pb-[80px] px-3 md:px-[120px]"
    >
      <div className="flex flex-col gap-6 md:gap-[24px]">
        <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[80px] tracking-[3.2px] md:tracking-[6.4px] leading-none text-white uppercase">
          Get in touch
        </h2>

        <div className="flex flex-col md:flex-row gap-6 md:justify-between">
          {/* Left: description + contact */}
          <div className="flex flex-col gap-6 md:gap-[40px] w-full md:w-[470px] md:shrink-0">
            <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
              Interested in my work? Please feel free to get in touch or follow me on social media.
            </p>
            <div className="flex flex-col">
              <div className="flex flex-col gap-[10px] items-start self-start">
                <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                  CONTACT
                </h3>
                <div className="w-full h-[4px] bg-[#ddff6e]" />
              </div>
              <div className="mt-[24px] flex items-center gap-1">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="text-white hover:text-[#7FECFB] transition-colors"
                >
                  <CopySimpleIcon className="w-5 h-5" />
                </button>
              </div>
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
              <FormField label="Name" name="name" value={name} onChange={setName} onClear={() => setName("")} />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                onClear={() => setEmail("")}
              />
              <FormTextArea
                label="How can I help you?"
                name="message"
                value={message}
                onChange={setMessage}
                onClear={() => setMessage("")}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sendStatus === "sending"}
                className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0FD1EA] border-2 border-[#0FD1EA] rounded-[40px] px-[40px] py-[20px] hover:text-[#7FECFB] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] focus:text-[#7FECFB] focus:border-[#7FECFB] focus:bg-[rgba(15,209,234,0.1)] active:text-[#0897A9] active:border-[#0897A9] active:bg-[rgba(8,151,169,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendStatus === "sending" ? "Sending..." : "Let's talk"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {snackbar && (
        <Snackbar
          icon={snackbar.icon}
          message={snackbar.message}
          oneLine={snackbar.oneLine}
          onClose={closeSnackbar}
        />
      )}
    </section>
  );
}
