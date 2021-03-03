import React from 'react';
import { Container, Table, Header, Icon } from 'semantic-ui-react';
import _ from 'lodash';
import statisticData from './data/statistics.data';
import StatisticsRow from './StatisticsRow';

/** A simple static component to render some text for the Statistics page. */
class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statistics: statisticData,
    };
  }

   lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  onClick = (event) => {
    let value = this.lowercaseFirstLetter(event.target.textContent);
    value = value.replace(/ +/g, '');
    this.setState({ statistics: _.orderBy(statisticData, value, ['desc']) });
    console.log(this.state.statistics);
  };

  render() {
    return (
        <div>
          <Container style={{ marginTop: '10rem', marginBottom: '4rem' }}>
            <Header textAlign={'center'}
                    as={'h2'}
                    style={{ marginBottom: '2rem' }}>
              Statistics
            </Header>
            <Table attached='top' celled sortable>
              <Table.Header onClick={(event) => this.onClick(event)}>
                <Table.Row>
                  <Table.HeaderCell>Site
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Last Scraped
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Entries
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Position
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Company
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Contact
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Location
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Posted
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Due
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Start
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>End
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Compensation
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Qualifications
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Skills
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Description
                    <Icon name='angle down' />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {_.map((this.state.statistics), (statistics, index) => <StatisticsRow
                    statistics={statistics} key={index}/>)}
              </Table.Body>
            </Table>
          </Container>
        </div>
    );
  }
}

export default Statistics;
