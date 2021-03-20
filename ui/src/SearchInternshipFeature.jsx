import React from 'react';
import {
  Segment,
  Header,
  Dropdown,
  Label,
  Input,
  Form,
  Checkbox,
  Popup,
  Grid,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import InternshipsFilters from './InternshipFilters';
import { dropdownCareerInterest, recommendation } from './RecommendationScript';

function SearchInternshipFeature({
                                   onChildClick,
                                   locationVal,
                                   companyVal,
                                   sortVal,
                                   searchQuery,
                                   skillsVal,
                                   isRemote,
                                   careerVal,
                                 }) {
  const internships = new InternshipsFilters();
  const data = internships.mergeData();
  let locationChange = locationVal;
  let companyChange = companyVal;
  let sortChange = sortVal;
  let searchQueryChange = searchQuery;
  let skillChange = skillsVal;
  let remoteCheck = isRemote;
  let careerChange = careerVal;
  const sortBy = [
    { key: 'posted', text: 'posted', value: 'posted' },
    { key: 'internship', text: 'internship', value: 'internship' },
    { key: 'company', text: 'company', value: 'company' },
  ];
  const setFilters = () => {
    const remoteFilter = internships.isRemote(data, remoteCheck);
    const searchFiltered = internships.filterBySearch(remoteFilter, searchQueryChange);
    const companyFiltered = internships.filterByCompany(searchFiltered, companyChange);
    const sorted = internships.sortedBy(companyFiltered, sortChange);
    const recommendedData = recommendation(skillChange, careerChange, sorted, locationChange);
    onChildClick(recommendedData, locationChange, companyChange, sortChange, searchQueryChange, skillChange, remoteCheck, careerChange);
    window.scrollTo({
      top: 30,
      left: 100,
      behavior: 'smooth',
    });
  };
  const handleSearchChange = (event) => {
    searchQueryChange = event.target.value;
  };
  const handleCompanyChange = (event) => {
    companyChange = event.target.value;
  };
  const getRemote = () => {
    remoteCheck = !remoteCheck;
    setFilters();
  };
  const handleSubmit = () => {
    setFilters();
  };
  const getLocation = (event, { value }) => {
    locationChange = value;
    setFilters();
  };
  const getSort = (event, { value }) => {
    sortChange = value;
    setFilters();
  };
  const getSkills = (event, { value }) => {
    skillChange = value;
    setFilters();
  };
  const getCareerInterest = (event, { value }) => {
    careerChange = value;
    setFilters();
  };
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
  return (
    <Segment style={{ width: '100%', borderRadius: '10px', marginTop: '3rem' }}>
      <Grid columns={'equal'}>
        <Grid.Row>
          <Grid.Column>
            <p>
              <p>
                Sort by {' '}
                <Dropdown
                  inline
                  header='Sort by...'
                  options={sortBy}
                  defaultValue={sortBy[0]}
                  onChange={getSort}
                />
              </p>
            </p>
          </Grid.Column>
          <Grid.Column>
            <Form onSubmit={handleSubmit}>
              <Popup
                trigger={
                  <Form>
                    <Form.Field icon='search'
                                iconPosition='left'
                                placeholder='Search ...'
                                onChange={handleSearchChange}
                                fluid
                                control={Input}
                                label={{ children: 'Search' }}
                    />
                  </Form>
                }
                content='Press enter to search by internship titles!'
                on={'focus'}
              />
            </Form>
          </Grid.Column>
          <Grid.Column>
            <Form onSubmit={handleSubmit}>
              <Form.Dropdown
                fluid multiple selection clearable
                control={Dropdown}
                options={dropdownCareerInterest()}
                label={{ children: 'Career Interest' }}
                placeholder='Career Interest'
                search
                onChange={getCareerInterest}>
              </Form.Dropdown>
            </Form>
          </Grid.Column>
          <Grid.Column>
            <Form>
              <Form.Field
                label={{ children: 'Skills' }}
                placeholder='Skills'
                search
                fluid multiple selection clearable
                control={Dropdown}
                options={internships.dropdownSkills(data)}
                onChange={getSkills}
                style={{ flexGrow: 0 }}
              />
            </Form>
          </Grid.Column>
          <Grid.Column>
            <Form>
              <Form.Field placeholder='Location'
                          label={{ children: 'Location' }}
                          onChange={getLocation}
                          fluid multiple selection clearable
                          options={internships.dropdownLocation(data)}
                          control={Dropdown}
                          style={{ flexGrow: 0 }}
              />
            </Form>
            <Checkbox style={{ paddingTop: '1rem' }} label='Remote'
                      onClick={getRemote}/>
          </Grid.Column>
          <Grid.Column>
            <Form onSubmit={handleSubmit}>
              <Form.Field icon='home'
                          label={{ children: 'Company' }}
                          control={Input}
                          iconPosition='left'
                          placeholder='Company'
                          onChange={handleCompanyChange}
                          fluid
              />
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Header style={{ paddingBottom: '0', marginTop: '0rem' }}>
              Last Updated: {moment(internships.lastScraped(data)).fromNow()}
            </Header>
          </Grid.Column>
          <Grid.Column textAlign={'right'}>
            <Grid.Row>
              <div style={{ paddingBottom: '0', paddingRight: '0.5rem' }}>
                <Header style={{
                  paddingBottom: '0', margin: '0 0 0 0', paddingRight: '0.5rem',
                  paddingTop: '0.3rem', lineHeight: '10px',
                  display: 'inline-block',
                }} as={'h4'}>
                  Key:
                </Header>
                <Label circular style={has}>
                  Has skill
                </Label>
                <Label circular style={notHave}>
                  Missing skill
                </Label>
              </div>
            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}

SearchInternshipFeature.propTypes = {
  onChildClick: PropTypes.func.isRequired,
  passedData: PropTypes.array.isRequired,
  locationVal: PropTypes.string.isRequired,
  companyVal: PropTypes.string.isRequired,
  sortVal: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  skillsVal: PropTypes.array.isRequired,
  isRemote: PropTypes.bool.isRequired,
  careerVal: PropTypes.array.isRequired,
};

export default SearchInternshipFeature;
