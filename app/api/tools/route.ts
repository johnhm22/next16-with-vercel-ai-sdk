import { openai } from "@ai-sdk/openai";
import {
	UIMessage,
	UIDataTypes,
	InferUITools,
	streamText,
	convertToModelMessages,
	tool,
	stepCountIs,
} from "ai";
import { z } from "zod";

const tools = {
	getWeather: tool({
		description: "Get the weather for a defined location",
		inputSchema: z.object({
			city: z.string().describe("The city for which the weather is required"),
		}),
		execute: async ({ city }) => {
			if (city === "St Neots") {
				return "10C and really wet";
			} else if (city === "Los Angeles") {
				return "25C and sunny";
			} else {
				return "unknown location";
			}
		},
	}),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
	try {
		const { messages }: { messages: ChatMessage[] } = await req.json();
		messages.map((message) => console.log(message.parts));

		const result = streamText({
			model: openai("gpt-4.1-nano"),
			messages: [...convertToModelMessages(messages)],
			tools,
			stopWhen: stepCountIs(2),
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
