module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/elements/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'dyo-turquoise': '#00d0bf',
                'dyo-green': '#28c76f',
                'dyo-purple': '#540ba7',
                'dyo-purple-light': '#e1ccf8',
                'dyo-blue': '#00cfe8',
                'bright': "#d0d2d6",
                'bright-muted': '#676d7d',
                'light-eased': '#b4b7bd',
                'light-grey': '#3b4253',
                'light-grey-muted': '#404656',
                'light': '#7783a3',
                'medium-eased': '#343d55',
                'medium': '#283046',
                'dark': '#161d31',
                'error-red': '#ea5455',
                'warning-orange': '#ff9f43',
            },
            height: {
                '128': '32rem',
            },
            maxHeight: {
                '128': '32rem',
            },
            boxShadow: {
                'modal': '0 0 20px 5px rgb(0 0 0 / 0.25)',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('@tailwindcss/line-clamp')],
}
