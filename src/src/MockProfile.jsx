import React from 'react';
import {
  Segment,
  Header,
  Dropdown,
  Form,
  Select,
} from 'semantic-ui-react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import InternshipsFilters from './InternshipFilters';
import { recommendation } from './RecommendationSystems';

function MockProfile({ onChildClick, passedData, locationVal, companyVal, sortVal, searchQuery, skillsVal, isRemote }) {

  const internships = new InternshipsFilters();
  const data = internships.mergeData();

   let locationChange = locationVal;
   let companyChange = companyVal;
   let sortChange = sortVal;
   let searchQueryChange = searchQuery;
   let remoteCheck = isRemote;

  let skillChange = skillsVal;
  let recommendedData = [];

  const setFilters = () => {
    const remoteFilter = internships.isRemote(data, remoteCheck);
    const searchFiltered = internships.filterBySearch(remoteFilter, searchQueryChange);
    const skillsFiltered = internships.filterBySkills(searchFiltered, skillChange);
    const locationFiltered = internships.filterByLocation(skillsFiltered, locationChange);
    const companyFiltered = internships.filterByCompany(locationFiltered, companyChange);
    const sorted = internships.sortedBy(companyFiltered, sortChange);
    onChildClick(sorted, locationChange, companyChange, sortChange, searchQueryChange, skillChange, remoteCheck);
    window.scrollTo({
      top: 70,
      left: 100,
      behavior: 'smooth',
    });
  };

  const handleSearchChange = (event) => {
    searchQueryChange = event.target.value;
  };

  const getRemote = () => {
    if (remoteCheck) {
      remoteCheck = false;
    } else {
      remoteCheck = true;
    }
    setFilters();
  };

  const handleSubmit = () => {
    setFilters();
  };

  const getLocation = (event, { value }) => {
    locationChange = value;
    setFilters();
  };

  const getCompany = (event, { value }) => {
    companyChange = value;
    setFilters();
  };

  const getSort = (event, { value }) => {
    sortChange = value;
    setFilters();
  };

  const getSkills = (event, { value }) => {
    skillChange = value;
    recommendedData = recommendation(skillChange, data);
    setFilters();
  };

  const sticky = {
    position: '-webkit-sticky',
    position: 'sticky',
    top: '6.5rem',
  };

  const interestOptions = [
    { key: 'm', text: 'Social Computing', value: 'Social Computing' },
    { key: 'f', text: 'Web Development', value: 'Web Development' },
    { key: 'o', text: 'Education', value: 'Education' },
  ];

  return (
      <Segment style={sticky}>
        <div style={{ paddingTop: '2rem' }}>
          <Header>
            Mock Profile
            <Header.Content>
              Total results found: {internships.total(passedData)}
            </Header.Content>
          </Header>
        </div>
        <div style={{ paddingTop: '2rem' }}>
          <Form>
            <Form.Field
                fluid multiple selection clearable
                control={Dropdown}
                options={internships.dropdownSkills()}
                label={{ children: 'Skills' }}
                placeholder='Skills'
                search
                onChange = {getSkills}
            />
          </Form>
        </div>
        <div style={{ paddingTop: '2rem' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Field
                fluid multiple selection clearable
                control={Select}
                options={interestOptions}
                label={{ children: 'Career Interest' }}
                placeholder='Career Interest'
                search
            />
          </Form>
        </div>
      </Segment>
  );
}

MockProfile.propTypes = {
  onChildClick: PropTypes.func.isRequired,
  passedData: PropTypes.array.isRequired,
  locationVal: PropTypes.string.isRequired,
  companyVal: PropTypes.string.isRequired,
  sortVal: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  skillsVal: PropTypes.array.isRequired,
  isRemote: PropTypes.bool.isRequired,
};

export default MockProfile;
