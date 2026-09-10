import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "text-white gradient-brand shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35 hover:brightness-[1.08] bg-[length:200%_200%] hover:animate-gradient-x",
  secondary:
    "bg-surface-3 text-fg border border-line hover:border-line-strong hover:bg-surface-2 backdrop-blur",
  outline:
    "border border-brand-400/50 text-brand-600 dark:text-brand-200 hover:bg-brand-500/10 hover:border-brand-400",
  ghost: "text-fg-soft hover:bg-surface-3 hover:text-fg",
  whatsapp:
    "bg-[#25D366] text-[#04301a] shadow-lg shadow-emerald-500/25 hover:bg-[#1fbe5a] font-bold",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20",
  success: "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-13 px-7 text-base rounded-2xl",
  icon: "h-10 w-10 rounded-xl",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; external?: undefined };

type AnchorProps = CommonProps & {
  href: string;
  external?: boolean;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, external, target, rel, onClick } = props as AnchorProps;
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          href={href}
          className={classes}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
