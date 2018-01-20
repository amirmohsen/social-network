export default config => {
	let {
		dev
	} = config;

	if(dev) {
		return 'source-map';
	}

	return false;
}