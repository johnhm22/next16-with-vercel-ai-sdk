"use client";

import React, { useState } from "react";

const CompletionPage = () => {
	const [prompt, setPrompt] = useState(""); //user input
	const [completion, setCompletion] = useState(""); //AI response
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const complete = async (e: React.FormEvent) => {
		// console.log("prompt", prompt);
		e.preventDefault();
		setIsLoading(true);
		// setPrompt("");
		try {
			const response = await fetch("/api/completion", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Something went wrong");
			}

			setCompletion(data.text);
		} catch (error) {
			console.error("Error", error);
			setError(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again"
			);
			// console.log("error.message: ", error);
		} finally {
			setIsLoading(false);
		}
	};

	//16 mins
	//https://www.youtube.com/watch?v=BQmbuEClULY

	return (
		<div className="flex flex-col border border-orange-500 w-full max-w-2xl py-24 mx-auto stretch">
			{/*Display area for completion */}
			{error ? <div className="text-red-500 mb-4">{error}</div> : null}
			{isLoading ? (
				<div>Loading...</div>
			) : completion ? (
				<div>{completion}</div>
			) : null}

			<form
				onSubmit={complete}
				className="mx-auto fixed bottom-0 p-4 w-full max-w-md left-0 right-0 bg-zinc-50"
			>
				<div className="flex gap-2">
					<input
						className="p-2 flex-1 border border-zinc-300 rounded-lg"
						placeholder="How can I help you?"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
					/>
					<button
						className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
						type="submit"
						disabled={isLoading}
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
};

export default CompletionPage;
