type EmptyStateProps = {
	title: string;
	description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
	return (
		<div className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
			<p className="text-sm font-medium text-gray-900">{title}</p>
			{description ? (
				<p className="mt-1 text-sm text-gray-500">{description}</p>
			) : null}
		</div>
	);
}
