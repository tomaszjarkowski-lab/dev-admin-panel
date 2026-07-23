type ErrorStateProps = {
	message: string;
	onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
			<p className="text-sm font-medium text-red-800">{message}</p>
			{onRetry ? (
				<button
					type="button"
					onClick={onRetry}
					className="mt-4 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50"
				>
					Spróbuj ponownie
				</button>
			) : null}
		</div>
	);
}
