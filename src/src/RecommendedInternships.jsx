import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Container, Grid, Card } from 'semantic-ui-react';
import InternshipListingCard from './InternshipListingCard';
import MockProfile from './MockProfile';
import InternshipsFilters from './InternshipFilters';

function RecommendedInternships() {
  const internships = new InternshipsFilters();
  const getInternshipData = internships.mergeData();
  const [data, setData] = useState(getInternshipData);
  const [paginatedData, setPaginatedData] = useState(getInternshipData.slice(0, 40));
  const [skills, setSkills] = useState([]);
  const [career, setCareer] = useState([]);
  const [location, setLocation] = useState([]);
  const [page, setPage] = useState(1);
  const [height, setHeight] = useState(0);
  const [remote, setRemote] = useState(false);
  const ref = useRef(null);

  /* Passes data up from MockProfile. SetPaginatedData allows data to be rendered
  * for infinite scroll. */
  function handleChildClick(passedData, skillsVal, careerVal, locationVal, remoteVal) {
    setData(passedData);
    setSkills(skillsVal);
    setCareer(careerVal);
    setLocation(locationVal);
    setRemote(remoteVal);
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
        <Grid doubling stackable>
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto' }}>
            <MockProfile onChildClick={handleChildClick} passedData={data}
                         skillsVal={skills} careerVal={career} locationVal={location}
                         isRemote={remote}/>
            <div onScroll={handleScroll()} ref={ref}>
              <Card.Group centered doubling stackable>
                {_.map(paginatedData, (internship, index) => <InternshipListingCard
                    internship={internship} key={index} hasSkills={skills} passedData={data}/>)}
              </Card.Group>
            </div>
          </Grid.Row>
        </Grid>
        <div align={'center'} style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        </div>
      </Container>
  );
}

export default RecommendedInternships;
