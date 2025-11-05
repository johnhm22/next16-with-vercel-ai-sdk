"use client";

import React, { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonUISchema } from "@/app/api/structured-array/schema";

export default function StructuredDataPage() {
	const [pokemonType, setPokemonType] = useState("");

	const { submit, object, isLoading, error, stop } = useObject({
		api: "/api/structured-array",
		schema: pokemonUISchema,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		submit({ type: pokemonType });
		setPokemonType("");
	};

	return (
		<div className="flex flex-col mx-auto w-full max-w-2xl pt-12 pb-24">
			{error && <div className="text-red-500 mb-4 px-4">{error.message}</div>}
			{object?.map((pokemon) => (
				<div key={pokemon?.name} className="space-y-6 px-4">
					<div className="mb-5 bg-zinc-200 p-3 rounded-lg">
						<h2 className="text-2xl font-bold mb-2">{pokemon?.name}</h2>
						<div className="grid grid-cols-2 gap-3">
							{pokemon?.abilities?.map((ability) => (
								<h4
									key={ability}
									className="font-semibold text-indigo-500 bg-zinc-300 rounded-md p-3"
								>
									{ability}
								</h4>
							))}
						</div>
					</div>
				</div>
			))}

			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 left-0 right-0 p-4 w-full mx-auto max-w-2xl bg-zinc-50"
			>
				<div className="flex gap-2">
					<input
						type="text"
						value={pokemonType}
						onChange={(e) => setPokemonType(e.target.value)}
						className="flex-1 border rounded border-zinc-300 px-2 shadow-lg"
						placeholder="dish name"
					/>
					{isLoading ? (
						<button
							onClick={stop}
							type="submit"
							className="bg-red-500 rounded px-4 py-2 text-white hover:bg-blue-700"
						>
							Stop
						</button>
					) : (
						<button
							disabled={isLoading || !pokemonType}
							type="submit"
							className="bg-blue-500 rounded px-4 py-2 text-white hover:bg-blue-700"
						>
							{isLoading ? "Generating" : "Generate"}
						</button>
					)}
				</div>
			</form>
		</div>
	);
}
