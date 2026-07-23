type KpiCardProps = {
	label: string;
	value: string | number;
	hint?: string;
};

export function KpiCard({ label, value, hint }: KpiCardProps) {
	return (
		<div className="rounded-xl border border-border bg-white p-5 shadow-sm">
			<p className="text-sm font-medium text-gray-500">{label}</p>
			<p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
				{value}
			</p>
			{hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
		</div>
	);
}

export function KpiCardSkeleton() {
	return (
		<div className="animate-pulse rounded-xl border border-border bg-white p-5">
			<div className="h-4 w-24 rounded bg-gray-100" />
			<div className="mt-3 h-8 w-16 rounded bg-gray-100" />
		</div>
	);
}
