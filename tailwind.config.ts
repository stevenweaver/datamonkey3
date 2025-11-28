import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				// Distinctive display font for headlines
				display: ['"DM Serif Display"', 'Georgia', 'serif'],
				// Clean sans-serif for body text
				sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
				// Monospace for code/data
				mono: ['"JetBrains Mono"', 'Consolas', 'monospace']
			},
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
					platinum: '#f1f5f9', // Borders, dividers
					subtle: '#e2e8f0' // Slightly stronger borders
				},
				// Surface colors (backgrounds)
				surface: {
					base: '#ffffff', // Primary surface
					raised: '#f8fafc', // Elevated elements
					sunken: '#f1f5f9', // Recessed areas, inputs
					overlay: '#1e293b' // Dark overlays, tooltips
				},
				// Semantic Status Colors
				status: {
					// Success (green family)
					success: '#16a34a', // Primary success
					'success-soft': '#22c55e', // Lighter success
					'success-bg': '#f0fdf4', // Success background
					'success-border': '#bbf7d0', // Success border
					'success-text': '#166534', // Success text
					// Error (red family)
					error: '#dc2626', // Primary error
					'error-soft': '#ef4444', // Lighter error
					'error-bg': '#fef2f2', // Error background
					'error-border': '#fecaca', // Error border
					'error-text': '#991b1b', // Error text
					// Warning (amber family)
					warning: '#d97706', // Primary warning
					'warning-soft': '#f59e0b', // Lighter warning
					'warning-bg': '#fffbeb', // Warning background
					'warning-border': '#fde68a', // Warning border
					'warning-text': '#92400e', // Warning text
					// Info (blue family - for non-brand informational)
					info: '#2563eb', // Primary info
					'info-soft': '#3b82f6', // Lighter info
					'info-bg': '#eff6ff', // Info background
					'info-border': '#bfdbfe', // Info border
					'info-text': '#1e40af' // Info text
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
				'pulse-premium': 'pulse-premium 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			},
			keyframes: {
				'pulse-premium': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(-10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			backgroundImage: {
				'brand-gradient': 'linear-gradient(to right, #7c3aed, #6b46c1)'
			}
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
