import jsx from './jsx';
import globalCss from './global.css';
import css from './css';
import assets from './assets';

export default config => {
	return [
		jsx(config),
		globalCss(config),
		css(config),
		assets(config)
	];
};