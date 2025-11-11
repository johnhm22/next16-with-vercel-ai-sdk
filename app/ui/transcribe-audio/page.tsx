"use client";

import React, { useState, useRef } from "react";

interface TranscriptResult {
	text: string;
	segments?: Array<{ start: number; end: number; test: string }>;
	language?: string;
	durationInSeconds: number;
}

export default function TranscribeAudioPage() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedFile) {
			setError("Please select an audio file");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append("audio", selectedFile);
			const response = await fetch("/api/transcribe-audio", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to transcribe audio");
			}

			const data = await response.json();
			setTranscript(data);
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("There has been an error", error);
			setError(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again"
			);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setTranscript(null);
			setError(null);
		}
	};

	const resetForm = () => {
		setSelectedFile(null);
		setTranscript(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col mx-auto w-full max-w-2xl pt-12 pb-24">
			{error && <div className="text-red-500 mb-4 px-4">{error}</div>}
			{isLoading && (
				<div className="text-center font-semibold mb-4 px-4">
					Transcribing audio...
				</div>
			)}
			{transcript && !isLoading ? (
				<div className="mb-8 p-4 bg-zinc-100 rounded-lg">
					<h3 className="font-semibold mb-2">Transcript:</h3>
					<p className="whitespace-pre-wrap">{transcript.text}</p>

					{transcript.language && <p>Language: {transcript.language}</p>}
					{transcript.durationInSeconds && (
						<p> Language: {transcript.durationInSeconds}</p>
					)}
				</div>
			) : null}

			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 left-0 right-0 p-4 border-zinc-200 w-full mx-auto max-w-md"
			>
				<div className="flex flex-col gap-2 w-full">
					{selectedFile && (
						<div className="flex gap-2 justify-around">
							<span>Selected: {selectedFile.name}</span>
							<button
								className="text-red-500 hover:test-red-700"
								type="button"
								onClick={resetForm}
							>
								Remove
							</button>
						</div>
					)}
					<div className="flex flex-row gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="audio/*"
							className="hidden"
							id="audio-upload"
							onChange={handleFileChange}
						/>
						<label
							className="shadow-xl flex-1 rounded py-2 items-center cursor-pointer text-center hover:bg-zinc-100 border border-zinc-50"
							htmlFor="audio-upload"
						>
							{selectedFile ? "Change file" : "Select audio file"}
						</label>
						<button
							type="submit"
							disabled={isLoading || !selectedFile}
							className="bg-blue-500 hover:bg-blue-700 px-4 py-2 text-white rounded"
						>
							Transcribe
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
