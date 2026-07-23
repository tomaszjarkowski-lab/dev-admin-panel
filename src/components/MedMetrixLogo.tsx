type MedMetrixLogoProps = {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
	alt?: string;
};

const sizeMap = {
	sm: "h-7",
	md: "h-9",
	lg: "h-12",
	xl: "h-14",
} as const;

export function MedMetrixLogo({
	className = "",
	size = "md",
	alt = "MedMetrix",
}: MedMetrixLogoProps) {
	return (
		<img
			src="/medmetrix-logo.webp"
			alt={alt}
			className={`medmetrix-logo w-auto object-contain ${sizeMap[size]} ${className}`}
			decoding="async"
		/>
	);
}
