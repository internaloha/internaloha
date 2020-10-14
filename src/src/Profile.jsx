import React from 'react';
import { Container, Grid, Image, Header, Button, Label, Progress, Item } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Software Engineering',
    };
  }

  render() {

    const headerStyle = {
      margin: '1rem 0rem',
    };

    const interests = ['Social Computing', 'Cloud Computing', 'Human Computer Interaction',
    'Education'];

    const careers = ['Software Engineering', 'Mobile Development', 'Data Science', 'Education'];

    const courses = ['ICS 321', 'ICS 311', 'ICS 499', 'ICS 235'];

    const opportunities = ['HACC', 'LAVA Lab', 'ICSpark'];

    function changeBackground(e) {
      e.currentTarget.style.boxShadow = 'rgb(195 195 195 / 79%) 0px 0px 6px 5px';
      e.currentTarget.style.cursor = 'pointer';

    }

    function onLeave(e) {
      e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0) 0px 0px 0px 0px';
    }

    const renderLabels = (label, key) => (
          <Label circular color={'grey'} key={key}
            style={{ margin: '0.4rem 0.5rem', padding: '0.2rem 0.3rem' }}>
            {label}
          </Label>
      );

    const renderTab = (careerPath) => {
      this.setState({ title: careerPath });
    };

    return (
      <Container style={{ margin: '10rem 0rem 5rem 0rem' }}>
        <Grid columns={2} stackable
              style={{ backgroundColor: 'white', borderRadius: '1rem',
                padding: '3rem 2rem' }}>
          <Grid.Column width={10}>
            <Grid columns={2} stackable>
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <Image
                      style={{ marginBottom: '1.5rem' }}
                      circular
                      centered
                      size={'small'}
                      src={'https://images.squarespace-cdn.com/content/v1/54bbd50ce4b05e8a36418abc/1533226867020-NALD4HA8GBL3IUIQE9PM/ke17ZwdGBToddI8pDm48kMh3mVmBaCAeGwqCLG3iONRZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PITeQtWPcxF65ANawkK25DREOmFck9peR6QL8AnpRiPJE/rachel-rouhana-profile-picture-circle.png?format=500w'}>
                  </Image>
                  <Header style={{ margin: '0.7rem' }}>
                    Jane Foo
                  </Header>
                  <p style={{ margin: '0rem' }}>
                    B.S Computer Science
                  </p>
                  <p>
                    Intended Graduation Date | Spring 2021
                  </p>
                  <Button>
                    Edit Profile
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Grid.Row>
                    <Header style={{ marginBottom: '1rem' }}>
                      Interests
                    </Header>
                    {interests.map((interest, key) => (
                        renderLabels(interest, key)
                    ))}
                  </Grid.Row>
                  <Grid.Row>
                    <Header style={{ margin: '1rem 0rem' }}>
                      Career Goals
                    </Header>
                    {careers.map((career, key) => (
                        renderLabels(career, key)
                    ))}
                  </Grid.Row>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column stretched style={{ width: '100%' }}>
                  <Header style={{ margin: '1rem 0rem' }}>
                    Progress
                  </Header>
                  <Progress value='7.4' total='10' progress='percent' label='Software Engineering'
                    onClick={() => renderTab('Software Engineering')} onMouseEnter={changeBackground} onMouseLeave={onLeave}/>
                  <Progress value='6' total='10' progress='percent' label='Mobile Development'
                            onClick={() => renderTab('Mobile Development')} onMouseEnter={changeBackground} onMouseLeave={onLeave}/>
                  <Progress value='4' total='10' progress='percent' label='Data Science'
                            onClick={() => renderTab('Data Science')} onMouseEnter={changeBackground} onMouseLeave={onLeave}/>
                  <Progress value='6.1' total='10' progress='percent' label='Education'
                            onClick={() => renderTab('Education')} onMouseEnter={changeBackground} onMouseLeave={onLeave}/>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
          <Grid.Column width={6}
                       style={{ backgroundColor: '#e5e5e5', borderRadius: '1rem' }}>
            <Header dividing style={{ margin: '1rem 0rem' }} textAlign={'center'}>
              {this.state.title}
            </Header>
            <Header as={'h3'} style={headerStyle}>
              Courses
            </Header>
            {courses.map((course, key) => (
                renderLabels(course, key)
            ))}
            <Header as={'h3'} style={headerStyle}>
              Recommended Opportunities
            </Header>
            {opportunities.map((opportunity, key) => (
                renderLabels(opportunity, key)
            ))}
          </Grid.Column>
        </Grid>
      </Container>
    );
  }

}

export default withRouter(Profile);
