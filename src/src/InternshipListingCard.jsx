import { Button, Card, Grid, Icon, Label, Modal, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

function isRemote(city) {
  if (city === 'Remote') {
    return (
        <Label circular style={{
          backgroundColor: '#263763',
          color: 'white',
          margin: '0.2rem',
        }}>
          Remote
        </Label>
    );
  }
}

function hasSkill(skill) {
  const studentSkills = ['machine learning', 'software engineering'];

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

function formatDate(stringDate) {
  const date = new Date(stringDate);
  return date.toDateString();
}

function siteName(url) {
  if (url.includes('linkedin')) {
    return 'LinkedIn';
  }
  if (url.includes('ziprecruiter')) {
    return 'ZipRecruiter';
  }
  if (url.includes('monster')) {
    return 'Monster';
  }
  if (url.includes('simplyhired')) {
    return 'SimplyHired';
  }
  if (url.includes('internships')) {
    return 'Chegg';
  }
}

function InternshipListingCard(props) {

  return (
      <Card>
        <Card.Content>
          <Card.Header textAlign={'center'}>
            <a href={props.internship.url}>
              <p style={{ color: '#263763' }}>
                {props.internship.position}
              </p>
            </a>
          </Card.Header>
          <Card.Meta style={{ paddingTop: '0.6rem' }}>
            <Grid doubling>
              <Grid.Row columns={1}>
                <Grid.Column floated={'left'}>
                  <p style={{ color: '#8860D0' }}>
                    {props.internship.company}
                  </p>
                </Grid.Column>
                <Grid.Column floated={'left'}>
                  <Icon className='map marker alternate'/>
                  <span>{props.internship.location.city}, {props.internship.location.state} {props.internship.location.zip}</span>
                </Grid.Column>
              </Grid.Row>

            </Grid>
          </Card.Meta>
          <Card.Description style={{ paddingTop: '1rem' }}>
            <Modal trigger={
              <div align={'center'}>
                <Button>Description</Button>
              </div>
            }>
              <Modal.Header>Description</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  {props.internship.description.split('\n').map((item, key) =>
                      <span key={key}>{item}<br/></span>)}
                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button primary>
                  <Icon name='star'/>
                  Add to Favorites
                </Button>
                <Button primary>
                  Go to Listing <Icon name='chevron right'/>
                </Button>
              </Modal.Actions>
            </Modal>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          {props.internship.skills.map((skill) => (
              hasSkill(skill)
          ))}
          {isRemote(props.internship.location.city)}
        </Card.Content>
        <Card.Content extra textAlign={'center'} style={{ paddingTop: '1rem' }}>
          Posted: {formatDate(props.internship.posted)}
        </Card.Content>
        <Card.Content extra textAlign={'center'}>
          <a href={props.internship.url}>
            <Button color={'teal'} style={{ borderRadius: '10rem' }}>
              Go to Listing: {siteName(props.internship.url)}
            </Button>
          </a>
        </Card.Content>
      </Card>
  );
}

InternshipListingCard.propTypes = {
  internship: PropTypes.object.isRequired,
};

export default InternshipListingCard;
