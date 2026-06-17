import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? "/Portefolio" : "",
  assetPrefix: isGithubPages ? "/Portefolio/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/Portefolio" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
