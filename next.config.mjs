

import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev"

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/5712c57ea7/internal-packages/next-dev/README.md


if (process.env.NODE_ENV === "development") {
    await setupDevPlatform({
        persist: {
            path: '/mnt/c/Users/Rafael/Documents/c/Projeto_WikiRip/wikirip-database/.wrangler/state/v3',
        }
    })
}


/** @type {import('next').NextConfig} */
const nextConfig = {
    // This is the redirects section.
    async redirects() {
        return [
             /* {
                source: "/:path*",
                has: [{ type: "host", value: "www.example.com" }],
                destination: "https://example.com/:path*",
                permanent: true,
            } */
            {
                source: "/",
                destination: "/entrar",
                permanent: true,
            },
            {
                source: "/login",
                destination: "/entrar",
                permanent: true,
            },
            {
                source: "/suporte",
                destination: "/home/suporte",
                permanent: true,
            },
            {
                source: "/politica",
                destination: "/home/politica",
                permanent: true,
            },
            {
                source: "/sobre",
                destination: "/home/sobre",
                permanent: true,
            },
            {
                source: "/termos",
                destination: "/home/politica/termos",
                permanent: true,
            },
            {
                source: "/termos-de-servico",
                destination: "/home/politica/termos",
                permanent: true,
            },
            {
                source: "/privacidade",
                destination: "/home/politica/privacidade",
                permanent: true,
            },
            {
                source: "/privacidade-politica",
                destination: "/home/politica/privacidade",
                permanent: true,
            },
            {
                source: "/seguranca",
                destination: "/home/politica/seguranca",
                permanent: true,
            },
            {
                source: "/processo",
                destination: "/home/politica/processo",
                permanent: false,
            },
            {
                source: "/painel",
                destination: "/painel/biblioteca",
                permanent: false,
            },
            {
                source: "/biblioteca",
                destination: "/painel/biblioteca",
                permanent: false,
            }
        ]
    }
}

export default nextConfig
