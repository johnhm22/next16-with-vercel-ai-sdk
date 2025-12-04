import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic";
// import { openai } from "@ai-sdk/openai";
import { UIMessage, streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		// const result = streamText({
		// 	model: openai("gpt-5-nano"),
		// 	messages: convertToModelMessages(messages),
		// 	providerOptions: {
		// 		openai: {
		// 			reasoningSummary: "auto",
		// 			reasoningEffort: "low",
		// 		},
		// 	},
		// });
		const result = await streamText({
			model: anthropic("claude-3-7-sonnet-20250219"),
			messages: convertToModelMessages(messages),
			providerOptions: {
				anthropic: {
					thinking: { type: "enabled", budgetTokens: 12000 },
				} satisfies AnthropicProviderOptions,
			},
		});
		return result.toUIMessageStreamResponse({
			sendReasoning: true,
		});
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
