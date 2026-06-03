import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none active:scale-[0.95]',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-slate-900 dark:text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20',
        success: 'bg-green-500 text-slate-900 dark:text-white hover:bg-green-600 shadow-sm shadow-green-500/20',
        danger: 'bg-red-500 text-slate-900 dark:text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
        outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
        ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
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