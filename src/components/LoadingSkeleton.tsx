type SkeletonProps = {
	className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
	return (
		<div className={`animate-pulse rounded bg-gray-100 ${className}`} />
	);
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-white">
			<div className="border-b border-border bg-gray-50 px-4 py-3">
				<Skeleton className="h-4 w-40" />
			</div>
			<div className="divide-y divide-border">
				{Array.from({ length: rows }).map((_, index) => (
					<div key={index} className="flex gap-4 px-4 py-3">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/5" />
						<Skeleton className="h-4 w-1/6" />
						<Skeleton className="h-4 w-1/5" />
					</div>
				))}
			</div>
		</div>
	);
}
