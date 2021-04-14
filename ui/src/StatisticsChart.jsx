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
    const chart = Highcharts.chart('statistics', {

      title: {
        text: 'Number of Listings Scraped',
      },

      yAxis: {
        title: {
          text: 'Number of Listings Scraped',
        },
      },

      xAxis: {
        accessibility: {
          rangeDescription: 'Scraper Performance',
        },
        type: 'datetime',
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },

      plotOptions: {
        series: {
          pointStart: Date.parse(_this.props.date),
          label: {
            connectorAllowed: false,
          },
        },
      },

      series: _this.props.statistics,

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
          },
        }],
      },
    });
    this.setState({ chart: chart });
  }

  render() {
    return <div id='statistics' />;
  }
}

StatisticsChart.propTypes = {
  statistics: PropTypes.array.isRequired,
};

export default StatisticsChart;
