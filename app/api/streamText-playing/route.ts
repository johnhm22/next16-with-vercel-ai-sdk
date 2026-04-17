import { openai } from "@ai-sdk/openai";
import { UIMessage, streamText, convertToModelMessages, Output } from "ai";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		const result = streamText({
			// const { experimental_partialOutputStream } = streamText({
			model: openai("gpt-5-nano"),
			// output: Output.object({
			// 	schema: z.object({
			// 		recipe: z.object({
			// 			name: z.string(),
			// 			ingredients: z.array(
			// 				z.object({ name: z.string(), amount: z.string() }),
			// 			),
			// 			steps: z.array(z.string()),
			// 		}),
			// 	}),
			// }),
			// prompt: "Generate a lasagna recipe.",
			messages: convertToModelMessages(messages),
			tools: { web_search: openai.tools.webSearch() },
			// prompt: "List the top 5 San Diego news stories from the past week.",
			onFinish: ({ finishReason }) => {
				console.log("Stream finished with reason: ", finishReason);
			},
			onChunk: ({ chunk }) => {
				if (chunk.type === "source") {
					console.log("Received source: ", chunk);
				}
			},
			onError: (error) => {
				console.error("Error during streaming: ", error);
			},
		});

		// for await (const textPart of result.textStream) {
		// 	console.log(textPart);
		// }

		// result.usage.then((usage) => {
		// 	console.log({
		// 		messageCount: messages.length,
		// 		inputTokens: usage.inputTokens,
		// 		outputTokens: usage.outputTokens,
		// 		totalTokens: usage.totalTokens,
		// 	});
		// });

		// for await (const part of result.fullStream) {
		// 	if (part.type === "source" && part.sourceType === "url") {
		// 		console.log("ID: ", part.id);
		// 		console.log("Title:", part.title);
		// 		console.log("URL:", part.url);
		// 		console.log("Provider metadata:", part.providerMetadata);
		// 	}
		// }

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
