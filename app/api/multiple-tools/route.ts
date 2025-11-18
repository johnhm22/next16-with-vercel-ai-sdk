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
	getLocation: tool({
		description: "Get the location of a user",
		inputSchema: z.object({
			name: z.string().describe("The name of the user"),
		}),
		execute: async ({ name }) => {
			if (name === "Bruce") {
				return "St Neots";
			} else if (name === "William") {
				return "Los Angeles";
			} else {
				return "Unknown";
			}
		},
	}),
	getWeather: tool({
		description: "Get the weather for a defined location",
		inputSchema: z.object({
			city: z.string().describe("The city for which the weather is required"),
		}),
		execute: async ({ city }) => {
			// if (city === "Error City") {
			// 	throw new Error("No weather for this location");
			// }
			if (city === "St Neots") {
				return "Cold, sunny and dry";
			}
			if (city === "Los Angeles") {
				return "25C and sunny";
			} else {
				return "Unknown location";
			}
		},
	}),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
	try {
		const { messages }: { messages: ChatMessage[] } = await req.json();
		console.log("messages in api: ", messages[0].parts);
		const result = streamText({
			model: openai("gpt-5-mini"),
			messages: convertToModelMessages(messages),
			tools,
			stopWhen: stepCountIs(3),
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
