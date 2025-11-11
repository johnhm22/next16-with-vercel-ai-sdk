"use client";

import React, { useState } from "react";

export default function GenerateSpeechPage() {
	const [text, setText] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!text) {
			setError("Please enter text to convert");
			return;
		}
		setIsLoading(true);
		setError(null);
		setText("");
		try {
			const response = await fetch("/api/generate-speech", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});

			if (!response.ok) {
				throw new Error("Failed to generate audio");
			}

			const blob = await response.blob();
			const audioUrl = URL.createObjectURL(blob);
			const audio = new Audio(audioUrl);

			audio.play();

			audio.addEventListener("ended", () => {
				URL.revokeObjectURL(audioUrl);
			});
		} catch (error) {
			console.error("There has been an error", error);
			setError(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col mx-auto w-full max-w-2xl pt-12 pb-24">
			{error && <div className="text-red-500 mb-4 px-4">{error}</div>}
			{isLoading && (
				<div className="text-center font-semibold mb-4 px-4">
					Generating audio...
				</div>
			)}
			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 left-0 right-0 p-4 border-zinc-200 w-full mx-auto max-w-md"
			>
				<div className="flex gap-2">
					<input
						className="flex-1 border border-zinc-100 p-2"
						placeholder="Enter text to convert to speech"
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						disabled={isLoading}
					/>
					<button
						type="submit"
						className="bg-blue-500 hover:bg-blue-700 px-4 py-2 text-white rounded"
						disabled={isLoading || !text}
					>
						Generate
					</button>
				</div>
			</form>
		</div>
	);
}
