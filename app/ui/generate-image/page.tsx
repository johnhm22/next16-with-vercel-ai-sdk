"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function GenerateImagePage() {
	const [prompt, setPrompt] = useState<string>("");
	const [imageSrc, setImageSrc] = useState<string | null>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsLoading(true);
		setImageSrc("");
		setError(null);
		setPrompt("");

		try {
			const response = await fetch("/api/generate-image", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			setImageSrc(`data:image/png;base64,${data}`);
		} catch (error) {
			console.error("Error in fetching an image", error);
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
		<div className="flex flex-col w-full max-w-md pt-12 pb-36 mx-auto stretch">
			{error && <div className="text-red-500 mb-4">{error}</div>}
			{/* {image will go here} */}

			<div className="relative w-full aspect-square mb-20">
				{isLoading ? (
					<div className="w-full h-full animate-pulse bg-gray-300 rounded-lg" />
				) : (
					imageSrc && (
						<Image
							alt="Generated image"
							className="w-full h-full object-cover rounded-lg shadow-lg"
							src={imageSrc}
							width={1024}
							height={1024}
						/>
					)
				)}
			</div>

			<form
				onSubmit={handleSubmit}
				className="mb-3 fixed bottom-0 mx-auto w-full bg-zinc-50 left-0 right-0 max-w-md"
			>
				<div className="flex gap-2">
					<input
						placeholder="Describe the image"
						type="text"
						onChange={(e) => {
							setPrompt(e.target.value);
						}}
						className="flex-1 border rounded border-zinc-300 px-2 shadow-lg"
						value={prompt}
					/>
					<button
						className="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white py-2 px-4 hover:bg-blue-700 rounded"
						type="submit"
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}
