import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? "/portefolio" : "",
  assetPrefix: isGithubPages ? "/portefolio/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
