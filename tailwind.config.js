/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
    	extend: {
    		fontFamily: {
    			poppins: [
    				'Poppins',
    				'sans-serif'
    			]
    		},
    		colors: {
    			primary: {
    				'100': 'var(--primary-100)',
    				'200': 'var(--primary-200)',
    				'300': 'var(--primary-300)',
    				'400': 'var(--primary-400)',
    				'500': 'var(--primary-500)',
    				'600': 'var(--primary-600)'
    			},
    			secondary: {
    				'100': 'var(--secondary-100)',
    				'200': 'var(--secondary-200)',
    				'300': 'var(--secondary-300)',
    				'400': 'var(--secondary-400)',
    				'500': 'var(--secondary-500)',
    				'600': 'var(--secondary-600)'
    			},
    			success: {
    				'100': 'var(--success-100)',
    				'200': 'var(--success-200)',
    				'300': 'var(--success-300)',
    				'400': 'var(--success-400)',
    				'500': 'var(--success-500)',
    				'600': 'var(--success-600)'
    			},
    			danger: {
    				'100': 'var(--danger-100)',
    				'200': 'var(--danger-200)',
    				'300': 'var(--danger-300)',
    				'400': 'var(--danger-400)',
    				'500': 'var(--danger-500)',
    				'600': 'var(--danger-600)'
    			},
    			neutral: {
    				white: 'var(--neutral-white)',
    				gray50: 'var(--neutral-gray50)',
    				gray100: 'var(--neutral-gray100)',
    				gray200: 'var(--neutral-gray200)',
    				gray300: 'var(--neutral-gray300)',
    				gray400: 'var(--neutral-gray400)',
    				gray500: 'var(--neutral-gray500)',
    				gray600: 'var(--neutral-gray600)',
    				gray700: 'var(--neutral-gray700)',
    				gray800: 'var(--neutral-gray800)',
    				gray900: 'var(--neutral-gray900)',
    				black: 'var(--neutral-black)'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
          'shine': {
            '0%': {
              transform: 'translateX(-100%) skewX(-20deg)',
            },
            '100%': {
              transform: 'translateX(200%) skewX(-20deg)',
            },
          },
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
          'shine': 'shine 3s infinite',
    		}
    	},
    	plugins: []
    },
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
  };
  