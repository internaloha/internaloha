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
  Search,
  Menu,
  Image, Container, Grid,
} from 'semantic-ui-react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import InternshipsFilters from './InternshipFilters';
import { Link } from 'react-router-dom';

function SearchInternshipFeature({ onChildClick, passedData, locationVal, companyVal, sortVal, searchQuery, skillsVal, isRemote }) {

  const internships = new InternshipsFilters();
  const data = internships.mergeData();

  let locationChange = locationVal;
  let companyChange = companyVal;
  let sortChange = sortVal;
  let searchQueryChange = searchQuery;
  let skillChange = skillsVal;
  let remoteCheck = isRemote;

  const sortBy = [
    { key: 'date', text: 'date', value: 'date' },
    { key: 'internship', text: 'internship', value: 'internship' },
    { key: 'company', text: 'company', value: 'company' },
  ];

  const location = internships.dropdownLocation(data);
  const company = internships.dropdownCompany(data);

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

  const handleCompanyChange = (event) => {
    companyChange = event.target.value;
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
    setFilters();
  };

  const sticky = {
    position: '-webkit-sticky',
    position: 'sticky',
    top: '6.5rem',
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
                      defaultValue={sortBy[0].value}
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
                                    iconPosition='right'
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
              <Form>
                <Form.Field
                    label={{ children: 'Skills' }}
                    placeholder='Skills'
                    search
                    fluid multiple selection clearable
                    control={Dropdown}
                    options={internships.dropdownSkills(passedData)}
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
                            defaultValue={location[0].value}
                            search
                            fluid multiple selection
                            options={internships.dropdownLocation(passedData)}
                            control={Dropdown}
                            style={{ flexGrow: 0 }}
                />
              </Form>
              <Checkbox style={{ paddingTop: '1rem' }} label='Remote'
                        onClick={getRemote}/>
            </Grid.Column>

            {/*<div style={{ paddingTop: '2rem' }}>*/}
            {/*  <Header>Company</Header>*/}
            {/*  <Dropdown*/}
            {/*      placeholder='Select a company'*/}
            {/*      fluid selection options={internships.dropdownCompany(passedData)}*/}
            {/*      defaultValue={company[0].value}*/}
            {/*      onChange={getCompany}*/}
            {/*      search*/}
            {/*  />*/}
            {/*</div>*/}
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
            {/*<Grid.Row>*/}
            {/*  <div style={{ paddingBottom: '2rem', paddingRight: '0.5rem' }} align={'center'}>*/}
            {/*    <Header as={'h4'}>Key</Header>*/}
            {/*    <Label circular style={has}>*/}
            {/*      Has skill*/}
            {/*    </Label>*/}
            {/*    <Label circular style={notHave}>*/}
            {/*      Missing skill*/}
            {/*    </Label>*/}
            {/*  </div>*/}
            {/*</Grid.Row>*/}
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header style={{ paddingBottom: '0', marginTop: '0rem' }}>
                Total results found: {internships.total(passedData)}
              </Header>
            </Grid.Column>
            <Grid.Column textAlign={'right'}>
              <Grid.Row>
                <div style={{ paddingBottom: '0', paddingRight: '0.5rem' }}>
                  <Header style={{
                    paddingBottom: '0', margin: '0 0 0 0', paddingRight: '0.5rem',
                    paddingTop: '0.3rem', lineHeight: '10px',
                    display: 'inline-block'
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

      // <Segment style={sticky}>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Header>
      //       <Header.Content>
      //         Total results found: {internships.total(passedData)}
      //       </Header.Content>
      //     </Header>
      //   </div>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Header>
      //       <Header.Content>
      //         Sort by {' '}
      //         <Dropdown
      //             inline
      //             header='Sort by...'
      //             options={sortBy}
      //             defaultValue={sortBy[0].value}
      //             onChange={getSort}
      //         />
      //       </Header.Content>
      //     </Header>
      //   </div>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Form onSubmit={handleSubmit}>
      //       <Popup
      //           trigger={<Input icon='search'
      //                           iconPosition='left'
      //                           placeholder='Search ...'
      //                           onChange={handleSearchChange}
      //                           fluid
      //           />}
      //           content='Press enter to search!'
      //           on={'focus'}
      //       />
      //
      //     </Form>
      //     <div style={{ paddingTop: '2rem' }}>
      //       <Header>Skills</Header>
      //       <Dropdown
      //           placeholder='Skills'
      //           fluid
      //           multiple
      //           search
      //           selection
      //           options={internships.dropdownSkills()}
      //           onChange={getSkills}
      //       />
      //     </div>
      //   </div>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Header>Location</Header>
      //     <Dropdown placeholder='Location'
      //               onChange={getLocation}
      //               defaultValue={location[0].value}
      //               fluid selection options={internships.dropdownLocation(passedData)}
      //               search
      //     />
      //     <Checkbox style={{ paddingTop: '1rem' }} label='Remote'
      //               onClick={getRemote}/>
      //   </div>
      //
      //   {/*<div style={{ paddingTop: '2rem' }}>*/}
      //   {/*  <Header>Company</Header>*/}
      //   {/*  <Dropdown*/}
      //   {/*      placeholder='Select a company'*/}
      //   {/*      fluid selection options={internships.dropdownCompany(passedData)}*/}
      //   {/*      defaultValue={company[0].value}*/}
      //   {/*      onChange={getCompany}*/}
      //   {/*      search*/}
      //   {/*  />*/}
      //   {/*</div>*/}
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Header>Company</Header>
      //
      //     <Form onSubmit={handleSubmit}>
      //       <Input icon='home'
      //              iconPosition='left'
      //              placeholder='Enter a company'
      //              onChange={handleCompanyChange}
      //              fluid
      //       />
      //     </Form>
      //   </div>
      //   <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }} align={'center'}>
      //     <Header>Key</Header>
      //     <Label circular style={has}>
      //       Have skill
      //     </Label>
      //     <Label circular style={notHave}>
      //       Missing skill
      //     </Label>
      //   </div>
      // </Segment>
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
};

export default SearchInternshipFeature;
