"use client";

import { useCompletion } from "@ai-sdk/react";
import React from "react";

export default function StreamPage() {
	const {
		input,
		handleInputChange,
		handleSubmit,
		completion,
		isLoading,
		error,
		setInput,
		stop,
	} = useCompletion({
		api: "/api/stream",
	});

	return (
		<div className="flex flex-col w-full max-w-md py-24 mx-auto bg-slate-100 rounded-lg mt-7 px-2">
			<div className="text-blue-500 italic font-semibold text-sm mb-3">
				Streaming response ...
			</div>
			{error && <div className="text-red-500 mb-4">{error.message}</div>}
			{isLoading && !completion && <div>Loading...</div>}
			{/* {Display area for text} */}
			{completion && <div className="whitespace-pre-wrap">{completion}</div>}

			<form
				// onSubmit={handleSubmit}
				onSubmit={(e) => {
					e.preventDefault();
					setInput("");
					handleSubmit(e);
				}}
				className="mx-auto fixed bottom-0 p-4 w-full max-w-md left-0 right-0 bg-zinc-50"
			>
				<div className="flex gap-2">
					<input
						className="p-2 flex-1 border border-zinc-300 rounded-lg"
						placeholder="How can I help you?"
						value={input}
						onChange={handleInputChange}
					/>
					{isLoading ? (
						<button
							onClick={stop}
							className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-700"
						>
							Stop
						</button>
					) : (
						<button
							className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
							type="submit"
							disabled={isLoading}
						>
							Send
						</button>
					)}
				</div>
			</form>
		</div>
	);
}
