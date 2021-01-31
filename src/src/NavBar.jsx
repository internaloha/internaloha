import React from 'react';
import { Container, Menu, Image } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';

/** A simple static component to render some text for the NavBar page. */
class NavBar extends React.Component {
  render() {
    return (
        <Container>
          <Menu className={'top meni fixed borderless'}
                style={{ backgroundColor: '#C1C8E4', border: 0, boxShadow: '0 0 BLACK' }}>
            <Menu.Item>
              <a href={'/internaloha'}>
                <Image src={'images/logo.png'} size={'small'}/>
              </a>
            </Menu.Item>
          </Menu>
        </Container>
    );
  }
}

export default withRouter(NavBar);
