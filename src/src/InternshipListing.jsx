import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Card, Container, Grid } from 'semantic-ui-react';
import InternshipListingCard from './InternshipListingCard';
import SearchInternshipFeature from './SearchInternshipFeature';
import InternshipsFilters from './InternshipFilters';

function InternshipListing() {
  const internships = new InternshipsFilters();
  const getInternshipData = internships.mergeData();
  const [data, setData] = useState(getInternshipData);
  const [paginatedData, setPaginatedData] = useState(getInternshipData.slice(0, 40));
  const [location, setLocation] = useState([]);
  const [company, setCompany] = useState('any');
  const [sort, setSort] = useState('date');
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState([]);
  const [remote, setRemote] = useState(false);
  const [page, setPage] = useState(1);
  const [height, setHeight] = useState(0);
  const [career, setCareer] = useState([]);
  const ref = useRef(null);

  /* Passes data up from SearchInternshipFeature. SetPaginatedData allows data to be rendered
  * for infinite scroll. */
  function handleChildClick(passedData, locationVal, companyVal, sortVal, searchQueryVal, skillsVal, isRemote, careerVal) {
    setData(passedData);
    setLocation(locationVal);
    setCompany(companyVal);
    setCareer(careerVal);
    setSort(sortVal);
    setSearch(searchQueryVal);
    setSkills(skillsVal);
    setRemote(isRemote);
    setPage(1);
    setPaginatedData(passedData.slice(0, 40));
  }

  /* Grabs the height */
  useEffect(() => {
    setHeight(ref.current.clientHeight);
  });

  /* Infinite scrolling */
  function handleScroll() {
    window.onscroll = function () {
      const scroll = window.innerHeight + window.pageYOffset;
      // if we hit the bottom
      if (scroll >= height - 500) {
        // if there are still more items to be loaded
        if (page <= Math.ceil(data.length / 40)) {
          const newPage = page + 1;
          setPage(newPage);
          setPaginatedData(data.slice(0, newPage * 40));
        }
      }
    };
  }

  return (
      <Container fluid style={{ paddingTop: '5rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
        <Grid columns={'equal'} doubling stackable>
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto' }}>
            <SearchInternshipFeature onChildClick={handleChildClick} passedData={data}
                                     companyVal={company} locationVal={location} sortVal={sort}
                                     searchQuery={search} skillsVal={skills} isRemote={remote} careerVal={career}/>
            <div onScroll={handleScroll()} ref={ref}>
              <Card.Group doubling centered stackable>
                {_.map(paginatedData, (internship, index) => <InternshipListingCard
                    internship={internship} key={index}/>)}
              </Card.Group>
            </div>
          </Grid.Row>
        </Grid>
      </Container>
  );
}

export default InternshipListing;
