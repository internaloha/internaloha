import React from 'react';
import {
  Segment,
  Header,
  Dropdown,
  Label,
  Form,
  Checkbox,
  Grid,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
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
  const companyChange = companyVal;
  let sortChange = sortVal;
  const searchQueryChange = searchQuery;
  let skillChange = skillsVal;
  let remoteCheck = isRemote;
  let careerChange = careerVal;
  const sortBy = [
    { key: 'posted', text: 'Posted Date', value: 'posted' },
    { key: 'internship', text: 'Internship Title', value: 'internship' },
    { key: 'company', text: 'Company', value: 'company' },
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
            <Form>
              <Form.Field>
                Sort By:
              </Form.Field>
              <Form.Radio
                label={sortBy[0].text}
                value={sortBy[0].value}
                name='sortBy'
                checked={sortChange === sortBy[0].value}
                onChange={getSort}
              />
              <Form.Radio
                label={sortBy[1].text}
                value={sortBy[1].value}
                name='sortBy'
                checked={sortChange === sortBy[1].value}
                onChange={getSort}
              />
              <Form.Radio
                label={sortBy[2].text}
                value={sortBy[2].value}
                name='sortBy'
                checked={sortChange === sortBy[2].value}
                onChange={getSort}
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
        </Grid.Row>
        <Grid.Row>
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
