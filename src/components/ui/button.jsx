import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90",
  lg: "h-11 px-8 rounded-md",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants[variant], size && buttonVariants[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
