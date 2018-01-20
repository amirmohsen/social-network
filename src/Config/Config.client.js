import SharedConfig from './Config.shared';
import clientEnvironmentalConfig from '$config/client.json';
import sharedEnvironmentalConfig from '$config/shared.json';

/**
 * Merging client-specific config with the shared one
 */
export default class Config extends SharedConfig {

	static init({isDev = false}) {
		this._apply({
			config: {
				...this._getBase({isDev, isProd: !isDev, isClient: true}),
				...clientEnvironmentalConfig,
				...sharedEnvironmentalConfig
			}
		});
	}
}