/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      path: '@/lib/path-polyfill',
      fs: '@/lib/fs-polyfill'
    };
    
    // Add handlebars loader
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader'
    });

    return config;
  },

  experimental: {
    turbo: {
      rules: {
        '*.handlebars': ['handlebars-loader']
      }
    }
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
