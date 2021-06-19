import debounce from 'lodash/fp/debounce';
import React, { ChangeEventHandler, useState } from 'react';
import classes from './App.module.scss';
import { useGitHubUserSearch } from './hooks/githubApi';
import SearchBar from './components/SearchBar';


const SEARCH_MINIMUM_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 500;

const App = () => {
  const { users, loading, search } = useGitHubUserSearch();

  const rawHandleSearch: ChangeEventHandler<HTMLInputElement> = ({ target: { value } }) => {
    if (value.length >= SEARCH_MINIMUM_CHARS) {
      search(value);
    }
  }

  const handleSearch = debounce(SEARCH_DEBOUNCE_MS, rawHandleSearch);

  return (
    <div className={classes.App}>
      <SearchBar onChange={handleSearch} placeholder="Name or Email Search" />
      <ul>
        {users.map((user => (
          <li key={user.id}>{user.login}</li>
        )))}
      </ul>
    </div>
  )
}

export default App
