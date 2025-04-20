/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/api/:path*",  // Apply to all API routes
                headers: [
                    { 
                        key: "Access-Control-Allow-Origin", 
                        value: process.env.NODE_ENV === 'production' 
                            ? "https://typeblaze.vercel.app" 
                            : "http://localhost:3000" 
                    },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                ],
            },
        ];
    },
};

export default nextConfig;
