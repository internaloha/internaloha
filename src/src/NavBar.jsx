import React from 'react';
import { Container, Menu, Image, Icon, Dropdown } from 'semantic-ui-react';
import { Link, withRouter, NavLink } from 'react-router-dom';

/** A simple static component to render some text for the NavBar page. */
class NavBar extends React.Component {
  render() {
    const linkStyle = {
      color: '#263763',
    };
    return (
        <Container>
          <Menu className={'top meni fixed borderless'}
                style={{ backgroundColor: '#C1C8E4', border: 0, boxShadow: '0 0 BLACK' }}>
            <Menu.Item>
              <a href={'/internbit'}>
                <Image src={'images/logo.png'} size={'small'}/>
              </a>
            </Menu.Item>
            <Menu.Item>
              <Link to='/internbit/all-internships' style={linkStyle}>All Internships</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to='/internbit' style={linkStyle}>Recommended Internships</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/internbit/statistics" style={linkStyle}>Statistics</Link>
            </Menu.Item>
            {/*<Menu.Item position='right'>*/}
            {/*  <Dropdown text="John Foo" pointing="top right" icon={'user'}>*/}
            {/*    <Dropdown.Menu>*/}
            {/*      <Dropdown.Item icon="user" text="Profile" as={NavLink} exact to={'/internbit/profile'} />*/}
            {/*      <Dropdown.Item icon="file text" text="Applications" as={NavLink} exact to={'/internbit/applications'} />*/}
            {/*    </Dropdown.Menu>*/}
            {/*  </Dropdown>*/}
            {/*</Menu.Item>*/}
          </Menu>
        </Container>
    );
  }
}

export default withRouter(NavBar);
