import { openai } from "@ai-sdk/openai";
import { UIMessage, streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		const result = streamText({
			model: openai("gpt-4.1-nano"),
			messages: [
				// Prompts
				// {
				// 	role: "system",
				// 	content:
				// 		"You are a helpful coding assistant. Keep response under three sentences. Focus on pracitcal examples. Reply in French.",
				// },
				//few-shot learning
				{
					role: "system",
					content: "Convert user questions about code into examples",
				},
				{
					role: "user",
					content: "How to set up a basic component",
				},
				{
					role: "assistant",
					content: `export const ComponentExample = () => {\n
					return (\n<div>Example Component</div>)
					`,
				},
				...convertToModelMessages(messages),
			],
		});

		result.usage.then((usage) => {
			console.log({
				messageCount: messages.length,
				inputTokens: usage.inputTokens,
				outputTokens: usage.outputTokens,
				totalTokens: usage.totalTokens,
			});
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
