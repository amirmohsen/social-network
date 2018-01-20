import Loader from './Loader';

/**
 * Entry point function to the build process
 * @param config
 * @returns {Promise.<void>}
 */
export default async (config) => {
	let loader = new Loader(config);
	await loader.build();
	if(config.start) {
		loader.start();
	}
};