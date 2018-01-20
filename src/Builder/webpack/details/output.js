import {resolve} from 'path';
import extend from 'extend';

const sharedOutput = {
	chunkFilename: '[name]-[chunkhash].js'
};

export default config => {
	const {
		root,
		dev,
		prod,
		library,
		client,
		server,
		devServerPort,
		dll,
		output: outputPaths
	} = config;

	const output = extend(true, {}, sharedOutput);

	if(server) {
		output.filename = '[name].js';
		output.path = resolve(root, outputPaths.server);
	}

	if(client) {
		if(library && !dll) {
			output.filename = '[name].js';
		}
		else {
			output.filename = '[name]-[hash].js';
			output.chunkFilename = '[name]-[chunkhash].js';
		}

		output.path = resolve(root, outputPaths.client);

		if(dev && !library) {
			output.publicPath = `http://localhost:${devServerPort}/`;
		}

		if(prod || library) {
			output.publicPath = '/assets/';
		}
	}

	if(library) {
		output.library = library;

		if(!dll) {
			output.libraryTarget = 'commonjs2';
		}
	}

	return output;
}