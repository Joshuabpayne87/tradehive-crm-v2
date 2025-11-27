import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2",
  {
    variants: {
      variant: {
        default: "bg-[hsl(142,76%,36%)] text-white hover:bg-[hsl(142,76%,32%)] border-yellow-500 hover:border-yellow-400 shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 border-red-600 hover:border-red-500 shadow-md",
        outline:
          "border-2 border-black/40 bg-white text-[hsl(142,76%,20%)] hover:bg-yellow-50/30 hover:border-yellow-500/60 hover:text-[hsl(142,76%,20%)] shadow-sm hover:shadow-md",
        secondary:
          "bg-[hsl(45,100%,85%)] text-[hsl(142,76%,20%)] hover:bg-[hsl(45,100%,80%)] border-black/30 hover:border-yellow-500/60 shadow-sm",
        ghost: "border-transparent text-[hsl(142,76%,20%)] hover:bg-accent hover:text-[hsl(142,76%,20%)] hover:border-yellow-500/40",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 md:h-10 px-4 py-2 min-h-[44px]",
        sm: "h-10 md:h-9 rounded-md px-3 min-h-[44px]",
        lg: "h-12 md:h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-11 w-11 md:h-10 md:w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
