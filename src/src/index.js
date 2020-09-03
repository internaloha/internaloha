import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.css';
import './index.css';
import InternshipListing from './InternshipListing';
import Statistics from './Statistcs';
import NavBar from './NavBar';

/**
 * The top level layout for the site.
 */

ReactDOM.render(
    <React.StrictMode>
      <NavBar/>
      <InternshipListing/>
      <Statistics/>
    </React.StrictMode>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);
