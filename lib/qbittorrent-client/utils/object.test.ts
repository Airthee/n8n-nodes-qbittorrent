import { describe, expect, it } from 'vitest';
import { filterEmptyValues } from './object';

describe('object utils', () => {
	describe('filterEmptyValues', () => {
		it('should filter empty values', () => {
			const object = {
				v1: 'hello',
				v2: '',
				v3: 0,
				v4: false,
				v5: 1,
				v6: null,
				v7: undefined,
				v8: 'false',
				v9: true,
			};

			const result = filterEmptyValues(object);

			expect(result).toEqual({
				v1: 'hello',
				v3: 0,
				v4: false,
				v5: 1,
				v8: 'false',
				v9: true,
			});
		});
	});
});
