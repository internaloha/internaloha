import React from 'react';
import { Table, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class StatisticsRow extends React.Component {

  render() {
    const total = this.props.statistics.entries;
    const position = ((this.props.statistics.position / total) * 100).toString().substring(0, 5);
    const company = ((this.props.statistics.company / total) * 100).toString().substring(0, 5);
    const contact = ((this.props.statistics.contact / total) * 100).toString().substring(0, 5);
    const location = ((this.props.statistics.location / total) * 100).toString().substring(0, 5);
    const posted = ((this.props.statistics.posted / total) * 100).toString().substring(0, 5);
    const due = ((this.props.statistics.due / total) * 100).toString().substring(0, 5);
    const start = ((this.props.statistics.start / total) * 100).toString().substring(0, 5);
    const end = ((this.props.statistics.end / total) * 100).toString().substring(0, 5);
    const compensation = ((this.props.statistics.compensation / total) * 100).toString().substring(0, 5);
    const qualifications = ((this.props.statistics.qualifications / total) * 100).toString().substring(0, 5);
    const skills = ((this.props.statistics.skills / total) * 100).toString().substring(0, 5);
    const description = ((this.props.statistics.description / total) * 100).toString().substring(0, 5);
    const lastScraped = this.props.statistics.lastScraped;

    function formatDate(stringDate) {
      const date = new Date(stringDate).toDateString();
      if (date !== 'Invalid Date') {
        return date;
      }
      return 'N/A';
    }

    function lastRow(site) {
      if (site === 'Total') {
        return (
            <Table.Row>
              <Table.Cell>
                <Header as='h4'>
                  {site}
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4'>
                  N/A
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {total}
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {position}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {company}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4'>
                  {contact}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {location}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {posted}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {due}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {start}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4'>
                  {end}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {compensation}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4'>
                  {qualifications}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {skills}%
                </Header>
              </Table.Cell>
              <Table.Cell>
                <Header as='h4' >
                  {description}%
                </Header>
              </Table.Cell>
            </Table.Row>

        );
      } return (
            <Table.Row>
              <Table.Cell>{site}</Table.Cell>
              <Table.Cell>{formatDate(lastScraped)}</Table.Cell>
              <Table.Cell>{total}</Table.Cell>
              <Table.Cell>{position}%</Table.Cell>
              <Table.Cell>{company}%</Table.Cell>
              <Table.Cell>{contact}%</Table.Cell>
              <Table.Cell>{location}%</Table.Cell>
              <Table.Cell>{posted}%</Table.Cell>
              <Table.Cell>{due}%</Table.Cell>
              <Table.Cell>{start}%</Table.Cell>
              <Table.Cell>{end}%</Table.Cell>
              <Table.Cell>{compensation}%</Table.Cell>
              <Table.Cell>{qualifications}%</Table.Cell>
              <Table.Cell>{skills}%</Table.Cell>
              <Table.Cell>{description}%</Table.Cell>
            </Table.Row>
        );
    }
    return (
        <>
          {lastRow(this.props.statistics.site)}
        </>
    );
  }
}

StatisticsRow.propTypes = {
  statistics: PropTypes.object.isRequired,
};

export default StatisticsRow;
