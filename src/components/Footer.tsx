import Link from "next/link";
import { asset } from "@/lib/asset";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Trailer", href: "/trailer" },
  { label: "Movies", href: "/movies" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Storyboard", href: "/storyboard" },
  { label: "Curriculum vitae", href: "/cv" },
];

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8524 0.181641C18.6772 0.186549 18.7878 0.210259 19.3397 0.290039C20.4792 0.454397 21.4356 0.909386 22.2176 1.65625C22.6557 2.07779 22.9576 2.49 23.2293 3.04199C23.5605 3.71645 23.7241 4.35482 23.7987 5.30371C23.8147 5.50734 23.8211 8.74836 23.8211 11.9912C23.8211 15.2336 23.8147 18.4809 23.7987 18.6846C23.725 19.6183 23.5619 20.2621 23.241 20.9238C22.6029 22.24 21.4306 23.2 20.0145 23.5654C19.5009 23.6982 19.0361 23.7602 18.2362 23.7979C17.9506 23.8124 14.9655 23.8164 11.9803 23.8164C8.99566 23.8164 6.01253 23.8076 5.71858 23.7949C5.02769 23.7622 4.48904 23.6928 4.00178 23.5674C2.59465 23.2037 1.40062 22.2288 0.775222 20.9307C0.447998 20.2526 0.293567 19.6327 0.211746 18.6475C0.18811 18.3675 0.182449 16.9251 0.182449 11.9941C0.182448 10.333 0.180631 9.09435 0.182449 8.15332C0.187176 5.3307 0.209903 5.21755 0.289871 4.66504C0.454399 3.52658 0.90913 2.56855 1.65901 1.79004C2.07081 1.36314 2.48835 1.05862 3.01741 0.795898C3.70388 0.454105 4.33394 0.294148 5.34651 0.209961C5.62705 0.186688 7.07093 0.181641 12.0057 0.181641H15.8524ZM11.9979 3.27246C9.62937 3.27247 9.33166 3.28285 8.4012 3.3252C7.47234 3.36773 6.83784 3.51473 6.28303 3.73047C5.70911 3.95336 5.22217 4.25212 4.73714 4.7373C4.2517 5.2224 3.95295 5.70938 3.72932 6.2832C3.513 6.83825 3.36586 7.47273 3.32405 8.40137C3.28242 9.33222 3.27132 9.6299 3.27132 12C3.27132 14.3702 3.28187 14.6668 3.32405 15.5977C3.36677 16.5266 3.51373 17.161 3.72932 17.7158C3.95239 18.2898 4.25098 18.7767 4.73616 19.2617C5.22105 19.7472 5.70844 20.0466 6.28206 20.2695C6.83721 20.4853 7.47159 20.6323 8.40022 20.6748C9.33102 20.7172 9.62834 20.7275 11.9979 20.7275C14.3678 20.7275 14.665 20.7172 15.5955 20.6748C16.5246 20.6323 17.1604 20.4853 17.7157 20.2695C18.2893 20.0467 18.7748 19.747 19.2596 19.2617C19.745 18.7766 20.0438 18.2896 20.2674 17.7158C20.4819 17.1608 20.6291 16.5263 20.6727 15.5977C20.7145 14.6669 20.7254 14.37 20.7254 12C20.7254 9.62984 20.7145 9.33227 20.6727 8.40137C20.629 7.47234 20.4819 6.83809 20.2674 6.2832C20.0438 5.70922 19.745 5.22238 19.2596 4.7373C18.7742 4.25198 18.2891 3.95316 17.7147 3.73047C17.1584 3.51468 16.5236 3.36774 15.5946 3.3252C14.664 3.28284 14.3674 3.27246 11.9979 3.27246ZM11.2166 4.8457C11.4489 4.84534 11.7086 4.8457 11.9998 4.8457C14.3295 4.8457 14.6061 4.85369 15.5262 4.89551C16.3768 4.93444 16.8387 5.07685 17.1463 5.19629C17.5535 5.35445 17.844 5.54324 18.1492 5.84863C18.4546 6.15404 18.6431 6.44536 18.8016 6.85254C18.921 7.15981 19.0636 7.62175 19.1024 8.47266C19.1442 9.3926 19.1532 9.66902 19.1532 11.998C19.1532 14.3271 19.1442 14.6035 19.1024 15.5234C19.0635 16.3743 18.921 16.8363 18.8016 17.1436C18.6434 17.5507 18.4546 17.8413 18.1492 18.1465C17.8439 18.4518 17.5536 18.6407 17.1463 18.7988C16.8391 18.9188 16.3768 19.0607 15.5262 19.0996C14.6063 19.1414 14.3295 19.1504 11.9998 19.1504C9.66954 19.1504 9.39246 19.1414 8.47249 19.0996C7.62191 19.0603 7.16013 18.9183 6.85237 18.7988C6.44511 18.6406 6.15391 18.451 5.84846 18.1455C5.54322 17.8402 5.3546 17.5499 5.19612 17.1426C5.07667 16.8353 4.93406 16.3733 4.89534 15.5225C4.85354 14.6027 4.84456 14.3262 4.84456 11.9961C4.84456 9.66581 4.85353 9.39046 4.89534 8.4707C4.93425 7.61979 5.07667 7.15725 5.19612 6.84961C5.3542 6.44274 5.54333 6.1519 5.84846 5.84668C6.15389 5.54124 6.44514 5.3519 6.85237 5.19336C7.15995 5.07338 7.62188 4.9317 8.47249 4.89258C9.27755 4.85621 9.59013 4.84557 11.2166 4.84375V4.8457ZM11.9998 7.51855C9.52482 7.51855 7.51742 9.52492 7.51741 12C7.51741 14.4751 9.52482 16.4805 11.9998 16.4805C14.4746 16.4802 16.4803 14.4749 16.4803 12C16.4803 9.52508 14.4746 7.51881 11.9998 7.51855ZM11.9998 9.09082C13.6061 9.09108 14.908 10.3934 14.908 12C14.908 13.6064 13.6061 14.9089 11.9998 14.9092C10.3932 14.9092 9.09065 13.6065 9.09065 12C9.09067 10.3933 10.3932 9.09082 11.9998 9.09082ZM16.658 6.29492C16.0799 6.29492 15.6102 6.76343 15.6102 7.3418C15.6104 7.91983 16.08 8.38867 16.658 8.38867C17.236 8.38852 17.7047 7.91974 17.7049 7.3418C17.7049 6.76371 17.2361 6.29507 16.658 6.29492Z" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.6667 20.6667H17.1053V14.6008C17.1053 12.9376 16.4733 12.0082 15.157 12.0082C13.7249 12.0082 12.9768 12.9754 12.9768 14.6008V20.6667H9.54451V9.11118H12.9768V10.6677C12.9768 10.6677 14.0087 8.75814 16.4609 8.75814C18.912 8.75814 20.6667 10.2549 20.6667 13.3505V20.6667ZM5.44985 7.59807C4.28075 7.59807 3.3334 6.64328 3.3334 5.46573C3.3334 4.28818 4.28075 3.3334 5.44985 3.3334C6.61894 3.3334 7.56573 4.28818 7.56573 5.46573C7.56573 6.64328 6.61894 7.59807 5.44985 7.59807ZM3.67758 20.6667H7.25653V9.11118H3.67758V20.6667ZM2.66667 24H21.3333C22.8061 24 24 22.8061 24 21.3333V2.66667C24 1.19391 22.8061 0 21.3333 0H2.66667C1.19391 0 0 1.19391 0 2.66667V21.3333C0 22.8061 1.19391 24 2.66667 24Z" fill="currentColor" />
    </svg>
  );
}

function ArtstationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 17.723L2.027 21.228H2.028C2.22997 21.6287 2.53921 21.9655 2.92128 22.2008C3.30336 22.4362 3.74326 22.5609 4.192 22.561H17.649L14.857 17.723H0ZM24 17.748C24 17.264 23.857 16.813 23.612 16.434L15.728 2.72796C15.5218 2.33878 15.2134 2.01313 14.836 1.78603C14.4586 1.55892 14.0265 1.43894 13.586 1.43896H9.419L21.598 22.54L23.518 19.215C23.896 18.578 24 18.296 24 17.748ZM12.871 14.286L7.428 4.85796L1.984 14.286H12.871Z" fill="currentColor" />
    </svg>
  );
}

const socials = [
  { Icon: InstagramIcon, alt: "Instagram", href: "https://www.instagram.com/m_chalandre/?hl=fr" },
  { Icon: LinkedInIcon, alt: "LinkedIn", href: "https://www.linkedin.com/in/marie-chalandre-076948103/" },
  { Icon: ArtstationIcon, alt: "ArtStation", href: "https://www.artstation.com/mariechalandre" },
];

export default function Footer() {
  return (
    <footer className="backdrop-blur-[3.15px] bg-black/40 py-[40px] px-4 md:px-[120px]">
      <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-[40px]">
        {/* Left: Logo */}
        <div className="flex flex-row md:self-stretch shrink-0">
          <div className="flex flex-col items-start justify-center pr-0 md:pr-[80px] md:border-r border-[#797979] md:h-full">
            <img
              src={asset("/images/logo-svg/LogoMC.svg")}
              alt="Marie Chalandre"
              width={162}
              height={47}
            />
          </div>
        </div>

        {/* Center + Right */}
        <div className="flex flex-1 flex-col md:flex-row items-start justify-between w-full gap-10 md:gap-[40px]">
          {/* Explore */}
          <div className="flex flex-col gap-[24px] items-start">
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                EXPLORE
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-wrap gap-[16px]">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-[24px] items-start">
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                CONTACT
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-col gap-[12px] items-start">
              <a
                href="mailto:marie.chalandre@hotmail.fr"
                className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
              >
                marie.chalandre@hotmail.fr
              </a>
              <div className="flex items-center gap-[16px]">
                {socials.map(({ Icon, alt, href }) => (
                  <a
                    key={alt}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={alt}
                    className="text-white hover:text-[#0FD1EA] focus:text-[#0FD1EA] active:text-[#0897A9] transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
