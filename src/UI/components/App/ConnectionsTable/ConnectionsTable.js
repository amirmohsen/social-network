import React, {Component} from 'react';
import { Grid, Table, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import PropTypes from 'prop-types';
import Cell from './Cell';

export default class ConnectionsTable extends Component {

	static propTypes = {
		data: PropTypes.array.isRequired
	};

	getRows() {
		return this.props.data.map(data => ({
			...data,
			connect: data._id,
			view: data._id
		}));
	}

	render() {
		const {
			data,
			...props
		} = this.props;

		return (
			<div {...props}>
				<Grid
					rows={this.getRows()}
					columns={[
						{ name: 'firstName', title: 'First Name' },
						{ name: 'lastName', title: 'Last Name' },
						{ name: 'email', title: 'Email' },
						{ name: 'connect', title: 'Connect'},
						{ name: 'view', title: 'view'}
					]}
				>
					<Table cellComponent={Cell} />
					<TableHeaderRow />
				</Grid>
			</div>
		);
	}
}