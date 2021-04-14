import React from 'react';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';

class StatisticsChart extends React.Component {
  constructor(props) {
    super(props);
    // Init state.
    this.state = { chart: {} };
  }

  componentDidMount() {
    const _this = this;
    // Init chart with data from props.
    const chart = Highcharts.chart(this.props.statistics.name, {

      title: {
        text: `Number of Listings Scraped: ${this.props.statistics.name}`,
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        formatter: function () {
          let tooltip = new Date(this.x).toLocaleString('en-US', { dateStyle: 'short' });
          const index = this.y;
          tooltip += `<br><b>Value : </b>${index}`;
          return tooltip;
        },
      },
      yAxis: {
        allowDecimals: false,
        title: {
          text: 'Number of Listings Scraped',
        },
      },
      xAxis: {
        accessibility: {
          rangeDescription: 'Scraper Performance',
        },
        title: {
          text: 'Over Time',
        },
        categories: _this.props.date.data,
        labels: {
          formatter: function () {
            return new Date(this.value).toLocaleString('en-US', { dateStyle: 'short' });
          },
        },
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
        },
      },

      series: [_this.props.statistics],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              align: 'left',
              verticalAlign: 'top',
              borderWidth: 0,
            },
          },
        }],
      },
    });
    this.setState({ chart: chart });
  }

  render() {
    return <div id={this.props.statistics.name} />;
  }
}

StatisticsChart.propTypes = {
  statistics: PropTypes.object.isRequired,
  date: PropTypes.object.isRequired,
};

export default StatisticsChart;
