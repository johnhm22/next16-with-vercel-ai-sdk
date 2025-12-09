import { embed, embedMany } from "ai"; //turns text into vectors
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
	const body = await req.json();

	if (Array.isArray(body.texts)) {
		const { values, embeddings, usage } = await embedMany({
			model: openai.textEmbeddingModel("text-embedding-3-small"),
			values: body.texts,
		});
		return Response.json({
			values,
			usage,
			count: embeddings.length,
			dimensions: embeddings[0].length,
			embeddings,
		});
	}

	const { value, embedding, usage } = await embed({
		model: openai.textEmbedding("text-embedding-3-small"),
		value: body.text,
	});

	return Response.json({
		embedding,
		value,
		usage,
		dimensions: embedding.length,
	});
}
