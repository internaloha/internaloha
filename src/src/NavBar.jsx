import React from 'react';
import { Container, Menu, Image, Icon } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';

/** A simple static component to render some text for the NavBar page. */
class NavBar extends React.Component {
  render() {
    const linkStyle = {
      color: '#263763',
    };
    return (
        <Container>
          <Menu className={'top meni fixed borderless'} style={{ backgroundColor: '#C1C8E4' }}>
            <Menu.Item>
              <a href={'/'}>
                <Image src={'images/logo.png'} size={'small'}/>
              </a>
            </Menu.Item>
            <Menu.Item>
              <Link to='/all-internships' style={linkStyle}>All Internships</Link>
            </Menu.Item>
            <Menu.Item>Recommended Internships</Menu.Item>
            <Menu.Item>
              <Link to="/statistics" style={linkStyle}>Statistics</Link>
            </Menu.Item>
            <Menu.Item position='right'><Icon className='user circle'/>Profile</Menu.Item>
          </Menu>
        </Container>
    );
  }
}

export default withRouter(NavBar);
