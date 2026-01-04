/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance optimizations
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // wildcard: allows all domains
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },

};

module.exports = nextConfig;
