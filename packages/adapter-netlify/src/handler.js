import { __fetch_polyfill } from '@sveltejs/kit/install-fetch';
import { App } from './server/app.js';

__fetch_polyfill();

export function init(manifest) {
	const app = new App(manifest);

	return async (event) => {
		const { httpMethod, headers, rawUrl, body, isBase64Encoded } = event;

		const encoding = isBase64Encoded ? 'base64' : headers['content-encoding'] || 'utf-8';
		const rawBody = typeof body === 'string' ? Buffer.from(body, encoding) : body;

		const rendered = await app.render({
			url: rawUrl,
			method: httpMethod,
			headers,
			rawBody
		});

		if (!rendered) {
			return {
				statusCode: 404,
				body: 'Not found'
			};
		}

		const partial_response = {
			statusCode: rendered.status,
			...split_headers(rendered.headers)
		};

		if (rendered.body instanceof Uint8Array) {
			// Function responses should be strings (or undefined), and responses with binary
			// content should be base64 encoded and set isBase64Encoded to true.
			// https://github.com/netlify/functions/blob/main/src/function/response.ts
			return {
				...partial_response,
				isBase64Encoded: true,
				body: Buffer.from(rendered.body).toString('base64')
			};
		}

		return {
			...partial_response,
			body: rendered.body
		};
	};
}

/**
 * Splits headers into two categories: single value and multi value
 * @param {Record<string, string | string[]>} headers
 * @returns {{
 *   headers: Record<string, string>,
 *   multiValueHeaders: Record<string, string[]>
 * }}
 */
function split_headers(headers) {
	/** @type {Record<string, string>} */
	const h = {};

	/** @type {Record<string, string[]>} */
	const m = {};

	for (const key in headers) {
		const value = headers[key];
		const target = Array.isArray(value) ? m : h;
		target[key] = value;
	}
	return {
		headers: h,
		multiValueHeaders: m
	};
}
