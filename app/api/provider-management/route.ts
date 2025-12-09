// import { openai } from "./models";
import { UIMessage, streamText, convertToModelMessages } from "ai";
import { registry } from "./models";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		const result = streamText({
			// model: openai.languageModel("fast"),
			// model: openai.languageModel("reasoning"),
			// model: registry.languageModel("openai:fast"),
			// model: registry.languageModel("openai:reasoning"),
			model: registry.languageModel("anthropic:smart"),
			messages: convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
