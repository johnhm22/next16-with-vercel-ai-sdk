interface WeatherData {
	location: {
		name: string;
		country: string;
		localtime: string;
	};
	current: {
		temp_c: number;
		condition: {
			text: string;
			code: number;
		};
	};
}

interface WeatherCardProps {
	weatherData: WeatherData;
}

interface WeatherStyle {
	backgroundColor: string;
	accentColor: string;
	textColor: string;
	borderColor: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData }) => {
	const getWeatherStyle = (conditionalCode: number): WeatherStyle => {
		const styles: Record<number, WeatherStyle> = {
			1000: {
				//sunny
				backgroundColor: "bg-amber-500/70",
				accentColor: "bg-amber-400",
				textColor: "bg-amber-200",
				borderColor: "border-amber-400/50",
			},
			1003: {
				//partly cloudy
				backgroundColor: "bg-slate-600/70",
				accentColor: "bg-slate-500",
				textColor: "bg-slate-200",
				borderColor: "border-slate-400/50",
			},
			1063: {
				//rain
				backgroundColor: "bg-blue-500/70",
				accentColor: "bg-amber-500",
				textColor: "bg-blue-200",
				borderColor: "border-blue-400/50",
			},
			1066: {
				//snow
				backgroundColor: "bg-snow-500/70",
				accentColor: "bg-sky-400",
				textColor: "bg-blue-200",
				borderColor: "border-sky-400/50",
			},
		};

		const defaultStyle: WeatherStyle = {
			backgroundColor: "bg-violet-600/70",
			accentColor: "bg-violet-500",
			textColor: "bg-violet-200",
			borderColor: "border-violet-400/50",
		};

		return styles[conditionalCode] || defaultStyle;
	};

	const formatTime = (dataTimeStr: string) => {
		const date = new Date(dataTimeStr);
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const WeatherStyle = getWeatherStyle(weatherData.current.condition.code);

	return (
		<div
			className={`${WeatherStyle.borderColor} rounded-lg border max-w-small w-full-max overflow-hidden`}
		>
			<div
				className={`px-3 py-4 flex justify-between text-white ${WeatherStyle.backgroundColor}`}
			>
				<div>
					<div className="text-3xl font-semibold">
						{weatherData.location.name}
					</div>
					<div>{formatTime(weatherData.location.localtime)}</div>
				</div>
				<div className="">
					<span className="font-bold text-3xl mr-1">
						{weatherData.current.temp_c}
					</span>
					<span className="text-xs align-super mr-0.5">o</span>
					<span className="font-extralight text-lg">C</span>
				</div>
			</div>
		</div>
	);
};
