import React from 'react';
import { Container, Checkbox, Header, Button, Input, Form, Select, Dropdown } from 'semantic-ui-react';
import swal from 'sweetalert';
import { withRouter } from 'react-router-dom';

class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: false,
    };
  }

  render() {

    const majorOptions = [
      { key: 'm', text: 'B.A Information & Computer Science', value: 'B.A Information & Computer Science' },
      { key: 'f', text: 'B.S Computer Science', value: 'B.S Computer Science' },
      { key: 'o', text: 'B.S Computer Science - Data Science', value: 'B.S Computer Science - Data Science' },
    ];

    const skillOptions = [
      { key: 'm', text: 'Java', value: 'Java' },
      { key: 'f', text: 'Javascript', value: 'Javascript' },
      { key: 'o', text: 'React', value: 'React' },
    ];

    const careerOptions = [
      { key: 'm', text: 'Software Developer', value: 'Software Developer' },
      { key: 'f', text: 'Full-Stack Developer', value: 'Full-Stack Developer' },
      { key: 'o', text: 'Data Scientist', value: 'Data Scientist' },
    ];

    const interestOptions = [
      { key: 'm', text: 'Social Computing', value: 'Social Computing' },
      { key: 'f', text: 'Web Development', value: 'Web Development' },
      { key: 'o', text: 'Education', value: 'Education' },
    ];

    const email = [
      { key: 'm', text: 'Daily', value: 'Daily' },
      { key: 'f', text: 'Weekly', value: 'Weekly' },
    ];

    const onToggle = () => {
      this.setState({ notifications: !this.state.notifications });
    };

    const onUpdate = () => {
      swal({
        title: 'Profile updated',
        text: '',
        icon: 'success',
      });
    };

    return (
        <Container style={{
          margin: '10rem 0rem 5rem 0rem', backgroundColor: 'white',
          borderRadius: '1rem', padding: '3rem 2rem',
        }}>
          <Form>
            <Header textAlign={'center'} as={'h2'}>
              Edit Profile
            </Header>
            <Form.Group widths='equal'>
              <Form.Field
                  id='form-input-control-first-name'
                  control={Input}
                  label='First name'
                  placeholder='First name'
              />
              <Form.Field
                  id='form-input-control-last-name'
                  control={Input}
                  label='Last name'
                  placeholder='Last name'
              />
            </Form.Group>
            Profile Image
            <Button style={{ marginLeft: '1rem' }}>
              Upload
            </Button>
            <Form.Field
                control={Select}
                options={majorOptions}
                label={{ children: 'Major' }}
                placeholder='Major'
                search
            />
            <Form.Field
                fluid multiple selection clearable
                control={Dropdown}
                options={skillOptions}
                label={{ children: 'Skills' }}
                placeholder='Skills'
                search
            />
            <Form.Field
                fluid multiple selection clearable
                control={Select}
                options={interestOptions}
                label={{ children: 'Interests' }}
                placeholder='Interests'
                search
            />
            <Form.Field
                fluid multiple selection clearable
                control={Select}
                options={careerOptions}
                label={{ children: 'Career Goals' }}
                placeholder='Career'
                search
            />

            <Header textAlign={'center'} as={'h2'}>
              Notifications
            </Header>
            <Checkbox toggle label={'Enable Email Notifcations?'}
                      onChange={onToggle}
                      style={{ marginBottom: '1rem' }}/>
            { this.state.notifications ? (
                    <Form.Field
                        control={Select}
                        options={email}
                        label={{ children: 'Email Frequency' }}
                        placeholder='Email frequency'
                        search
                    />
                )
            :
                (<div>

                </div>)
            }
            <div align={'center'} >
              <Button style={{ marginTop: '1rem' }}
                onClick={onUpdate}>
                Update
              </Button>
            </div>
          </Form>
        </Container>
    );
  }

}

export default withRouter(EditProfile);
