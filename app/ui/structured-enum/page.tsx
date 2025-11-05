"use client";

import React, { useState } from "react";

export default function StructuredEnumPage() {
	const [text, setText] = useState<string>("");
	const [sentiment, setSentiment] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const analyzeSentiment = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setText("");

		try {
			const response = await fetch("/api/structured-enum", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			setSentiment(data);
		} catch (e) {
			console.error("There was an error", e);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
			{error && <div className="text-red-500 mb-4">{error}</div>}

			{isLoading ? (
				<div className="text-center">Analysing sentiment....</div>
			) : sentiment ? (
				<div className="text-center text-2xl">
					<div>{sentiment === "positive" && "😊 Positive"}</div>
					<div>{sentiment === "negative" && "😞 Negative"}</div>
					<div>{sentiment === "neutral" && "😐 Neutral"}</div>
				</div>
			) : null}

			<form
				onSubmit={analyzeSentiment}
				className="fixed bottom-0 left-0 right-0 p-4 w-full mx-auto max-w-2xl bg-zinc-50"
			>
				<div className="flex gap-2">
					<input
						type="text"
						onChange={(e) => setText(e.target.value)}
						className="flex-1 border rounded border-zinc-300 px-2 shadow-lg"
						placeholder="Enter test to analyse..."
					/>
					<button
						disabled={isLoading || !text.trim()}
						type="submit"
						className="bg-blue-500 rounded px-4 py-2 text-white hover:bg-blue-700"
					>
						{isLoading ? "Analysing" : "Analyse"}
					</button>
				</div>
			</form>
		</div>
	);
}
