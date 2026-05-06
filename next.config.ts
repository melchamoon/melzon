import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-slot', 'embla-carousel-react', 'embla-carousel-autoplay'],
};

export default nextConfig;
