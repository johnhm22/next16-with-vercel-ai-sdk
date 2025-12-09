import { openai as originalOpenAI } from "@ai-sdk/openai";
import {
	customProvider,
	defaultSettingsMiddleware,
	wrapLanguageModel,
	createProviderRegistry,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const customOpenAI = customProvider({
	languageModels: {
		fast: originalOpenAI("gpt-5-nano"),
		smart: originalOpenAI("gpt-5-mini"),
		reasoning: wrapLanguageModel({
			model: originalOpenAI("gpt-5-nano"),
			middleware: defaultSettingsMiddleware({
				settings: {
					providerOptions: {
						openai: {
							reasoningEffort: "high",
						},
					},
				},
			}),
		}),
	},
	fallbackProvider: originalOpenAI,
});

export const customAnthropicAI = customProvider({
	languageModels: {
		fast: anthropic("claude-3-4-haiku-20241922"),
		smart: anthropic("claude-sonnet-4-20250514"),
	},
});

export const registry = createProviderRegistry({
	openai: customOpenAI,
	anthropic: customAnthropicAI,
});
