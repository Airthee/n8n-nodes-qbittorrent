import { describe, expect, it } from 'vitest';
import { buildAuthHeaders } from './auth-headers';

describe('buildAuthHeaders', () => {
	it('should build a Bearer header from an API key', () => {
		expect(buildAuthHeaders({ apiKey: 'qbt_abc' })).toEqual({ Authorization: 'Bearer qbt_abc' });
	});

	it('should build a Cookie header from a session cookie', () => {
		expect(buildAuthHeaders({ cookie: 'SID=abc' })).toEqual({ Cookie: 'SID=abc' });
	});

	it('should throw a clear error when the API key is blank', () => {
		expect(() => buildAuthHeaders({ apiKey: '   ' })).toThrow('API key');
	});
});
