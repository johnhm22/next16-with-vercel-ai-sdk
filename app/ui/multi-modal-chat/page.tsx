"use client";

import React, { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";

export default function MultiModalPage() {
	const [input, setInput] = useState("");
	const [files, setFiles] = useState<FileList | undefined>(undefined);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { messages, sendMessage, status, error, stop } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/multi-modal-chat",
		}),
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		sendMessage({ text: input, files });
		setInput("");
		setFiles(undefined);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col w-full max-w-md pt-12 pb-36 mx-auto stretch">
			{error && <div className="text-red-500 mb-4">{error.message}</div>}
			{messages.map((message) => (
				<div className="mb-4" key={message.id}>
					<div className="font-semibold">
						{message.role === "user" ? "You:" : "AI:"}
					</div>
					{message.parts.map((part, idx) => {
						switch (part.type) {
							case "text":
								return (
									<div
										className="whitespace-pre-wrap"
										key={`${message.id}-${idx}`}
									>
										{part.text}
									</div>
								);
							case "file":
								if (part.mediaType?.startsWith("image")) {
									return (
										<Image
											key={`${message.id}-${idx}`}
											src={part.url}
											alt={part.filename ?? `attachment-${idx}`}
											width={500}
											height={500}
										/>
									);
								}
								return null;
							default:
								return null;
						}
					})}
				</div>
			))}

			{(status === "submitted" || status === "streaming") && (
				<div className="mb-4">
					<div className="flex items-center gap-2">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="mb-3 fixed bottom-0 mx-auto w-full bg-zinc-50 left-0 right-0 max-w-md"
			>
				<div className="flex flex-col gap-3">
					<div>
						<label
							htmlFor="file-upload"
							className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer"
						>
							{files?.length
								? `${files.length} file(s)${files.length} attached`
								: "Attach files"}
						</label>
					</div>
					<input
						id="file-upload"
						type="file"
						className="hidden"
						onChange={(event) => {
							if (event.target.files) {
								setFiles(event.target.files);
							}
						}}
						multiple
						ref={fileInputRef}
					/>
					<div className="flex gap-2">
						<input
							className="p-2 border border-zinc-300 flex-1 rounded-lg shadow-xl"
							placeholder="How can I help you?"
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>

						{status === "streaming" || status === "submitted" ? (
							<button
								onClick={stop}
								className=" disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white py-2 px-4 hover:bg-blue-700 rounded"
								type="submit"
							>
								Stop
							</button>
						) : (
							<button
								className=" disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white py-2 px-4 hover:bg-blue-700 rounded"
								type="submit"
								disabled={status !== "ready"}
							>
								Send
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
