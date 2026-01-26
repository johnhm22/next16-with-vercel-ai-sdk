import { generateObject, generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function POST(req: Request) {
	const { text } = await req.json();
	try {
		//generateObject is now deprecated. generateText recommended, but getting errors.
		const result = await generateObject({
			model: openai("gpt-4.1-mini"),
			output: "enum",
			enum: ["positive", "negative", "neutral"],
			prompt: `Classify a sentiment in this text: ${text}`,
		});
		// const { output } = await generateText({
		// 	model: openai("gpt-4.1-mini"),
		// 	output: Output.array({
		// 		element: z.enum(["positive", "negative", "neutral"]),
		// 	}),
		// 	prompt: `Classify a sentiment in this text: ${text}`,
		// });

		// console.log("response from AI call: ", result.toJsonResponse());

		return result.toJsonResponse();
	} catch (error) {
		console.error("Error generating a sentiment", error);
		return new Response("There was an error when generating a sentiment", {
			status: 500,
		});
	}
}
