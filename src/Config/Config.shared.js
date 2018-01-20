/**
 * The base config class for both server and client.
 */
export default class Config {

	static _getBase({isDev = false, isProd = false, isClient = false, isServer = false}) {
		return {
			subdomains: {
				static: 'static',
				draft: 'draft',
				preview: 'preview',
				admin: 'admin',
				api: 'api'
			},
			isClient,
			isServer,
			isDev,
			isProd
		};
	}

	static _apply({config}) {
		for(const key in config) {
			this[key] = config[key];
		}
	}
}