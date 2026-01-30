export default defineNuxtConfig({
    nitro: {
        serverAssets: [
            { baseName: 'templates', dir: './assets/templates' },
            { baseName: 'fonts', dir: './assets/fonts' },
            { baseName: 'images', dir: './assets/images' },
        ],
    },

    css: [
        '~/assets/css/main.css',
    ],

    modules: [
      '@nuxt/ui',
      '@pinia/nuxt',
    ],

    devtools: {
        enabled: true
    },

    compatibilityDate: '2025-07-15',
})