import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gold text-navy font-semibold hover:bg-gold/90 shadow-[var(--shadow-gold)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
        "outline-cream": "border-2 border-cream/80 text-cream bg-transparent hover:bg-cream hover:text-navy transition-all duration-300",
        "outline-gold": "border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-navy transition-all duration-300",
        terracotta: "bg-tq-terracotta text-white font-semibold hover:bg-tq-terracotta/90 shadow-[var(--shadow-tq)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
        "outline-terracotta": "border-2 border-tq-terracotta text-tq-terracotta bg-transparent hover:bg-tq-terracotta hover:text-white transition-all duration-300",
        "outline-sand": "border-2 border-tq-sand/80 text-tq-sand bg-transparent hover:bg-tq-sand hover:text-tq-black transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
