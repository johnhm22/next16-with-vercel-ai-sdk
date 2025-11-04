import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
	const { dish } = await req.json();

	try {
		const result = streamObject({
			model: openai("gpt-4.1-nano"),
			prompt: `Generate a recipe for ${dish}`,
			schema: recipeSchema,
		});

		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Failed to generate a recipe", error);
		return new Response("There was an error when generating a recipe", {
			status: 500,
		});
	}
}
