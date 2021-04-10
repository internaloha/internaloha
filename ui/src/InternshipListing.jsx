import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Card, Container, Grid, Header, Segment } from 'semantic-ui-react';
import moment from 'moment';
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
  const [sort, setSort] = useState('posted');
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState([]);
  const [remote, setRemote] = useState(false);
  const [page, setPage] = useState(1);
  const [height, setHeight] = useState(0);
  const [career, setCareer] = useState([]);
  const ref = useRef(null);
  const totalListing = getInternshipData.length;

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
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto', paddingTop: '20px', marginBottom: '-40px' }}>
            <Segment>
              <h2 style={{ align: 'center' }}>
                Welcome to InternAloha!
              </h2>
              <Grid.Column>
                <h4>
                  <p> InternAloha is a tool developed as part of the <a href="https://radgrad.org">RadGrad Project</a> to improve the undergraduate computer
                    science degree experience by simplifying the internship discovery process.</p>
                  <p> InternAloha regularly visits a large number of Internship and corporate sites and gathers
                    information on computer science internships, with a focus on internships suitable to Hawaii students.
                    Our hope is that you find InternAloha to be a superior way to find relevant internships based on your
                    interests.</p>
                  <p>Right now, the InternAloha database contains a total of {totalListing} listings, broken down as follows: <br/>
                    ACM ({internships.getData('ACM').length}),
                    Angel List ({internships.getData('AngelList').length}),
                    American Express ({internships.getData('AExpress').length}),
                    Apple ({internships.getData('Apple').length}),
                    Chegg Internships ({internships.getData('Chegg').length}),
                    Cisco ({internships.getData('Cisco').length}),
                    Glassdoor ({internships.getData('Glassdoor').length}),
                    Hawaii Slack ({internships.getData('HawaiiSlack').length}),
                    Idealist ({internships.getData('Idealist').length}),
                    Indeed ({internships.getData('Indeed').length}),
                    LinkedIn ({internships.getData('LinkedIn').length}),
                    Monster ({internships.getData('Monster').length}),
                    Simply Hired ({internships.getData('SimplyHired').length}),
                    Stack Overflow ({internships.getData('StackOverflow').length}),
                    Student Opportunity Center (0),
                    Youtern ({internships.getData('Youtern').length}),
                    Zip Recruiter ({internships.getData('ZipRecruiter').length})</p>
                  <p>InternAloha collected this information {moment(internships.lastScraped(data)).fromNow()}. </p>
                  <p>If you have comments or question about InternAloha, please feel free to visit our
                    <a href="https://internaloha.github.io/documentation/"> home page</a>. </p>
                </h4>
              </Grid.Column>
            </Segment>
          </Grid.Row>
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto' }}>
            <SearchInternshipFeature onChildClick={handleChildClick} passedData={data}
                                     companyVal={company} locationVal={location} sortVal={sort}
                                     searchQuery={search} skillsVal={skills} isRemote={remote} careerVal={career}/>
          </Grid.Row>
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto', paddingBottom: '0px' }}>
            <Header style={{ paddingLeft: '105px', paddingTop: '20px' }}>
              Results: {internships.total(data)}
            </Header>
          </Grid.Row>
          <Grid.Row style={{ maxWidth: '80%', margin: 'auto' }}>
            <div onScroll={handleScroll()} ref={ref}>
              <Card.Group doubling centered stackable>
                {_.map(paginatedData, (internship, index) => <InternshipListingCard
                  selectedSkills={skills} internship={internship} key={index}/>)}
              </Card.Group>
            </div>
          </Grid.Row>
        </Grid>
      </Container>
  );
}

export default InternshipListing;
