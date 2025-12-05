import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import type { MyUIMessage } from "./types";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: MyUIMessage[] } = await req.json();

		const result = streamText({
			model: openai("gpt-4.1-nano"),
			messages: convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse({
			messageMetadata: ({ part }) => {
				console.log("part: ", part);
				if (part.type === "start") {
					return {
						createdAt: Date.now(),
					};
				}
				if (part.type === "finish") {
					console.log(part.totalUsage);
					return {
						totalTokens: part.totalUsage.totalTokens,
					};
				}
				if (part.type === "finish-step") {
					return {
						model: part.response.modelId,
					};
				}
			},
		});
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
