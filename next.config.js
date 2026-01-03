/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // TypeScript hataları olsa bile build'e devam et
        ignoreBuildErrors: true,
    },
    eslint: {
        // Eslint (yazım kuralları) hatalarını görmezden gel
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;