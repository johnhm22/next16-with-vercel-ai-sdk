import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { pokemonSchema } from "./schema";

export async function POST(req: Request) {
	const { type } = await req.json();

	try {
		const result = streamObject({
			model: openai("gpt-4.1-nano"),
			output: "array",
			prompt: `Generate a list of five ${type} type pokemon`,
			schema: pokemonSchema,
		});

		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Error generating a pokemon", error);
		return new Response("There was an error when generating a pokemon", {
			status: 500,
		});
	}
}
