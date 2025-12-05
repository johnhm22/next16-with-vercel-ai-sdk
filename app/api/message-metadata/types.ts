import { UIMessage } from "ai";
import z from "zod";

export const messageDataSchema = z.object({
	createdAt: z.number().optional(),
	totalTokens: z.number().optional(),
	model: z.string().optional(),
});

export type MessageMetaData = z.infer<typeof messageDataSchema>;
export type MyUIMessage = UIMessage<MessageMetaData>;
