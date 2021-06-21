import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { GHUserDetails } from '../githubApiClient';

const CurrentUser: FC<{ user: GHUserDetails | null, logout: () => void }> = ({ user, logout }) => {
  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button>
              <img className="h-10 w-10 rounded-full border-2 border-transparent hover:border-indigo-600" src={user?.avatar_url} />
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
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
            >
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#logout"
                    onClick={logout}
                    className={cn(
                      active && 'bg-blue-500 text-white',
                      'block px-4 py-2'
                    )}
                  >
                    Logout
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default CurrentUser;