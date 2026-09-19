/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
