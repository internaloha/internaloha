import React from 'react';
import { Container, Statistic, Image, Button } from 'semantic-ui-react';
import InternshipsFilters from './InternshipFilters';


/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  render() {

    const internships = new InternshipsFilters();
    const data = internships.mergeData();
    const companies = internships.dropdownCompany(data).length;

    const background = {
      backgroundImage: 'url("images/landingBG.png")',
      height: '100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    };

    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    return (
        <div style={background}>
          <div style={{ height: `${height}px` }}>
            <Container textAlign={'center'}>
              <Image src={'images/logo.png'} size={'medium'} centered style={{ paddingTop: '10rem' }}/>
              <Statistic.Group inverted
                               style={{ marginLeft: 'auto',
                marginRight: 'auto' }}>
                <Statistic size='huge'
                           style={{ marginLeft: `${width / 4}px` }}>
                  <Statistic.Value>{data.length}</Statistic.Value>
                  <Statistic.Label>Internships</Statistic.Label>
                </Statistic>
                <Statistic size='huge'>
                  <Statistic.Value>{companies}</Statistic.Value>
                  <Statistic.Label>Companies</Statistic.Label>
                </Statistic>
              </Statistic.Group>
              <a href='/all-internships'>
                <Button
                    style={{ marginTop: '3rem', backgroundColor: '#8860D0', color: 'white' }}>
                  Get connected today!
                </Button>
              </a>
            </Container>
          </div>
        </div>
    );
  }
}

export default Landing;
