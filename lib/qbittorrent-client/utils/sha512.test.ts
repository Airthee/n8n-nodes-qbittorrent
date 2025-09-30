import { describe, expect, it } from 'vitest';
import { sha512 } from './sha512';

describe('sha512', () => {
	it('should return sha512 from data', async () => {
		const content = 'hello world';

		const hash = await sha512(content);

		expect(hash).toEqual(
			'0x309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f',
		);
	});
});
