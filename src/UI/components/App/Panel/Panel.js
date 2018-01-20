import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Card, { CardHeader, CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import styles from './Panel.css';

export default class Panel extends Component {

	static propTypes = {
		title: PropTypes.string.isRequired,
		children: PropTypes.node.isRequired,
		actions: PropTypes.node,
		width: PropTypes.number,
		pageTitle: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.bool
		])
	};

	static defaultProps = {
		actions: null,
		width: 1000,
		pageTitle: true
	};

	getPageTitleContent() {
		if(this.props.pageTitle === false) {
			return null;
		}

		if(this.props.pageTitle === true || this.props.pageTitle === '') {
			return this.props.title;
		}

		return this.props.pageTitle;
	}

	getPageTitle() {
		const title = this.getPageTitleContent();

		if(title) {
			return (
				<Helmet>
					<title>{title}</title>
				</Helmet>
			);
		}

		return null;
	}

	getActions() {
		if(this.props.actions) {
			return (
				<CardActions>
					{this.props.actions}
				</CardActions>
			);
		}

		return null;
	}

	render() {
		const {
			title,
			children,
			actions,
			width,
			pageTitle,
			...props
		} = this.props;

		return (
			<Card className={styles.root} style={{width}} {...props}>
				<CardHeader title={(
					<Typography type="headline" component="h1">
						{title}
					</Typography>
				)}/>
				<CardContent>
					{this.getPageTitle()}
					{children}
				</CardContent>
				{this.getActions()}
			</Card>
		);
	}
}