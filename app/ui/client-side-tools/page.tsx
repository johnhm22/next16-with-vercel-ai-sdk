"use client";

import React, { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Image } from "@imagekit/next";
import type { ChatMessage } from "@/app/api/client-side-tools/route";

const buildTransformationUrl = (
	baseUrl: string,
	transformation: string
): string => {
	const separator = baseUrl.includes("?") ? "&" : "?";
	return `${baseUrl}${separator}tr=${transformation}`;
};

export default function ClientSideToolsPage() {
	const [input, setInput] = useState("");
	const [files, setFiles] = useState<FileList | undefined>(undefined);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { messages, sendMessage, status, error, stop, addToolResult } =
		useChat<ChatMessage>({
			transport: new DefaultChatTransport({
				api: "/api/client-side-tools",
			}),
			sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
			async onToolCall({ toolCall }) {
				if (toolCall.dynamic) {
					return;
				}
				switch (toolCall.toolName) {
					case "changeBackground":
						{
							const { imageUrl, backgroundPrompt } = toolCall.input;
							const transformation = `e-changebg-prompt-${backgroundPrompt}`;
							const transformedUrl = buildTransformationUrl(
								imageUrl,
								transformation
							);

							addToolResult({
								tool: "changeBackground",
								toolCallId: toolCall.toolCallId,
								output: transformedUrl,
							});
						}
						break;
					case "removeBackground":
						{
							const { imageUrl } = toolCall.input;
							const transformation = `e-bgremove`;
							const transformedUrl = buildTransformationUrl(
								imageUrl,
								transformation
							);
							addToolResult({
								tool: "removeBackground",
								toolCallId: toolCall.toolCallId,
								output: transformedUrl,
							});
						}
						break;
				}
			},
		});

	console.log("messages: ", messages);

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
								if (part.mediaType?.startsWith("image/")) {
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
								if (part.mediaType?.startsWith("application/pdf")) {
									return (
										<iframe
											key={`${message.id}-${idx}`}
											src={part.url}
											width="500"
											height="600"
											title={part.filename ?? `attachment-${idx}`}
										/>
									);
								}
								return null;
							case "tool-generateImage":
								switch (part.state) {
									case "input-streaming":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-400/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-zinc-500">
													Receiving image generation request...
												</div>
												<pre>{JSON.stringify(part.input, null, 2)}</pre>
											</div>
										);
									case "input-available":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-400/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-zinc-400 mb-1">
													Generating image for {part.input.prompt}
												</div>
											</div>
										);

									case "output-available":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-400/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-zinc-400 mb-1">
													Generated image:
												</div>
												<Image
													urlEndpoint={
														process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
													}
													src={part.output}
													alt="Generated image"
													width={500}
													height={500}
													className="rounded-lg"
												/>
											</div>
										);
									case "output-error":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-red-500 mb-1">
													Error generating image: {part.errorText}
												</div>
											</div>
										);

									default:
										return null;
								}
							case "tool-changeBackground":
								switch (part.state) {
									case "input-streaming":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-400/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-zinc-500">
													Receiving image transformation request...
												</div>
												<pre>{JSON.stringify(part.input, null, 2)}</pre>
											</div>
										);
									case "input-available":
										return (
											<div
												className="bg-zinc-400/50 border border-zinc-700 rounded mt-1 mb-2"
												key={`${message.id}-changeBackground-${idx}`}
											>
												<div className="text-sm text-zinc-600 mb-1">
													Changing background to: {""}
													{part.input.backgroundPrompt}
												</div>
											</div>
										);
									case "output-available":
										return (
											<div
												className="bg-zinc-400/50 border border-zinc-700 rounded mt-1 mb-2"
												key={`${message.id}-changeBackground-${idx}`}
											>
												<div className="text-sm text-zinc-600 mb-1">
													Background changed:
												</div>
												<div>
													<Image
														urlEndpoint={
															process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
														}
														src={part.output}
														alt="Transformed image"
														width={500}
														height={500}
													/>
												</div>
											</div>
										);
									case "output-error":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-red-500 mb-1">
													Error changing image: {part.errorText}
												</div>
											</div>
										);
									default:
										return null;
								}
							case "tool-removeBackground":
								switch (part.state) {
									case "input-streaming":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-400/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-zinc-500">
													Receiving image transformation request...
												</div>
												<pre>{JSON.stringify(part.input, null, 2)}</pre>
											</div>
										);
									case "input-available":
										return (
											<div
												className="bg-zinc-400/50 border border-zinc-700 rounded mt-1 mb-2"
												key={`${message.id}-changeBackground-${idx}`}
											>
												<div className="text-sm text-zinc-600 mb-1">
													Removing background...
												</div>
											</div>
										);
									case "output-available":
										return (
											<div
												className="bg-zinc-400/50 border border-zinc-700 rounded mt-1 mb-2"
												key={`${message.id}-changeBackground-${idx}`}
											>
												<div className="text-sm text-zinc-600 mb-1">
													Background removed...
												</div>
												<Image
													urlEndpoint={
														process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
													}
													src={part.output}
													alt="Transformed image"
													width={500}
													height={500}
												/>
											</div>
										);
									case "output-error":
										return (
											<div
												key={`${message.id}-generateImage-${idx}`}
												className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mb-2"
											>
												<div className="text-sm text-red-500 mb-1">
													Error removing background: {part.errorText}
												</div>
											</div>
										);
									default:
										return null;
								}
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
