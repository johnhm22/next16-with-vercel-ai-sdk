import { openai } from "@ai-sdk/openai";
import {
	UIMessage,
	UIDataTypes,
	InferUITools,
	streamText,
	convertToModelMessages,
	tool,
	stepCountIs,
	experimental_generateImage as generateImage,
} from "ai";
import { z } from "zod";

const tools = {
	getWeather: tool({
		description: "Get the weather for a defined location",
		inputSchema: z.object({
			city: z.string().describe("The city for which the weather is required"),
		}),
		execute: async ({ city }) => {
			const response = await fetch(
				`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`,
			);
			const data = await response.json();

			// console.log("data in api: ", data);

			const weatherData = {
				location: {
					name: data.location.name,
					country: data.location.country,
					localtime: data.location.localtime,
				},
				current: {
					temp_c: data.current.temp_c,
					condition: {
						text: data.current.text,
						code: data.current.condition.code,
					},
				},
			};

			// console.log("weatherData: ", weatherData);
			return weatherData;
		},
	}),
	//testing defining tool here to see if ts error in generate-image-tool/page.tsx disappears
	generateImage: tool({
		description: "Generate an image from a prompt",
		inputSchema: z.object({
			prompt: z.string().describe("The prompt to be used to generate an image"),
		}),
		execute: async ({ prompt }) => {
			const { image } = await generateImage({
				model: openai.imageModel("dall-e-3"),
				prompt,
				size: "1024x1024",
				providerOptions: {
					openai: {
						style: "vivid",
						quality: "hd",
					},
				},
			});
			return image.base64;
		},
		toModelOutput: () => {
			return {
				type: "content",
				value: [
					{
						type: "text",
						text: "generated image in base64",
					},
				],
			};
		},
	}),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
	try {
		const { messages }: { messages: ChatMessage[] } = await req.json();
		// console.log("messages in api: ", messages[0].parts);
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
