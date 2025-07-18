import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				// Purple Brand Family (Sophisticated)
				brand: {
					royal: '#7c3aed', // Brand primary, major actions
					deep: '#6b46c1', // Interactive states, selections
					muted: '#8b5cf6', // Hover states, secondary actions
					whisper: '#f3f4f6', // Subtle backgrounds, cards
					ghost: '#faf9fc' // Page backgrounds, breathing room
				},
				// Orange Brand Family (Premium)
				accent: {
					copper: '#c2410c', // Status excellence, completed states
					warm: '#ea580c', // Active progress, attention
					soft: '#fb923c', // Indicators, time elements
					cream: '#fed7aa', // Highlights, gentle backgrounds
					pearl: '#fffbf5' // Subtle accents, warm neutrals
				},
				// Professional Neutrals (Foundation)
				text: {
					rich: '#111827', // Headlines, primary text
					slate: '#475569', // Body text, descriptions
					silver: '#94a3b8' // Secondary text, metadata
				},
				border: {
					platinum: '#f1f5f9' // Borders, dividers
				}
			},
			borderRadius: {
				'premium-sm': '8px',
				premium: '10px',
				'premium-lg': '12px',
				'premium-xl': '20px'
			},
			boxShadow: {
				premium: '0 4px 12px rgba(0, 0, 0, 0.05)',
				'premium-hover': '0 8px 16px rgba(0, 0, 0, 0.08)'
			},
			spacing: {
				'premium-xs': '4px',
				'premium-sm': '8px',
				'premium-md': '16px',
				'premium-lg': '24px',
				'premium-xl': '32px',
				'premium-2xl': '48px',
				'premium-3xl': '64px'
			},
			fontSize: {
				'premium-caption': '11px',
				'premium-meta': '12px',
				'premium-body': '14px',
				'premium-brand': '16px',
				'premium-title': '18px',
				'premium-header': '20px',
				'premium-headline': '24px'
			},
			letterSpacing: {
				'premium-tight': '-0.5px',
				'premium-normal': '0px',
				'premium-wide': '0.5px',
				'premium-badge': '0.75px'
			},
			transitionDuration: {
				premium: '200ms'
			},
			transitionTimingFunction: {
				premium: 'cubic-bezier(0.4, 0, 0.2, 1)'
			},
			animation: {
				'pulse-premium': 'pulse-premium 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				'pulse-premium': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			backgroundImage: {
				'brand-gradient': 'linear-gradient(to right, #7c3aed, #6b46c1)'
			}
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
