import React from 'react';
import { Container, Table, Header } from 'semantic-ui-react';
import _ from 'lodash';
import statisticData from './data/statistics.data';
import StatisticsRow from './StatisticsRow';

/** A simple static component to render some text for the Statistics page. */
class Statistics extends React.Component {
  render() {
    return (
        <div>
          <Container style={{ marginTop: '10rem', marginBottom: '4rem' }}>
            <Header textAlign={'center'}
                    as={'h2'}
                    style={{ marginBottom: '2rem' }}>
              Statistics
            </Header>
            <Table attached='top' celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Site</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>Position</Table.HeaderCell>
                  <Table.HeaderCell>Company</Table.HeaderCell>
                  <Table.HeaderCell>Contact</Table.HeaderCell>
                  <Table.HeaderCell>Location</Table.HeaderCell>
                  <Table.HeaderCell>Posted</Table.HeaderCell>
                  <Table.HeaderCell>Due</Table.HeaderCell>
                  <Table.HeaderCell>Start</Table.HeaderCell>
                  <Table.HeaderCell>End</Table.HeaderCell>
                  <Table.HeaderCell>Compensation</Table.HeaderCell>
                  <Table.HeaderCell>Qualifications</Table.HeaderCell>
                  <Table.HeaderCell>Skills</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {_.map((statisticData), (statistics, index) => <StatisticsRow
                    statistics={statistics} key={index}/>)}
              </Table.Body>
            </Table>
          </Container>
        </div>
    );
  }
}

export default Statistics;
