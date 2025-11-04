"use client";

import React, { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

export default function StructuredDataPage() {
	const [dishName, setDishName] = useState("");

	const { submit, object, isLoading, error, stop } = useObject({
		api: "/api/structured-data",
		schema: recipeSchema,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		submit({ dish: dishName });
		setDishName("");
	};

	return (
		<div className="border border-red-500 flex flex-col mx-auto w-full max-w-2xl pt-12 pb-24">
			{error && <div className="text-red-500 mb-4 px-4">{error.message}</div>}
			{object?.recipe && (
				<div className="space-y-6 px-4">
					<h2 className="text-2xl font-bold">{object.recipe.name}</h2>
					{object?.recipe.ingredients && (
						<div>
							<h3 className="text-xl font-semibold mb-4">Ingredients</h3>
							<div className="grid grid-cols-3 gap-4">
								{" "}
								{object.recipe.ingredients?.map((ingredient, idx) => (
									<div className="bg-zinc-200 rounded-lg p-4" key={idx}>
										<p className="font-medium">{ingredient?.name}</p>
										<p className="text-zinc-600">{ingredient?.amount}</p>
									</div>
								))}
							</div>
						</div>
					)}
					{object?.recipe?.steps && (
						<div>
							<h3 className="font-semibold mb-4 text-xl">Steps</h3>
							<ol className="gap-2 grid grid-cols-1">
								{object.recipe.steps.map((step, idx) => (
									<li className="rounded-lg bg-zinc-200 p-4" key={idx}>
										<span className="font-medium mr-2">{idx + 1}.</span>
										{step}
									</li>
								))}
							</ol>
						</div>
					)}
				</div>
			)}
			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 flex flex-col left-0 right-0 p-4 w-full mx-auto max-w-2xl"
			>
				<div className="flex gap-2">
					<input
						type="text"
						value={dishName}
						onChange={(e) => setDishName(e.target.value)}
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
							disabled={isLoading || !dishName}
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
