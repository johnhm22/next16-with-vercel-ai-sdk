import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as generateSpeech } from "ai";

export async function POST(req: Request) {
	try {
		const { text } = await req.json();

		const { audio } = await generateSpeech({
			model: openai.speech("tts-1"),
			text,
			voice: "sage",
		});

		return new Response(audio.uint8Array as BodyInit, {
			headers: {
				ContentType: audio.mediaType || "audio/mpeg",
			},
		});
	} catch (error) {
		console.error("Couldn't create an audio file", error);
		return new Response("Failed to generate speech", { status: 500 });
	}
}
