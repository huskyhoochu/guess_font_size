// src/lib/utils.ts

export type FontUnit = 'px' | 'rem';

export function getRandomFontSize(min: number, max: number, unit: FontUnit = 'px'): string {
	const size = Math.floor(Math.random() * (max - min + 1) + min);

	if (unit === 'rem') {
		// Convert to rem, assuming 1rem = 16px
		const remSize = size / 16;
		return remSize.toFixed(2) + 'rem';
	}

	return size + 'px';
}

export function parseFontSize(fontSizeString: string): { value: number; unit: FontUnit } {
	const match = fontSizeString.match(/^(\d+(?:\.\d+)?)(\w+)$/);
	if (!match) {
		throw new Error('Invalid font size string');
	}

	const [, value, unit] = match;
	return {
		value: parseFloat(value),
		unit: unit as FontUnit
	};
}

export function generateOptions(correctSize: string): string[] {
	const { value, unit } = parseFontSize(correctSize);
	const options = [correctSize];

	while (options.length < 4) {
		let option;
		if (unit === 'px') {
			option = getRandomFontSize(Math.max(value - 20, 10), value + 20, 'px');
		} else {
			// For rem, we'll use a smaller range
			const minRem = Math.max(value - 1.25, 0.625); // 0.625rem = 10px
			const maxRem = value + 1.25;
			option = getRandomFontSize(minRem * 16, maxRem * 16, 'rem');
		}

		if (!options.includes(option)) {
			options.push(option);
		}
	}

	return options.sort(() => Math.random() - 0.5);
}

// Example usage in your Svelte component
export function startNewRound(unit: FontUnit) {
	const character = getRandomKoreanChar();
	const fontSize =
		unit === 'px' ? getRandomFontSize(20, 100, 'px') : getRandomFontSize(1.25, 6.25, 'rem'); // 20px to 100px in rem
	const options = generateOptions(fontSize);

	return { character, fontSize, options };
}

export function getRandomKoreanChar(): string {
	const start = 0xac00;
	const end = 0xd7a3;
	return String.fromCharCode(Math.floor(Math.random() * (end - start + 1) + start));
}
