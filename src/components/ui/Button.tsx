import clsx from "clsx";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-navy-700 text-white border-navy-700 hover:bg-navy-600",
  secondary: "bg-white text-navy-700 border-navy-300 hover:bg-navy-50",
  danger: "bg-white text-seal border-seal/40 hover:bg-seal/5",
  ghost: "bg-transparent text-navy-600 border-transparent hover:bg-navy-50",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  );
});
