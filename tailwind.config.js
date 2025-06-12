// tailwind.config.js - 캔버스 카드 효과를 위한 추가 설정
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // 기존 색상 설정 유지
        colors: {
          'solarized-base03': '#002b36',
          'solarized-base02': '#073642',
          'solarized-base01': '#586e75',
          'solarized-base00': '#657b83',
          'solarized-base0': '#839496',
          'solarized-base1': '#93a1a1',
          'solarized-base2': '#eee8d5',
          'solarized-base3': '#fdf6e3',
          'solarized-yellow': '#b58900',
          'solarized-orange': '#cb4b16',
          'solarized-red': '#dc322f',
          'solarized-magenta': '#d33682',
          'solarized-violet': '#6c71c4',
          'solarized-blue': '#268bd2',
          'solarized-cyan': '#2aa198',
          'solarized-green': '#859900',
        },
        // 애니메이션 추가
        animation: {
          'pulse-gentle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 3s ease-in-out infinite',
          'slide-up': 'slideUp 0.4s ease-out',
          'fade-in': 'fadeIn 0.3s ease-out',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-4px)' }
          },
          slideUp: {
            '0%': { transform: 'translateY(8px)', opacity: '0' },
            '100%': { transform: 'translateY(0px)', opacity: '1' }
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          }
        },
        // 변환 효과 추가
        transitionTimingFunction: {
          'card': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        },
        // 그림자 효과 추가 (red/white/black만 사용)
        boxShadow: {
          'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
          'glow-white': '0 0 20px rgba(255, 255, 255, 0.2)',
        },
        // 백드롭 필터 추가
        backdropBlur: {
          xs: '2px',
        },
        // 추가 blur 설정
        blur: {
          '3xl': '64px',
          '4xl': '80px',
        },
        // 방사형 그라디언트 추가
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        // 스케일 추가
        scale: {
          '102': '1.02',
          '105': '1.05',
        }
      },
    },
    plugins: [
      // @tailwindcss/line-clamp 플러그인 대신 CSS로 구현했으므로 제거 가능
    ],
  }