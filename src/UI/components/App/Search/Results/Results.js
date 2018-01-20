import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import ConnectionsTable from '../../ConnectionsTable/ConnectionsTable';
import styles from './Results.css';

@withRouter
@connect(state => ({
	store: {
		search: state.user.search,
		users: state.user.users
	}
}))
export default class Results extends Component {

	static propTypes = {
		store: PropTypes.shape({
			search: PropTypes.array.isRequired,
			users: PropTypes.objectOf(PropTypes.object).isRequired
		})
	};

	getData() {
		return this.props.store.search.map(id => this.props.store.users[id]);
	}

	render() {
		return <ConnectionsTable data={this.getData()} className={styles.root}/>;
	}
}