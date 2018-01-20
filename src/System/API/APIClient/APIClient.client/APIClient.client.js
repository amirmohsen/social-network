import {stringify as queryStringify} from 'qs';
import {compile as compilePath} from 'path-to-regexp';
import SharedAPIClient from '../APIClient.shared';
import CSRFTokenHander from './CSRFTokenHandler';

/**
 * Client-specific API Client extending the base class
 */
export default class APIClient extends SharedAPIClient {

	requestDetails;

	/**
	 *
	 * @param args
	 */
	constructor(args) {
		super(args);
		this.csrfTokenHandler = CSRFTokenHander.getInstance({
			apiHandler: this.constructor
		});
	}

	/**
	 *
	 * @returns {Promise.<*>}
	 * @private
	 */
	async _exec() {
		this.buildRequestDetails();
		if(this.requestDetails.path === `/api/csrf-token`) {
			return await this.execRequest({
				requestNewCSRFTokenIfInvalid: false
			});
		}
		else {
			return await this.csrfTokenHandler.run({
				returnExisting: true,
				execRequest: this.execRequest.bind(this)
			});
		}
	}

	/**
	 * Turns the inner request into an actual http request
	 */
	buildRequestDetails() {
		let
			path = this.pathGen(),
			options = {
				method: this.request.method,
				headers: {
					...(this.request.files.length ? {} : {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					}),
					...this.request.metas,
				},
				credentials: 'same-origin'
			};

		if(this.request.method !== 'get' && this.request.method !== 'head') {
			if(this.request.files.length) {
				const formData = new FormData();

				for(const file of this.request.files) {
					formData.append('files', file);
				}

				formData.append('data', JSON.stringify(this.request.data));

				options.body = formData;
			}
			else {
				options.body = JSON.stringify(this.request.data);
			}
		}

		this.requestDetails = {
			path,
			options
		};
	}

	/**
	 * Use parameters and options to generate a path with named parameters and a querystring
	 * @param includeQS
	 * @returns {string}
	 */
	pathGen(includeQS = true) {
		let path = '/api';

		path += `${this.baseRoute}${this.request.route}`;

		const params = {};

		for(const key in this.request.params) {
			if(Array.isArray(this.request.params[key])) {
				params[key] = this.request.params[key].join(',');
			}
			else {
				params[key] = this.request.params[key];
			}
		}

		path = compilePath(path)(params);

		if(includeQS && Object.keys(this.request.options).length > 0) {
			path+= `?${queryStringify(this.request.options)}`;
		}

		return path;
	}

	/**
	 * Executes API calls and handles invalid CSRF token errors by repeating the request with a new token
	 * @param csrfToken
	 * @param requestNewCSRFTokenIfInvalid
	 * @returns {Promise.<*>}
	 */
	async execRequest({csrfToken = null, requestNewCSRFTokenIfInvalid = true}) {
		try {
			let {path, options} = this.requestDetails;

			if(csrfToken) {
				options.headers['csrf-token'] = csrfToken;
			}

			if(['GET', 'HEAD'].includes(options.method.toUpperCase())) {
				delete options.body;
			}

			this.realRequest = new Request(path, options);
			let response = await fetch(this.realRequest);
			let responseBody = await response.json();

			if (response.ok) {
				return responseBody;
			}

			if(
				responseBody.meta.invalidCSRFToken
				&& requestNewCSRFTokenIfInvalid
			) {
				let responseBodyRetry = await this.csrfTokenHandler.run({
					execRequest: this.execRequest.bind(this)
				});

				if(responseBodyRetry) {
					return responseBodyRetry;
				}
			}

			return responseBody;
		}
		catch(e) {
			console.error(e);
			return {
				data: null,
				error: {
					type: 'Internal Error',
					code: 503,
					title: 'Connection Error',
					message: 'An unknown error occurred.'
				},
				meta: {
					code: 503
				}
			}
		}
	}
}