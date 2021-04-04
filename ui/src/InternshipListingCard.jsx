import {
  Button,
  Card,
  Grid,
  Icon,
  Label,
  Modal,
  Popup,
  Form,
  Radio,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';

// eslint-disable-next-line consistent-return
function isRemote(remote) {
  if (remote) {
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
  const studentSkills = [''];
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
  if (typeof stringDate === 'undefined') {
    return 'N/A';
  }
  const date = moment(stringDate).fromNow();
  if (date !== 'Invalid Date') {
    return date;
  }
  return 'Unknown';
}

function description(internshipDescription) {
  try {
    const noScriptDescript = internshipDescription.replace(/<script>(.*?)<\/script>/gi, '');
    return (
        <span dangerouslySetInnerHTML={{ __html: noScriptDescript }}/>
        // internshipDescription.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)
    );
  } catch (e) {
    return '';
  }
}

function siteName(url) {
  try {
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
    if (url.includes('youtern')) {
      return 'Youtern';
    }
    if (url.includes('ihiretechnology')) {
      return 'iHireTechnology';
    }
    if (url.includes('stackoverflow')) {
      return 'iHireTechnology';
    }
    if (url.includes('glassdoor')) {
      return 'Glassdoor';
    }
    if (url.includes('indeed')) {
      return 'Indeed';
    }
    if (url.includes('angel')) {
      return 'AngelList';
    }
    if (url.includes('acm')) {
      return 'ACM';
    }
    if (url.includes('apple')) {
      return 'Apple';
    }
    if (url.includes('americanexpress')) {
      return 'American Express';
    }
    if (url.includes('coolworks')) {
      return 'Coolworks';
    }
    if (url.includes('slack')) {
      return 'Hawaii Slack';
    }
    return 'NSF-REU';
  } catch (e) {
    return 'Unknown';
  }
}

function InternshipListingCard(props) {
  return (
      <Card className={'listings'}>
        <Card.Content>
          <Card.Header textAlign={'center'}>
            <a href={props.internship.url} target='_blank' rel="noopener noreferrer">
              <p style={{ color: '#263763' }}>
                {props.internship.position}
              </p>
            </a>
          </Card.Header>
          <Card.Meta style={{ paddingTop: '0.6rem' }}>
            <Grid doubling>
              <Grid.Row columns={1}>
                <Grid.Column floated={'left'}>
                  <p>
                    <Icon className='building'/>
                    <span>{props.internship.company} </span>
                  </p>
                </Grid.Column>
                <Grid.Column floated={'left'}>
                  <Icon className='map marker alternate'/>
                  <span>Internship Location: {props.internship.location.city}, {props.internship.location.state} {props.internship.location.zip}</span>
                </Grid.Column>
                <Grid.Column floated={'left'}>
                  <Icon className='calendar alternate'/>
                  <span>Posted: {formatDate(props.internship.posted)}</span>
                </Grid.Column>
                <Grid.Column floated={'left'}>
                  <Icon className='calendar alternate'/>
                  <span>Last Updated: {formatDate(props.internship.lastScraped)}</span>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Card.Meta>
          <Card.Description style={{ paddingTop: '1rem' }}>
            <div style={{ overflow: 'auto', maxHeight: '250px' }}>
              {description(props.internship.description)}
            </div>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          {props.internship.skills.map((skill) => (
              hasSkill(skill)))}
          {isRemote(props.internship.remote)}
        </Card.Content>
        <Card.Content extra textAlign={'center'}>
          <a target='_blank' rel="noopener noreferrer" href={props.internship.url}>
            <Button style={{ borderRadius: '10rem' }}>
              See Full Listing: {siteName(props.internship.url)}
            </Button>
          </a>
          <div>
            <Popup
                content='Added to favorites!'
                mouseLeaveDelay={200}
                on='click'
                trigger={
                  <button className="ui icon button" style={{ marginTop: '1em', size: '100%', maxHeight: '50px', backgroundColor: 'transparent' }}>
                    <i className="heart icon" style={{ fontSize: '100%' }}/>
                  </button>
                }
            />
            <Modal closeIcon trigger={
              <button className="ui icon button" style={{ marginTop: '1em', size: '100%', maxHeight: '50px', backgroundColor: 'transparent' }}>
                <i className="exclamation triangle icon" style={{ fontSize: '100%' }}/>
              </button>
            }>
              <Modal.Header>Report a Problem</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <Form>
                    <Form.Field>
                      <Radio
                          label='Broken Link'
                          name='radioGroup'
                          value='this'
                          checked={'this'}
                      />
                    </Form.Field>
                    <Form.Field>
                      <Radio
                          label='Missing Data Fields'
                          name='radioGroup'
                          value='that'
                          checked={'that'}
                      />
                    </Form.Field>
                    <Form.TextArea label='Other' placeholder='Explain the error here. Feel free to provide screenshots or links.' />
                  </Form>
                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button style={{ backgroundColor: 'rgb(89, 119, 199)', color: 'white' }}>
                  Report
                </Button>
              </Modal.Actions>
            </Modal>
          </div>
        </Card.Content>
      </Card>
  );
}

InternshipListingCard.propTypes = {
  internship: PropTypes.object.isRequired,
};

export default InternshipListingCard;
