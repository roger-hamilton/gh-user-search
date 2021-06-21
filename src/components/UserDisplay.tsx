import React, { FC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { AtSymbolIcon, LocationMarkerIcon, CodeIcon, CalendarIcon } from '@heroicons/react/outline'
import cn from 'classnames';
import { GHUser, GHUserDetails } from '../githubApiClient';
import { useUserCache } from '../hooks/userCache';
import classes from './UserDisplay.module.scss';
import { useAuthToken } from '../hooks/githubAuth';
import { DateTime } from 'luxon';
import ReactTooltip from 'react-tooltip';

const UserDisplay: FC<{ user: GHUser }> = ({ user }) => {
  const token = useAuthToken();

  const fetchUser = useCallback(() => axios.get<GHUserDetails>(user.url, {
    headers: {
      Authorization: token ? `token ${token}` : null,
    }
  }).then(res => res.data), [user])

  const userDetails = useUserCache(user.id, fetchUser);

  return (
    <div className="w-full md:w-1/2 xl:w-1/5 h-full">
      <ReactTooltip effect="solid" place="left" />
      <div className={cn(classes.userDisplay, 'group')}>
        <div className="flex flex-row">
          <img
            className={cn(classes.avatar, 'h-20')}
            src={user.avatar_url}
          />
          <div className="ml-5 flex flex-col flex-1 cursor-default">
            <a
              href={userDetails?.html_url}
              className={cn(classes.textExist, "font-bold text-lg")}
              data-tip="view profile"
            >
              {userDetails?.name}
            </a>
            <div className={cn(classes.textUknown, "group-hover:text-white inline-block")} data-tip="username">
              {user.login}
            </div>
            <div className="flex flex-row xl:flex-col justify-start cursor-default">
              <div className="text-xs my-1 inline-block mr-5">
                <CalendarIcon className={cn(classes.icon)} />
                <span data-tip="created">
                  {userDetails?.created_at
                    ? <span className={cn(classes.textExist, "group-hover:text-white")}>
                      {DateTime.fromISO(userDetails.created_at).toUTC().toFormat('yyyy-MM-dd')}
                    </span>
                    : <span className="text-gray-500 group-hover:text-gray-200 transition">????-??-??</span>
                  }
                </span>
              </div>
              <div className="text-xs cursor-default my-1 inline-block">
                <CalendarIcon className={cn(classes.icon)} />
                <span data-tip="updated">

                  {userDetails?.updated_at
                    ? <span className={cn(classes.textExist, "group-hover:text-white")}>
                      {DateTime.fromISO(userDetails.updated_at).toUTC().toFormat('yyyy-MM-dd')}
                    </span>
                    : <span className="text-gray-500 group-hover:text-gray-200 transition">????-??-??</span>
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="inline-block cursor-default">
            <LocationMarkerIcon className={cn(classes.icon)} />
            <span data-tip="location">
              {userDetails?.location
                ? <span className={cn(classes.textExist, "group-hover:text-white")}>{userDetails.location}</span>
                : <span className="text-gray-500 group-hover:text-gray-200 transition">unknown</span>
              }
            </span>
          </div>
          <div className="inline-block">
            <AtSymbolIcon className={cn(classes.icon)} />
            <span data-tip="email">
              {
                userDetails?.email
                  ? <a
                    href={`mailto:${userDetails.email}`}
                    target="_blank"
                    className={cn(classes.textExist, "group-hover:text-indigo-600")}
                  >
                    {userDetails.email}
                  </a>
                  : <span className="text-gray-500 group-hover:text-gray-200 transition cursor-default">unknown</span>
              }
            </span>
          </div>
          <div className="inline-block cursor-default">
            <CodeIcon className={cn(classes.icon)} />
            <span data-tip="view repos">
              {
                userDetails?.public_repos !== undefined
                  ? <a
                    href={userDetails.repos_url}
                    target="_blank"
                    className={cn(classes.textExist, "group-hover:text-indigo-600")}
                  >
                    {userDetails.public_repos}
                  </a>
                  : <span className="text-gray-500 group-hover:text-gray-200 transition">unknown</span>
              } Public Repos
            </span>
          </div>
        </div>
      </div>

    </div >
  );
}

export default UserDisplay;