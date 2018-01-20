import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import has from 'lodash/has';
import Panel from '../Panel/Panel';
import ConnectionsTable from '../ConnectionsTable/ConnectionsTable';
import UserActions from '../../../data/User';

@withRouter
@connect(state => ({
	store: {
		currentUser: state.user.current
	}
}))
export default class Connections extends Component {

	static propTypes = {
		store: PropTypes.shape({
			currentUser: PropTypes.object.isRequired
		})
	};

	componentWillMount() {
		this.props.dispatch(UserActions.loadConnections({
			userId: this.props.store.currentUser._id
		}));
	}

	getData() {
		return has(this.props.store.currentUser, `connections.0._id`) ? this.props.store.currentUser.connections : [];
	}

	render() {
		return (
			<Panel title="Your Connections">
				<ConnectionsTable data={this.getData()}/>
			</Panel>
		);
	}
}