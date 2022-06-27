module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/elements/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                'dyo-shadowed-purple': '#6A6680',
                'dyo-light-purple': '#F9F8FC',
                'dyo-dark-purple': '#302474',
                'dyo-purple': '#540BA7',
                'dyo-turquoise': '#00D0BF',
                'dyo-light-purple-pale': '#DEDBEB',
                'dyo-light-purple-pale-shadow': '#DCE2F3',
                'dyo-eased-purple': '#796EB9',
                'dyo-eased-purple-pale': "#CDD6EF",
                'dyo-dark': '#1E1A33',
            },
            gridTemplateColumns: {
                'fr-auto-1': '1fr',
                'fr-auto-2': '1fr auto',
                'fr-auto-3': '1fr auto auto',
                'fr-auto-4': '1fr auto auto auto',
                'fr-auto-5': '1fr auto auto auto auto',
                'fr-auto-6': '1fr auto auto auto auto auto',
                'fr-auto-7': '1fr auto auto auto auto auto auto',
                'fr-auto-8': '1fr auto auto auto auto auto auto auto',
                'fr-auto-9': '1fr auto auto auto auto auto auto auto auto',
                'fr-auto-10': '1fr auto auto auto auto auto auto auto auto auto',
                'fr-auto-11': '1fr auto auto auto auto auto auto auto auto auto auto',
                'fr-auto-12': '1fr auto auto auto auto auto auto auto auto auto auto auto',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}