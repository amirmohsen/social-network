import babel from './babel';

export default config => {
	const {
		server,
		client
	} = config;

	const alias = {
		svg: 'react-svg-loader?jsx=1',
		es5: `babel-loader?${JSON.stringify(babel(config))}`,
		cssVar: 'postcss-variables-loader?es5=1'
	};

	if(server) {
		alias.copyPath = 'file-loader?emitFile=false&name=[path][name].[ext]';
		alias.copy = 'file-loader?emitFile=false&name=[name].[ext]';
	}

	if(client) {
		alias.copyPath = 'file-loader?name=[path][name].[ext]';
		alias.copy = 'file-loader?name=[name].[ext]';
	}

	return {
		alias
	};
}