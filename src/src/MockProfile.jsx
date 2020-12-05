import React from 'react';
import {
  Segment,
  Header,
  Dropdown,
  Form, Modal, Button,
} from 'semantic-ui-react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import InternshipsFilters from './InternshipFilters';
import { recommendation, dropdownCareerInterest } from './RecommendationScript';

function MockProfile({ onChildClick, skillsVal, careerVal }) {
  const [open, setOpen] = React.useState(true);

  const internships = new InternshipsFilters();
  const data = internships.mergeData();

  // let locationChange = locationVal;
  // let companyChange = companyVal;
  // let sortChange = sortVal;
  // let searchQueryChange = searchQuery;
  // let remoteCheck = isRemote;

  let skillChange = skillsVal;
  let careerChange = careerVal;
  let recommendedData = [];

  const setFilters = () => {
    // const remoteFilter = internships.isRemote(data, remoteCheck);
    // const searchFiltered = internships.filterBySearch(remoteFilter, searchQueryChange);
    // const skillsFiltered = internships.filterBySkills(searchFiltered, skillChange);
    // const locationFiltered = internships.filterByLocation(skillsFiltered, locationChange);
    // const companyFiltered = internships.filterByCompany(locationFiltered, companyChange);
    // const sorted = internships.sortedBy(companyFiltered, sortChange);
    onChildClick(recommendedData, skillChange, careerChange);

    window.scrollTo({
      top: 70,
      left: 100,
      behavior: 'smooth',
    });
  };

  // console.log(test(data))

  // const handleSearchChange = (event) => {
  //   searchQueryChange = event.target.value;
  // };
  //
  // const getRemote = () => {
  //   if (remoteCheck) {
  //     remoteCheck = false;
  //   } else {
  //     remoteCheck = true;
  //   }
  //   setFilters();
  // };

  const handleSubmit = () => {
    setFilters();
  };

  //
  // const getLocation = (event, { value }) => {
  //   locationChange = value;
  //   setFilters();
  // };
  //
  // const getCompany = (event, { value }) => {
  //   companyChange = value;
  //   setFilters();
  // };
  //
  // const getSort = (event, { value }) => {
  //   sortChange = value;
  //   setFilters();
  // };
  //
  const getSkills = (event, { value }) => {
    skillChange = value;
    recommendedData = recommendation(skillChange, careerChange, data);
    setFilters();
  };

  const getCareerInterest = (event, { value }) => {
    careerChange = value;
    recommendedData = recommendation(skillChange, careerChange, data);
    setFilters();
  };

  const sticky = {
    position: '-webkit-sticky',
    position: 'sticky',
    top: '6.5rem',
  };

  const onSubmit = () => {
    if (careerChange.length === 0 || skillChange.length === 0) {
      swal({
        title: 'Fields are required',
        text: '',
        icon: 'error',
      });
      return;
    }
    setOpen(false);
  };

  return (
      <Modal
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          closeOnDimmerClick={false}
          trigger={<div/>}
      >
        <Modal.Header>Enter your Information</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form>
              <Form.Field
                  required
                  fluid multiple selection clearable
                  control={Dropdown}
                  options={internships.dropdownSkills()}
                  label={{ children: 'Skills' }}
                  placeholder='Skills'
                  search
                  onChange={getSkills}
              />
            </Form>
            <div style={{ paddingTop: '2rem' }}>
              <Form onSubmit={handleSubmit}>
                <Form.Field
                    required
                    fluid multiple selection clearable
                    control={Dropdown}
                    options={dropdownCareerInterest()}
                    label={{ children: 'Career Interest' }}
                    placeholder='Career Interest'
                    search
                    onChange={getCareerInterest}
                />
              </Form>
            </div>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
              content="Submit"
              labelPosition='right'
              icon='checkmark'
              onClick={() => onSubmit()}
              positive

          />
        </Modal.Actions>
      </Modal>
      // <Segment style={sticky}>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Header>
      //       Mock Profile
      //       <Header.Content>
      //         Total results found: {internships.total(passedData)}
      //       </Header.Content>
      //     </Header>
      //   </div>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Form>
      //       <Form.Field
      //           fluid multiple selection clearable
      //           control={Dropdown}
      //           options={internships.dropdownSkills()}
      //           label={{ children: 'Skills' }}
      //           placeholder='Skills'
      //           search
      //           onChange={getSkills}
      //       />
      //     </Form>
      //   </div>
      //   <div style={{ paddingTop: '2rem' }}>
      //     <Form onSubmit={handleSubmit}>
      //       <Form.Field
      //           fluid multiple selection clearable
      //           control={Dropdown}
      //           options={dropdownCareerInterest()}
      //           label={{ children: 'Career Interest' }}
      //           placeholder='Career Interest'
      //           search
      //           onChange={getCareerInterest}
      //       />
      //     </Form>
      //   </div>
      // </Segment>
  );
}

MockProfile.propTypes = {
  onChildClick: PropTypes.func.isRequired,
  passedData: PropTypes.array.isRequired,
  skillsVal: PropTypes.array.isRequired,
  careerVal: PropTypes.array.isRequired,
};

export default MockProfile;
