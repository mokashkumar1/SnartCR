import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-sans font-semibold transition-fast cursor-pointer outline-none whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-text border-none hover:bg-primary-hover hover:-translate-y-[1px] hover:shadow-[0_4px_10px_rgba(227,51,45,0.25)] active:translate-y-0',
        secondary: 'bg-transparent border-[1.5px] border-primary text-primary hover:bg-primary-light',
        neutral: 'bg-surface-muted text-dark border border-border hover:bg-border',
        ghost: 'bg-transparent text-dark border-none hover:bg-surface-muted',
        // Fallbacks for previous classes
        success: 'bg-status-success text-white border-none hover:bg-status-success/90',
        danger: 'bg-status-error text-white border-none hover:bg-status-error/90',
        outline: 'bg-transparent border border-border text-dark hover:bg-surface-muted',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-9 px-4 text-md rounded-md',
        lg: 'h-11 px-5 text-lg rounded-md',
        icon: 'h-9 w-9 p-0 rounded-md',
        giant: 'h-14 w-full text-xl rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export default function Button({ className, variant, size, children, ...props }) {
  // Map old variants to new design system variants if needed
  let mappedVariant = variant
  if (variant === 'outline') mappedVariant = 'neutral'

  return (
    <button className={twMerge(clsx(buttonVariants({ variant: mappedVariant, size }), className))} {...props}>
      {children}
    </button>
  )
}