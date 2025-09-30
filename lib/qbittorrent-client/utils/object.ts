export function filterEmptyValues(obj: Record<string, any>) {
	const result: Partial<Record<keyof typeof obj, any>> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value != null && value !== '') {
			result[key] = value;
		}
	}

	return result;
}
