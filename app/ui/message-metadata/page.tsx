"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MyUIMessage } from "@/app/api/message-metadata/types";

export default function MetaDataChatPage() {
	const [input, setInput] = useState("");

	const { messages, sendMessage, status, error, stop } = useChat<MyUIMessage>({
		transport: new DefaultChatTransport({
			api: "/api/message-metadata",
		}),
	});

	console.log("messages: ", messages);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		sendMessage({ text: input });
		setInput("");
	};

	return (
		<div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
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
										<div className="flex items-center gap-2 text-xs test-gray-400">
											{message.metadata?.totalTokens && (
												<div>{message.metadata.totalTokens} tokens</div>
											)}
											{message.metadata?.createdAt && (
												<div>
													@{" "}
													{new Date(
														message.metadata.createdAt
													).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
														hour12: true,
													})}
												</div>
											)}
											{message.metadata?.model && (
												<div>Model type: {message.metadata.model}</div>
											)}
										</div>
									</div>
								);
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
			</form>
		</div>
	);
}
