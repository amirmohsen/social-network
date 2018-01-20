import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import debounce from 'debounce';
import UserActions from '../../../data/User';
import Results from './Results/Results';
import Panel from '../Panel/Panel';

@withRouter
@connect(state => ({
	store: {
		query: state.user.query,
		search: state.user.search
	}
}))
export default class Search extends Component {

	static propTypes = {
		store: PropTypes.shape({
			query: PropTypes.string.isRequired,
			search: PropTypes.array.isRequired
		})
	};

	constructor(...args) {
		super(...args);
		this.debouncedSearch = debounce(this.search, 300);
		this.state = {
			searching: false
		};
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.store.query !== nextProps.store.query) {
			if(!this.state.searching) {
				this.setState({
					searching: true
				});
			}
			this.debouncedSearch({query: nextProps.store.query});
		}
	}

	search = async ({query}) => {
		await this.props.dispatch(UserActions.search({query}));
		this.setState({
			searching: false
		});
	};

	onChange = e => this.props.dispatch(UserActions.query({query: e.target.value}));

	getResults() {
		if(this.state.searching) {
			return (
				<Typography type="subheading" component="span">
					Searching...
				</Typography>
			);
		}

		if(this.props.store.search.length) {
			return <Results/>;
		}

		if(this.props.store.query) {
			return (
				<Typography type="subheading" component="span">
					No results found for your search query!
				</Typography>
			);
		}

		return null;
	}

	render() {
		return (
			<Panel title="Find and connect with your buddies!">
				<TextField
					label="Search"
					name="search"
					value={this.props.store.query}
					onChange={this.onChange}
					margin="normal"
					fullWidth
				/>
				{this.getResults()}
			</Panel>
		);
	}
}