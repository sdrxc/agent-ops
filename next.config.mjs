/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  

  // Fix cross-origin warning for cloud environments
  allowedDevOrigins: [
    "f786f1dcd642439cb70a178efd1a970f-27dabb75ff0946139816c168e.fly.dev",
    // Add any other origins if needed
  ],

  // Optimize compilation performance
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Environment variables
  env: {
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },

  // Webpack optimizations for faster builds
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      // Faster development builds
      config.cache = {
        type: "filesystem",
      };
    }

    // Reduce bundle size with better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      "@radix-ui/react-icons": "@radix-ui/react-icons/dist/index.mjs",
    };

    // Optimize imports
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            chunks: "all",
            test: /node_modules/,
            name: "vendor",
          },
          radix: {
            test: /node_modules\/@radix-ui/,
            name: "radix",
            chunks: "all",
          },
        },
      },
    };

    return config;
  },
};

export default nextConfig;
