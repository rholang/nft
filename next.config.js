module.exports = {
  // https://nextjs.org/docs/api-reference/next.config.js/headers

  images: {
    domains: [
      'cloudflare-ipfs.com',
      'gateway.pinata.cloud',
      'ipfs.io',
      'bloks.io',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.rho$/,
      use: 'raw-loader',
    });

    return config;
  },
};
