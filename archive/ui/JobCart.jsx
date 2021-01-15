import React from 'react';
import {
  Container,
  Grid,
  Image,
  Header,
  Button,
  Label,
  Progress,
  Item,
  Modal, Icon, Popup, Dropdown,
} from 'semantic-ui-react';
import swal from 'sweetalert';
import { withRouter } from 'react-router-dom';

class JobCart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Not Applied',
    };
  }

  render() {

    const skills = ['Social Computing', 'Cloud Computing', 'Human Computer Interaction',
      'Education'];

    const options = [
      { key: 1, text: 'Not Applied', value: 'Not Applied' },
      { key: 2, text: 'Applied', value: 'Applied' },
      { key: 3, text: 'Interviewing', value: 'Interviewing' },
      { key: 4, text: 'Offered', value: 'Offered' },
      { key: 5, text: 'Rejected', value: 'Rejected' },
    ];

    function hasSkill(skill) {
      const studentSkills = ['react', 'software engineering'];

      const has = {
        margin: '0.2rem',
        backgroundColor: '#5680E9',
        color: 'white',
      };
      const notHave = {
        margin: '0.2rem',
        backgroundColor: 'rgb(244, 244, 244)',
        color: '#8f8f8f',
      };

      if (studentSkills.includes(skill)) {
        return (
            <Label circular key={skill} style={has}>
              {skill}
            </Label>
        );
      }
      return (
          <Label circular key={skill} style={notHave}>
            {skill}
          </Label>
      );
    }

    function changeBackground(e) {
      e.currentTarget.style.boxShadow = 'rgb(195 195 195 / 79%) 0px 0px 6px 5px';
      e.currentTarget.style.cursor = 'pointer';

    }

    function onLeave(e) {
      e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0) 0px 0px 0px 0px';
    }

    const onSelectDropdown = (event, data) => {
      this.setState({ status: data.value });
    };

    const onRemove = () => {
      swal({
        title: 'Are you sure?',
        text: 'Once removed, you will not be able to recover it.',
        icon: 'warning',
        buttons: true,
        dangerMode: true,
      })
          .then((willDelete) => {
            if (willDelete) {
              swal('Internship was removed.', {
                icon: 'success',
              });
            } else {
              swal('Request canceled.');
            }
          });
    };

    return (
        <Container style={{ margin: '10rem 0rem 5rem 0rem' }}>
          <Item onMouseEnter={changeBackground} onMouseLeave={onLeave}
                style={{ padding: '0rem 2rem 0rem 2rem', backgroundColor: 'white' }}>
            <Grid doubling columns={2}>
              <Grid.Column width={12}>
                <Item.Content>
                  <Item.Header>
                    <a href={''} target="_blank" rel='noopener noreferrer'>
                      <Header as={'h3'} style={{ color: '#263763', paddingTop: '2rem' }}>
                        Software Engineering
                      </Header>
                    </a>

                  </Item.Header>
                  <Item.Meta>
                    <Item.Meta>
                      <Grid doubling>
                        <Grid.Row columns={1} style={{ paddingTop: '0.8rem' }}>
                          <Grid.Column floated={'left'} style={{ paddingBottom: '0.3rem' }}>
                            <p style={{ color: 'rgb(89, 119, 199)' }}>
                              Amazon
                            </p>
                          </Grid.Column>
                          <Grid.Column floated={'left'}>
                            <Icon className='map marker alternate'/>
                            <span>Seattle, WA 99999 | August 10, 2020</span>
                          </Grid.Column>
                        </Grid.Row>

                      </Grid>
                    </Item.Meta>
                  </Item.Meta>
                  <Item.Description style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <div align={'left'}>
                      <Button size={'tiny'}
                              style={{ backgroundColor: 'transparent', padding: '0rem' }}>
                        From: Indeed
                      </Button>
                    </div>

                  </Item.Description>
                  <Item.Extra>
                    {skills.map((skill) => (
                        hasSkill(skill)
                    ))}
                    {/* {isRemote(props.internship.remote)} */}
                  </Item.Extra>
                  <Item.Extra style={{ paddingBottom: '2rem' }}>
                  </Item.Extra>
                </Item.Content>
              </Grid.Column>
              <Grid.Column width={4} textAlign={'right'}>
                <Icon className={'x'} style={{ marginBottom: '1rem' }}
                      onClick={() => onRemove()}/>
                <br/>
                <Dropdown options={options}
                          placeholder='Status'
                          selection
                          onChange={onSelectDropdown}
                />
                <br/>
                <p style={{ margin: '1rem 0rem' }}>
                  {this.state.status}: October 10, 2020
                  <br/>
                </p>
                <Modal closeIcon trigger={
                  <Button>
                    Check info
                  </Button>
                }>
                  <Modal.Header>Description</Modal.Header>
                  <Modal.Content>
                    <Modal.Description>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi dolores esse
                      est
                      incidunt, nesciunt officia placeat quasi quis! Asperiores assumenda atque
                      corporis
                      deserunt fugit ipsum magni minima quaerat similique vitae!
                    </Modal.Description>
                  </Modal.Content>
                  <Modal.Actions>
                    <a href={''} target="_blank" rel='noopener noreferrer'>
                      <Button style={{ backgroundColor: 'rgb(89, 119, 199)', color: 'white' }}>
                        Go to Listing: Indeed
                        <Icon name='chevron right'/>
                      </Button>
                    </a>
                  </Modal.Actions>
                </Modal>
              </Grid.Column>
            </Grid>
          </Item>
        </Container>
    );
  }

}

export default withRouter(JobCart);
