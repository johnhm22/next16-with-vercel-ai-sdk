"use client";

import React, { useRef, useState, useEffect } from "react";

export default function GenerateSpeechPage() {
	const [text, setText] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasAudio, setHasAudio] = useState(false);
	const [playback, setPlayback] = useState<number>(1.0);

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

	//reset audio to the beginning and plays again
	const replayAudio = () => {
		if (audioRef.current) {
			audioRef.current.playbackRate = playback;
			audioRef.current.currentTime = 0;
			audioRef.current.play();
		}
	};

	useEffect(() => {
		return () => {
			console.log("Component unmounted");
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
				<div className="flex flex-col">
					<button
						onClick={replayAudio}
						className="mb-4 bg-gray-200 py-2 px-4 rounded hover:bg-gray-400"
					>
						Replay Audio
					</button>
					<div className="flex justify-between">
						<button
							onClick={() => setPlayback((playback) => playback + 0.25)}
							className=" bg-green-200 py-2 px-4 rounded hover:bg-green-400 disabled:bg-gray-100 disabled:text-zinc-300"
							disabled={playback === 2.0}
						>
							+ playback speed
						</button>
						<button
							onClick={() => setPlayback((playback) => playback - 0.25)}
							className=" bg-red-200 py-2 px-4 rounded hover:bg-red-400  disabled:bg-gray-100 disabled:text-zinc-300"
							disabled={playback === 0.25}
						>
							- playback speed
						</button>
						<a
							className="flex justify-center rounded bg-orange-400 hover:bg-orange-500 py-2 px-4"
							href={audioRef.current!.src}
							download="ai_audio-file.mp3"
						>
							Download audio file
						</a>
					</div>
				</div>
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
