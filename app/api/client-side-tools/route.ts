import { openai } from "@ai-sdk/openai";
import {
	UIMessage,
	streamText,
	convertToModelMessages,
	tool,
	stepCountIs,
	experimental_generateImage as generateImage,
	UIDataTypes,
	InferUITools,
} from "ai";
import ImageKit from "imagekit";
import { string, z } from "zod";

export const uploadImage = async (image: string) => {
	const imagekit = new ImageKit({
		urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
		publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
		privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
	});

	const response = await imagekit.upload({
		file: image,
		fileName: "generated_image.jpg",
	});

	console.log("response: ", response);

	return response.url;
};

const tools = {
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
			const imageUrl = await uploadImage(image.base64);
			return imageUrl;
		},
	}),
	changeBackground: tool({
		description:
			"Replace the image background with AI-generated scenes based on a text prompt",
		inputSchema: z.object({
			imageUrl: z.string().describe("URL of the uploaded image"),
			backgroundPrompt: z
				.string()
				.describe(
					`Description of the new background (e.g. "snow cover", "futuristic landscape", "an alien planet")`,
				),
		}),
		outputSchema: z.string().describe("The transformed image URL"),
	}),
	removeBackground: tool({
		description: "Remove the background of an image",
		inputSchema: z.object({
			imageUrl: z.string().describe("URL of the uploaded image"),
		}),
		outputSchema: string().describe("The transformed image URL"),
	}),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
	try {
		const { messages }: { messages: ChatMessage[] } = await req.json();

		const result = streamText({
			model: openai("gpt-5-nano"),
			messages: convertToModelMessages(messages),
			tools,
			stopWhen: stepCountIs(2),
		});
		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error streaming chat", error);
		return new Response("Failed to stream chat completion", { status: 500 });
	}
}
