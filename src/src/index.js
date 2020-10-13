import React from 'react';
import { render } from 'react-dom';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import 'semantic-ui-css/semantic.css';
import './index.css';
// import { Router } from '@reach/router';
import Landing from './Landing';
import InternshipListing from './InternshipListing';
import Statistics from './Statistcs';
import NavBar from './NavBar';

/**
 * The top level layout for the site.
 */
const App = () => (
    <Router>
      <NavBar/>
      <Switch>
        <Route exact path={'/internbit'} component={Landing}/>
        <Route exact path={'/internbit/all-internships'} component={InternshipListing}/>
        <Route exact path={'/internbit/statistics'} component={Statistics}/>
      </Switch>
    </Router>
);

render(<App/>, document.getElementById('root'));

// import React from 'react';
// import ReactDOM from 'react-dom';
// import 'semantic-ui-css/semantic.css';
// import './index.css';
// import InternshipListing from './InternshipListing';
// import Statistics from './Statistcs';
// import NavBar from './NavBar';
//
// /**
//  * The top level layout for the site.
//  */
//
// ReactDOM.render(
//     <React.StrictMode>
//       <NavBar/>
//       <InternshipListing/>
//       <Statistics/>
//     </React.StrictMode>,
//   // eslint-disable-next-line no-undef
//   document.getElementById('root'),
// );
