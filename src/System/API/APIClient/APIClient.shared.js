/**
 * Base class for the API client both on the server and the client
 */
export default class Basic {

	/**
	 *
	 * @param name
	 * @param baseRoute
	 * @param actions
	 */
	constructor({name, baseRoute, actions}) {
		this.name = name;
		this.baseRoute = baseRoute;
		this.actions = actions;
		this.request = {
			method: 'GET',
			options: {},
			metas: {},
			data: {},
			params: {},
			files: [],
			route: '',
			action: null,
			req: null, // it's not for internal server requests
			res: null, // it's not for internal server requests
			next: null, // it's not for internal server requests
			realRequest: null // only used for internal server requests when the original request is important (such as React SSR)
		};
		this._buildActions();
	}

	/**
	 *
	 * @private
	 */
	_buildActions() {
		for(const entry of this.actions) {
			this[entry.name] = args => this._action({...args, ...entry});
		}
	}

	/**
	 *
	 * @param name
	 * @param value
	 * @returns {Basic}
	 * @private
	 */
	_option(name, value) {
		this.request.options[name] = value;
		return this;
	}

	/**
	 *
	 * @param values
	 * @returns {Basic}
	 * @private
	 */
	_options(values) {
		this.request.options = {
			...this.request.options,
			...values
		};
		return this;
	}

	/**
	 *
	 * @param name
	 * @param value
	 * @returns {Basic}
	 * @private
	 */
	_meta(name, value) {
		this.request.metas[name] = value;
		return this;
	}

	/**
	 *
	 * @param values
	 * @returns {Basic}
	 * @private
	 */
	_metas(values) {
		this.request.metas = {
			...this.request.metas,
			...values
		};
		return this;
	}

	/**
	 *
	 * @param data
	 * @returns {Basic}
	 * @private
	 */
	_data(data) {
		this.request.data = {
			...this.request.data,
			...data
		};
		return this;
	}

	/**
	 *
	 * @param name
	 * @param value
	 * @returns {Basic}
	 * @private
	 */
	_param(name, value) {
		this.request.params[name] = value;
		return this;
	}

	/**
	 *
	 * @param values
	 * @returns {Basic}
	 * @private
	 */
	_params(values) {
		this.request.params = {
			...this.request.params,
			...values
		};
		return this;
	}

	/**
	 *
	 * @param value
	 * @returns {Basic}
	 * @private
	 */
	_file(value) {
		this.request.files.push(value);
		return this;
	}

	/**
	 *
	 * @param values
	 * @returns {Basic}
	 * @private
	 */
	_files(values) {
		this.request.files = [
			...this.request.files,
			...Array.from(values)
		];
		return this;
	}

	/**
	 *
	 * @param name
	 * @param method
	 * @param route
	 * @param req
	 * @param res
	 * @param next
	 * @param params
	 * @param data
	 * @param files
	 * @param metas
	 * @param options
	 * @returns {*}
	 * @private
	 */
	_action({
		name,
		method,
		route,
		req = null,
		res = null,
		next = null,
		params = {},
		data = {},
		files = [],
		metas = {},
		options = {}
	}) {
		this.request.action = name;
		this.request.method = method;
		this.request.route = route;
		this.request.req = req;
		this.request.res = res;
		this.request.next = next;
		this.request.params = params;
		this.request.data = data;
		this.request.files = files;
		this.request.metas = metas;
		this.request.options = options;
		return this._exec();
	}

	/**
	 * @abstract
	 * @private
	 */
	_exec() {}
}