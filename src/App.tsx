import React, { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import classes from './App.module.scss';
import { useUserSearch } from './hooks/userSearch';
import SearchBar from './components/SearchBar';
import UserDisplay from './components/UserDisplay';
import { LoginState, TokenContext, useGitHubAuth } from './hooks/githubAuth';
import InfinteScroll from 'react-infinite-scroll-component';
import cn from 'classnames';
import { ArrowDownIcon } from '@heroicons/react/outline';
import CurrentUser from './components/CurrentUser';
import LoginModal from './components/LoginModal';

const App = () => {

  const {
    user,
    token,
    error,
    logout,
    login,
    state,
  } = useGitHubAuth();

  const {
    users,
    total,
    loading,
    search,
    nextPage,
    clear,
  } = useUserSearch(token);

  const clearIfEmpty: ChangeEventHandler<HTMLInputElement> = useCallback(({ target: { value } }) => {
    if (!value) clear();
  }, []);

  const handleSearch = useCallback((query: string) => search(query), []);

  const hasMore = total - users.length > 0;

  useEffect(() => {
    if (state === LoginState.NotLoggedIn) {
      setShowModal(true);
    }
  }, [state])

  const [showModal, setShowModal] = useState(state === LoginState.NotLoggedIn);

  const handleLogout = () => {
    logout();
  }

  const handleLogin = () => {
    setShowModal(true);
  }

  return (
    <div className={cn(classes.App, 'h-screen flex flex-col overflow-hidden')}>
      <TokenContext.Provider value={token}>
        <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} login={login} />
        <div className="flex flex-row">
          <SearchBar
            onSearch={handleSearch}
            onChange={clearIfEmpty}
            placeholder="Search by Name or Email"
            loading={loading}
            minimumChars={1}
          />
          <CurrentUser user={user} logout={handleLogout} login={handleLogin} />
        </div>
        <div id="infinite-scroller" className="flex-1 overflow-auto mt-2" >
          <InfinteScroll
            dataLength={users.length}
            scrollableTarget="infinite-scroller"
            next={nextPage}
            hasMore={total - users.length > 0}
            loader={<h4>Loading...</h4>}
            className={cn("flex flex-row flex-wrap justify-center items-start py-5 content-start", { ['min-h-screen']: hasMore })}
          >
            {users.map(user => (
              <UserDisplay
                user={user}
                key={user.id}
              />
            ))}
            {!loading && total - users.length > 0 &&
              <h3>
                <ArrowDownIcon className="h-5 inline-block animate-bounce" />
                Scroll To See More
                <ArrowDownIcon className="h-5 inline-block animate-bounce" />
              </h3>
            }
          </InfinteScroll>
        </div>
      </TokenContext.Provider>
    </div>
  )
}

export default App
