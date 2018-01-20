import SharedConfig from './Config.shared';
import serverEnvironmentalConfig from '$config/server.json';
import sharedEnvironmentalConfig from '$config/shared.json';

/**
 * Merging server-specific config with the shared one
 */
export default class Config extends SharedConfig {

	static init({root, isDev = false}) {
		this._apply({
			config: {
				...this._getBase({isDev, isProd: !isDev, isServer: true}),
				dirs: {
					root,
					dist: `${root}/dist`,
					assets: `${root}/dist/client`,
					static: `${root}/public`,
					tmp: `${root}/tmp`,
					cache: `${root}/tmp/cache`,
					logs: `${root}/tmp/logs`
				},
				paths: {
					assets: '/assets'
				},
				db: {
					host: 'localhost',
					name: '',
					port: '27017',
					user: '',
					pass: ''
				},
				search: {
					host: 'localhost',
					port: 9200
				},
				domain: '',
				port: 5000,
				ssl: false,
				ssr: false,
				disableRegister: false,
				secret: 'd4f023d6-fe5d-11e7-8be5-0ed5f89f718b',
				...serverEnvironmentalConfig,
				...sharedEnvironmentalConfig
			}
		});
	}
}