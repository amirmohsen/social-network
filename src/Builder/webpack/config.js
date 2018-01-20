import {resolve} from 'path';
import entry from './details/entry';
import output from './details/output';
import rules from './details/rules/rules';
import resolveLoader from './details/resolveLoader';
import plugins from './details/plugins';
import devtool from './details/devtool';
import target from './details/target';
import externals from './details/externals';
import node from './details/node';

/**
 * Generate a webpack config based on the passed in config
 * Calls many smaller functions with each returning part of the webpack config
 * And turns them all into one single unified webpack config
 * @param config
 * @returns {*}
 */
export default config => {
	let {
		root,
		library,
		dll,
		configDir,
		alias = {}
	} = config;

	alias = {
		...{
			client: {},
			server: {}
		},
		...alias
	};

	config.alias = alias;

	let webpackConfig = {
		context: root,
		entry: entry(config),
		output: output(config),
		resolve: {
			modules: [
				root,
				'node_modules'
			],
			alias: {
				'$config': configDir
			}
		},
		plugins: plugins(config),
		devtool: devtool(config)
	};

	if(library && dll) {
		return webpackConfig;
	}

	return {
		...webpackConfig,
		module: {
			rules: rules(config)
		},
		resolveLoader: resolveLoader(config),
		target: target(config),
		externals: externals(config),
		node: node(config)
	};
}