import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();
		const { text } = await generateText({
			model: openai("gpt-4.1-nano"),
			// prompt: "Explain what a LLM is in simple terms",
			prompt,
		});

		return Response.json({ text });
	} catch (err) {
		console.error("Error generating text:", err);
		return Response.json({ err });
	}
}
