"use client";

import React, { useRef, useState, useEffect } from "react";

export default function GenerateSpeechPage() {
	const [text, setText] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasAudio, setHasAudio] = useState(false);

	const audioUrlRef = useRef<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!text) {
			setError("Please enter text to convert");
			return;
		}
		setIsLoading(true);
		setError(null);
		setText("");

		if (audioUrlRef.current) {
			URL.revokeObjectURL(audioUrlRef.current);
			audioUrlRef.current = null;
		}

		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = "";
			audioRef.current = null;
		}
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
			audioUrlRef.current = URL.createObjectURL(blob);
			audioRef.current = new Audio(audioUrlRef.current);

			// The createObjectURL() static method of the URL interface creates
			// a string containing a blob URL pointing to the object given in the parameter.

			setHasAudio(true);
			audioRef.current.play();

			// console.log("audio src:", audioRef.current.src);
			// audio.addEventListener("ended", () => {  We are not cleaning up immediately any more
			// 	URL.revokeObjectURL(audioUrl);
			// });
		} catch (error) {
			console.error("There has been an error", error);
			setError(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again"
			);
			setHasAudio(false);
		} finally {
			setIsLoading(false);
		}
	};

	//Trying to detect the play action taking place
	// useEffect(() => {
	// 	if (typeof document !== "undefined") {
	// 		console.log("document loaded");
	// 		const audio = document.querySelector(audioRef.current);
	// 		console.log("audioRef.current", audioRef.current);
	// 		console.log("audio", audio);
	// 		audio?.addEventListener("play", () => {
	// 			console.log("event listener fired");
	// 			console.log("Audio has been played again");
	// 		});
	// 	}
	// }, [hasAudio]);

	//reset audio to the beginning and plays again
	const replayAudio = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play();
		}
	};

	useEffect(() => {
		return () => {
			if (audioUrlRef.current) {
				URL.revokeObjectURL(audioUrlRef.current);
			}
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
			}
		};
	}, []);

	return (
		<div className="flex flex-col mx-auto w-full max-w-2xl pt-12 pb-24">
			{error && <div className="text-red-500 mb-4 px-4">{error}</div>}
			{isLoading && (
				<div className="text-center font-semibold mb-4 px-4">
					Generating audio...
				</div>
			)}

			{hasAudio && !isLoading && (
				<button
					onClick={replayAudio}
					className="mb-4 bg-gray-200 py-2 px-4 rounded hover:bg-gray-400"
				>
					Replay Audio
				</button>
			)}
			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 left-0 right-0 p-4 border-zinc-200 w-full mx-auto max-w-md"
			>
				<div className="flex gap-2">
					<input
						suppressHydrationWarning={true}
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
