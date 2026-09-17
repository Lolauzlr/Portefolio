"use client";

import { socialLinks } from "@/components/SocialIcons";

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
      <input
        type={type}
        name={name}
        placeholder={label}
        aria-label={label}
        className="w-full bg-transparent font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none placeholder:text-[#8F8F8F] placeholder:font-semibold hover:placeholder:text-[#7FECFB] focus:placeholder:text-[#8F8F8F] active:placeholder:text-[#0FD1EA] transition-colors"
      />
    </div>
  );
}

function FormTextArea({ label, name }: { label: string; name: string }) {
  return (
    <div className="w-full border-b border-[#8F8F8F] focus-within:border-[#0FD1EA] pb-4 md:pb-6 transition-colors">
      <textarea
        name={name}
        placeholder={label}
        aria-label={label}
        rows={4}
        className="w-full bg-transparent resize-none font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] text-white outline-none placeholder:text-[#8F8F8F] placeholder:font-semibold hover:placeholder:text-[#7FECFB] focus:placeholder:text-[#8F8F8F] active:placeholder:text-[#0FD1EA] transition-colors"
      />
    </div>
  );
}

export default function HomeContactSection() {
  return (
    <section className="bg-[#0D0D10] backdrop-blur-[3.15px] pt-6 md:pt-[40px] pb-[40px] md:pb-[80px] px-3 md:px-[120px]">
      <div className="flex flex-col gap-6 md:gap-[24px]">
        <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[80px] tracking-[3.2px] md:tracking-[6.4px] leading-none text-white">
          Contact me
        </h2>

        <div className="flex flex-col md:flex-row gap-6 md:gap-[40px]">
          {/* Left: description + contact */}
          <div className="flex flex-col gap-6 md:gap-[40px] flex-1">
            <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
              Interested in my work? Please feel free to get in touch or follow me on social media
            </p>
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col gap-[10px] items-start">
                <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                  CONTACT
                </h3>
                <div className="w-full h-[4px] bg-[#ddff6e]" />
              </div>
              <div className="flex items-center gap-4">
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
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6 md:gap-[24px] flex-1"
          >
            <FormField label="Name" name="name" />
            <FormField label="Email" name="email" type="email" />
            <FormTextArea label="How can I help you?" name="message" />
          </form>
        </div>
      </div>
    </section>
  );
}
