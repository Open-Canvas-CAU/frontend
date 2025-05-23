// postcss.config.cjs
module.exports = {
    plugins: {
        // ← swap out tailwindcss for the new @tailwindcss/postcss plugin
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
}
