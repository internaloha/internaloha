import React from 'react';
import { Container, Table, Header, Icon, Tab, Label } from 'semantic-ui-react';
import _ from 'lodash';
import statisticData from './statistics/statistics.data';
import statisticsCSV from './statistics/statistics-csv';
import StatisticsRow from './StatisticsRow';
import StatisticsChart from './StatisticsChart';

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
  };

  render() {

    function getData(info) {
      delete statisticsCSV.siteName;
      const arrays = _.map(statisticsCSV, function (site) {
        const arr = [];
        const siteInfo = _.map(site, function (data) {
          arr.push(data[info]);
          return arr;
        });
        return [...new Set(siteInfo)];
      });
      return arrays;
    }

    function formatInfo() {
      const chartData = [];
      const allData = [];
      const keys = Object.keys(statisticsCSV);
      const types = [
        'lastScraped', 'position', 'company', 'contact', 'location', 'posted', 'due', 'start',
        'end', 'compensation', 'qualifications', 'skills', 'remote', 'index', 'url', 'description'];
      for (let i = 0; i < types.length; i++) {
        const arrays = getData(types[i]);
        allData.push(arrays);
      }
      for (let i = 0; i < keys.length; i++) {
        const info = [];
        for (let j = 0; j < keys.length; j++) {
          if (allData && allData[j]) {
            const obj = {
              name: types[j],
              data: allData[j][i][0],
            };
            info.push(obj);
          }
        }
        chartData.push({
          name: keys[i],
          data: info,
        });
      }
      return chartData;
    }

    const dates = getData('lastScraped');

    function getPercentageChange(oldNumber, newNumber) {
      const decreaseValue = oldNumber - newNumber;

      return (decreaseValue / oldNumber) * 100;
    }

    function showErrorIcon(site) {
      console.log(site);
      const url = site.data[14].data;
      const currentNum = url[url.length - 1];
      const prevNum = url.length >= 2 ? url[url.length - 2] : 0;
      const total = getPercentageChange(currentNum, prevNum);
      const icon = total < -20 ? 'warning sign' : '';
      console.log(total);
      const obj = {
        color: 'blue',
        key: site.name, icon: icon,
        content: (
          <div>
            {site.name}
            <Label>{url[url.length - 1]}</Label>
          </div>
        ),
      };
      return obj;
    }

    function getPanes() {
      const info = formatInfo('url').map((site, index) => (
        {
        menuItem: (showErrorIcon(site)),
        render: () => <Tab.Pane>
          <StatisticsChart
            statistics={site} key={index} date={dates[index][0]}/>
        </Tab.Pane>,
      }));
      return info;
    }

    return (
        <div>
          <Container style={{ marginTop: '10rem', marginBottom: '4rem' }}>
            <Header textAlign={'center'}
                    as={'h2'}
                    style={{ marginBottom: '2rem' }}>
              Statistics
            </Header>
            <Tab
              menu={{ fluid: true, vertical: true, tabular: true }}
              grid = {{ paneWidth: 13, tabWidth: 3 }}
              panes={getPanes()} />
             {/* {_.map((formatInfo('url')), (statistics, index) => <StatisticsChart */}
             {/* statistics={statistics} key={index} date={dates[index][0]}/>)} */}
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
