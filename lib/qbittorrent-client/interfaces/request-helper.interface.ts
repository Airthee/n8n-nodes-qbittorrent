export type RequestOptions = {
	method: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE';
	url: string;
	baseURL?: string;
	headers?: Record<string, string>;
	body?: any;
	returnFullResponse?: boolean;
};

export type RequestResponse = {
	status: number;
	body: any;
	headers: Record<string, string>;
};

export interface IRequestHelper {
	request: (options: RequestOptions) => Promise<RequestResponse>;
}
