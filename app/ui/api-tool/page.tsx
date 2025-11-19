"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage } from "@/app/api/api-tool/route";
import { WeatherCard } from "./WeatherCard";

export default function APIToolsChatPage() {
	const [input, setInput] = useState("");

	const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
		transport: new DefaultChatTransport({
			api: "/api/api-tool",
		}),
	});

	//check details of messages returned from api
	// messages.map((message) => console.log("MESSAGE: ", message));

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
									</div>
								);
							case "tool-getWeather":
								switch (part.state) {
									case "input-streaming":
										return (
											<div key={`${message.id}-getWeather-${idx}`}>
												<div className="text-sm text-zinc-500">
													🌤️ Receiving weather request...
												</div>
												<pre className="text-xs text-zinc-600 mt-1">
													{JSON.stringify(part.input, null, 2)}
												</pre>
											</div>
										);
									case "input-available":
										return (
											<div key={`${message.id}-getWeather-${idx}`}>
												<div className="bg-zinc-800/50 border border-zinc-700 rounded text-zinc-500">
													Getting weather for {part.input.city}...
												</div>
											</div>
										);
									case "output-available":
										return (
											<div
												key={`${message.id}-getWeather-${idx}`}
												className="mt-1 mb-2"
											>
												{<WeatherCard weatherData={part.output} />}
											</div>

											// <div key={`${message.id}-getWeather-${idx}`}>
											// 	<div className="bg-zinc-400/50 border border-zinc-700 rounded my-3 p-1">
											// 		<div className="text-sm text-zinc-400">Weather</div>
											// 		<div className="text-sm text-zinc-700">
											// 			<div>{part.input.city}</div>
											// 			<div>🌤️ {part.output.location.name}</div>
											// 			<div>🌤️ {part.output.current.temp_c}</div>
											// 			{/* <div>🌤️ {part.output.current.condition.code}</div> */}
											// 		</div>
											// 	</div>
											// </div>
										);
									case "output-error":
										return (
											<div key={`${message.id}-getWeather-${idx}`}>
												<div className="bg-zinc-400/50 border border-zinc-700 rounded text-zinc-500 my-3 p-1">
													<div className="text-sm text-red-400">
														Error: {part.errorText}
													</div>
												</div>
											</div>
										);
									default:
										return null;
								}
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
						suppressHydrationWarning
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
							suppressHydrationWarning
						>
							Send
						</button>
					)}
				</div>
			</form>
		</div>
	);
}
