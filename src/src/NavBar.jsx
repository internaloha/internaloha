import React from 'react';
import { Container, Menu, Image, Icon } from 'semantic-ui-react';
import { Link } from '@reach/router';

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
              All Internships
            </Menu.Item>
            <Menu.Item>Recommended Internships</Menu.Item>
            <Menu.Item position='right'><Icon className='user circle'/>Profile</Menu.Item>
          </Menu>
        </Container>
    );
  }
}

export default NavBar;
