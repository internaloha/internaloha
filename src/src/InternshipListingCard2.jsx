import { Button, Grid, Icon, Label, Item, Header, Popup, Modal } from 'semantic-ui-react';
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
    return 'NSF-REU';
  } catch (e) {
    return 'Unknown';

  }
}

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
    return (
         <span dangerouslySetInnerHTML={{ __html: internshipDescription }}/>
        // internshipDescription.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)
    );
  } catch (e) {
    console.log('No description field.');
    return '';
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
                      <span>{props.internship.location.city}, {props.internship.location.state} {props.internship.location.zip} | {formatDate(props.internship.posted)}
</span>
                    </Grid.Column>
                  </Grid.Row>

                </Grid>
              </Item.Meta>
            </Item.Meta>
            <Item.Description style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
              <div align={'left'}>
                <Button size={'tiny'} style={{ backgroundColor: 'transparent', padding: '0rem' }}>
                  From: {siteName(props.internship.url)}
                </Button>
              </div>

            </Item.Description>
            <Item.Extra>
              {props.internship.skills.map((skill) => (
                  hasSkill(skill)
              ))}
              {isRemote(props.internship.location.city)}
            </Item.Extra>
            <Item.Extra style={{ paddingBottom: '2rem' }}>
            </Item.Extra>
          </Item.Content>
        }>
          <Modal.Header>Description</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              {/* <span dangerouslySetInnerHTML={{ __html: props.internship.description }}/> */}
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
      </Item>
  );
}

InternshipListingCard2.propTypes = {
  internship: PropTypes.object.isRequired,
};

export default InternshipListingCard2;
