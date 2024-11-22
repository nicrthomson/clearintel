/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add handlebars loader with specific configuration
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
      options: {
        ignoreHelpers: true,
        ignorePartials: true,
        helperDirs: [],
        partialDirs: [],
        runtime: 'handlebars'
      }
    });

    // Handle handlebars as external in server-side code
    if (isServer) {
      config.externals = [...config.externals, 'handlebars'];
    }

    return config;
  },

  experimental: {
    turbo: {
      rules: {
        '*.handlebars': ['handlebars-loader']
      }
    }
  },

  // Handle dynamic API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
