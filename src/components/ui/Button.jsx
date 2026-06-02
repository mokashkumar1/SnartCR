import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none active:scale-[0.95]',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
        success: 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]',
        danger: 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
        outline: 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 backdrop-blur-sm',
        ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-14 px-6 text-lg',
        icon: 'h-11 w-11',
        giant: 'h-20 w-full text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export default function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={twMerge(clsx(buttonVariants({ variant, size }), className))} {...props}>
      {children}
    </button>
  )
}