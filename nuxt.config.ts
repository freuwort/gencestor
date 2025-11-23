export default defineNuxtConfig({
    modules: [
      '@nuxt/eslint',
      '@nuxt/test-utils',
      '@nuxt/ui',
      '@pinia/nuxt',
    ],

    css: [
        '~/assets/css/main.css',
    ],

    compatibilityDate: '2025-07-15',

    devtools: {
        enabled: true
    },
})