import type { ReactNode } from "react";

const variants = {
	neutral: "bg-gray-100 text-gray-700",
	success: "bg-emerald-50 text-emerald-700",
	warning: "bg-amber-50 text-amber-700",
	danger: "bg-red-50 text-red-700",
	primary: "bg-primary-light text-primary-dark",
	patient: "bg-slate-100 text-slate-700",
	admin: "bg-primary-light text-primary-dark",
	root_admin: "bg-sky-50 text-sky-800",
} as const;

type BadgeVariant = keyof typeof variants;

type BadgeProps = {
	children: ReactNode;
	variant?: BadgeVariant;
	className?: string;
};

export function Badge({
	children,
	variant = "neutral",
	className = "",
}: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
		>
			{children}
		</span>
	);
}
