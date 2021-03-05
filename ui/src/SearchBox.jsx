import React, { useState } from 'react';
import { Form, Input, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

function SearchBox({ onSearch }) {
  const [search, setSearch] = useState('');
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };
  const handleFormSubmit = () => {
    onSearch(search);
  };
  return (
      <Form onSubmit={handleFormSubmit}>
        <Input icon='search'
               iconPosition='left'
               placeholder='Search ...'
               onChange={handleSearchChange}
               fluid

        />
        <Button onClick={handleFormSubmit}>Submit</Button>
      </Form>
  );
}

SearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBox;
