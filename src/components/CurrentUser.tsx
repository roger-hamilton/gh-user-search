import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { GHUserDetails } from '../githubApiClient';
import GitHubIcon from './GitHubIcon';

const CurrentUser: FC<{ user: GHUserDetails | null, logout: () => void, login: () => any }> = ({ user, logout, login }) => {

  const handleLogin = (event: React.MouseEvent) => {
    event.preventDefault();
    login();
  }

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    logout();
  }

  const items = user
    ? [
      <Menu.Item key="logged-in-as">
        {() => (
          <div className="block px-4 py-2 border-b text-sm">
            <div>Logged in as:</div>
            <div className="font-bold ml-2">
              {user.name}
            </div>
            <div className="text-gray-500 text-xs ml-2">
              {user.login}
            </div>
          </div>
        )}
      </Menu.Item>,
      <Menu.Item key="logout">
        {({ active }) => (
          <a
            href="#logout"
            onClick={handleLogout}
            className={cn(
              active && 'bg-blue-500 text-white',
              'block px-4 py-2'
            )}
          >
            Logout
          </a>
        )}
      </Menu.Item>
    ]
    : [
      <Menu.Item key="login">
        {({ active }) => <a
          href="#login"
          onClick={handleLogin}
          className={cn(
            active && 'bg-blue-500 text-white',
            'block px-4 py-2'
          )}
        >
          Login
        </a>}
      </Menu.Item>
    ];


  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button as="button" className="h-10 w-10 rounded-full ring-0 focus:ring hover:ring overflow-hidden focus:outline-none">
              {user
                ? <img className="" src={user?.avatar_url} />
                : <GitHubIcon height="40" width="40" />
              }
            </Menu.Button>
          </div>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="origin-top-right absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-10"
            >
              {items}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default CurrentUser;