/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    safelist: [
        // 배경색
        'bg-solarized-base02',
        'bg-solarized-base02/50',
        'bg-solarized-base01',
        'bg-solarized-cyan',
        'bg-solarized-cyan/20',
        'bg-solarized-cyan/80',
        // 텍스트 색상
        'text-solarized-base0',
        'text-solarized-base1',
        'text-solarized-base3',
        'text-solarized-cyan',
        // 호버 상태
        'hover:bg-solarized-base01',
        'hover:bg-solarized-cyan/80',
        'hover:text-solarized-base1',
    ],
    theme: {
        extend: {
            colors: {
                solarized: {
                    // Solarized Dark 테마 색상
                    base03:    '#fdf6e3', // 밝은 베이지 (원래 base3)
                    base02:    '#eee8d5', // 연한 베이지 (원래 base2)
                    base01:    '#93a1a1', // 연한 회색 (원래 base1)
                    base00:    '#839496', // 회색 (원래 base0)
                    base0:     '#657b83', // 진한 회색 (원래 base00)
                    base1:     '#586e75', // 더 진한 회색 (원래 base01)
                    base2:     '#073642', // 진한 청록색 (원래 base02)
                    base3:     '#002b36', // 가장 진한 청록색 (원래 base03)
                    yellow:    '#b58900',
                    orange:    '#cb4b16',
                    red:       '#dc322f',
                    magenta:   '#d33682',
                    violet:    '#6c71c4',
                    blue:      '#268bd2',
                    cyan:      '#2aa198',
                    green:     '#859900'
                }
            },
            keyframes: {
                carousel: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(calc(-100% / 3))' }
                }
            },
            animation: {
                carousel: 'carousel 30s linear infinite'
            },
            transformStyle: {
                '3d': 'preserve-3d',
            },
            perspective: {
                '1000': '1000px',
            }
        },
    },
    plugins: [],
}
