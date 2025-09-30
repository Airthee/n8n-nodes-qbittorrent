import { vi } from 'vitest';
import { IRequestHelper } from '../../interfaces/request-helper.interface';

export class MockHttpHelper implements IRequestHelper {
	request = vi.fn().mockResolvedValue({ body: { data: { message: 'Ok' } }, headers: {} });
}
