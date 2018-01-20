import React from 'react';
import {render} from 'react-dom';
import { AppContainer } from 'react-hot-loader'
import Config from 'src/Config';
import UI from 'src/UI/UI';

/**
 * Render the user interface on the client side
 */
export default class FrontendServer {

	run() {
		this.render();

		// if(Config.isDev && module.hot) {
		// 	module.hot.accept('src/UI/UI', this.render);
		// }
	}

	render = () => {
		// render(
		// 	<AppContainer>
		// 		<UI/>
		// 	</AppContainer>,
		// 	document.querySelector('.app-main-wrapper')
		// );

		render(
			<UI/>,
			document.querySelector('.app-main-wrapper')
		);
	};
}