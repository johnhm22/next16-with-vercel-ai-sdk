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
import { createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";

const tools = {
	getWeather: tool({
		description: "Get the weather for a defined location",
		inputSchema: z.object({
			city: z.string().describe("The city for which the weather is required"),
		}),
		execute: async ({ city }) => {
			if (city === "Error City") {
				throw new Error("No weather for this location");
			}
			if (city === "St Neots") {
				return "7C, sunny and dry";
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

		const url = new URL(process.env.MCP_URL!);
		const mcpClient = await createMCPClient({
			transport: new StreamableHTTPClientTransport(url, {
				requestInit: {
					headers: {
						Authorization: process.env.MCP_TOKEN!,
					},
				},
			}),
		});

		const mcpTools = await mcpClient.tools();

		const result = streamText({
			model: openai("gpt-4.1-nano"),
			messages: [...convertToModelMessages(messages)],
			tools: { ...mcpTools, ...tools },
			stopWhen: stepCountIs(2),
			onFinish: async () => mcpClient.close(),
			onError: async (error) => {
				mcpClient.close();
				console.log("Error on streaming", error);
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
