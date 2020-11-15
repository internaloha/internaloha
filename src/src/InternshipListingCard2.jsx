import { Button, Grid, Icon, Label, Item, Header, Popup, Modal, Form, Radio } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import swal from 'sweetalert';

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
    return 'NSF-REU';
  } catch (e) {
    return 'Unknown';

  }
}

function hasSkill(skill, hasSkills) {

  if (typeof (hasSkills) === 'undefined') {
    hasSkills = ['react', 'software engineering'];
  }
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

  if (hasSkills.includes(skill)) {
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
  const date = new Date(stringDate).toDateString();
  if (date !== 'Invalid Date') {
    return date;
  }
  return 'Unknown';
}

function changeBackground(e) {
  e.currentTarget.style.backgroundColor = '#fafafa';
  e.currentTarget.style.cursor = 'pointer';
}

function onLeave(e) {
  e.currentTarget.style.backgroundColor = 'transparent';
}

function description(internshipDescription) {
  try {
    const noScriptDescript = internshipDescription.replace(/<script>(.*?)<\/script>/gi, '');
    return (
        <span dangerouslySetInnerHTML={{ __html: noScriptDescript }}/>
        // internshipDescription.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)
    );
  } catch (e) {
    console.log('No description field.');
    return '';
  }
}

function onClick(id) {
  let string = '';
  try {
    const e = document.getElementById(id);
    if (e != null) {
      string = e.value;
      console.log(string);
    } else {
      string = null;
      console.log(string);
    }
    if (e.style.display === 'none') {
      e.style.display = 'show';
    } else {
      e.style.display = 'none';
    }
  } catch (err) {
    console.log(err);
    console.log('Still not working');
  }
}

function InternshipListingCard2(props) {

  return (
      <Item onMouseEnter={changeBackground} onMouseLeave={onLeave}
            style={{ padding: '0rem 2rem 0rem 2rem' }}>
        <Modal closeIcon trigger={
          <Item.Content>
            <Item.Header>
              <a href={props.internship.url} target="_blank" rel='noopener noreferrer'>
                <Header as={'h3'} style={{ color: '#263763', paddingTop: '2rem' }}>
                  {props.internship.position}
                </Header>
              </a>

            </Item.Header>
            <Item.Meta>
              <Item.Meta>
                <Grid doubling>
                  <Grid.Row columns={1} style={{ paddingTop: '0.8rem' }}>
                    <Grid.Column floated={'left'} style={{ paddingBottom: '0.3rem' }}>
                      <p style={{ color: 'rgb(89, 119, 199)' }}>
                        {props.internship.company}
                      </p>
                    </Grid.Column>
                    <Grid.Column floated={'left'}>
                      <Icon className='map marker alternate'/>
                      <span>{props.internship.location.city}, {props.internship.location.state} {props.internship.location.zip} | {formatDate(props.internship.posted)}</span>
                    </Grid.Column>
                  </Grid.Row>

                </Grid>
              </Item.Meta>
            </Item.Meta>
            <Item.Description style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
              <div align={'left'}>
                <div id="hiddenItem" style={{ display: 'none' }}>
                  {description(props.internship.description)}
                </div>
                <Button size={'tiny'} style={{ backgroundColor: 'transparent', padding: '0rem' }}>
                  From: {siteName(props.internship.url)}
                </Button>
                <button className="ui right labeled icon button" style={{ margin: '20px' }}
                        onClick={onClick('hiddenItem')}
                >
                  <i className="chevron down icon"></i>
                  Details
                </button>
              </div>
              <div>
                {props.internship.skills.map((skill) => (
                    hasSkill(skill, props.hasSkills)
                ))}
                {isRemote(props.internship.remote)}
              </div>
              <Item.Extra style={{ paddingBottom: '2rem' }} >
              </Item.Extra>
            </Item.Description>
          </Item.Content>
        }>
          <Modal.Header>Description</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              {description(props.internship.description)}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button style={{ backgroundColor: 'rgb(89, 119, 199)', color: 'white' }}>
              <Icon name='star'/>
              Add to Favorites
            </Button>
            <a href={props.internship.url} target="_blank" rel='noopener noreferrer'>
              <Button style={{ backgroundColor: 'rgb(89, 119, 199)', color: 'white' }}>
                Go to Listing: {siteName(props.internship.url)}
                <Icon name='chevron right'/>
              </Button>
            </a>
          </Modal.Actions>
        </Modal>
        <Popup
            content='Added to favorites!'
            mouseLeaveDelay={200}
            on='click'
            trigger={
              <Button style={{ backgroundColor: 'transparent' }}>
                Add to favorites!
              </Button>
            }
        />
        <Modal closeIcon trigger={
          <Button style={{ backgroundColor: 'transparent' }}>
            Report a problem
          </Button>
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
                      // onChange={}
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                      label='Missing Data Fields'
                      name='radioGroup'
                      value='that'
                      checked={'that'}
                      // onChange={}
                  />
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button style={{ backgroundColor: 'rgb(89, 119, 199)', color: 'white' }}>
              Report
            </Button>
          </Modal.Actions>
        </Modal>
      </Item>
  );
}

InternshipListingCard2.propTypes = {
  internship: PropTypes.object.isRequired,
  hasSkills: PropTypes.array.isRequired,
};

export default InternshipListingCard2;
