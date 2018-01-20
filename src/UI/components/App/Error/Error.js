import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import styles from './Error.css';

export default class Error extends Component {

	static propTypes = {
		children: PropTypes.node
	};

	static defaultProps = {
		children: null
	};

	render() {
		if(!this.props.children) {
			return null;
		}

		return (
			<Typography type="caption" align="center" className={styles.root}>
				{this.props.children}
			</Typography>
		)
	}
}