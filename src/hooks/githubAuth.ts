import { GHUserDetails, ghClient } from '../githubApiClient';
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
// import { Octokit } from 'octokit'


export const TOKEN_KEY = 'github_token';

const initialToken = localStorage.getItem(TOKEN_KEY);

export const LAST_LOGIN_KEY = 'github_last_login';

export const STATE_KEY = 'github_state';

if (!localStorage.getItem(STATE_KEY)) {
  // set it to someting random to prevent bad actors from messing with url
  localStorage.setItem(STATE_KEY, uuid());
}

export const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const getCurrentUser = async (access_token: string) => {
  try {
    const res = await ghClient.get<GHUserDetails>('/user', {
      headers: {
        Authorization: `token ${access_token}`,
      }
    });
    return res.data;
  } catch (err) {
    return null;
  }
}

export const TokenContext = createContext<string | null>(null);

export const useAuthToken = () => {
  const token = useContext(TokenContext);

  return token;
}

export const useGitHubAuth = () => {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState<GHUserDetails | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let currentToken = token;
      console.log({ currentToken })
      // check if we have access token in hash
      if (location.hash.length) {
        
        const hash = location.hash.slice(1).split('&').map(p => p.split('=')).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }), {} as Record<string, string>);
        if (hash.access_token) {
          
          setToken(hash.access_token);
          localStorage.setItem(TOKEN_KEY, hash.access_token);

          currentToken = hash.access_token;
          // clear token from url
          location.hash = '';
        }
      }
      if (!currentToken) {
        // initalize github login flow
        const state = uuid();
        localStorage.setItem(STATE_KEY, state);

        const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
  
        // send the user to github login flow
        location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&login=${lastLogin ?? ''}&allow_signup=false`;

        // nothing else can happen now until login flow is complete 
        return;
      }

      const currentUser = await getCurrentUser(currentToken!);

      if (!currentUser) {
        setToken(null);
        setError(`Couldn't get user from access token`);
      } else {
        localStorage.setItem(LAST_LOGIN_KEY, currentUser.login);
      }
      setUser(currentUser)
    })();
  }, [token]);

  return {
    token,
    user,
    error,
    logout: () => {
      setToken(null);
      localStorage.setItem(LAST_LOGIN_KEY, '');
    }
  }
}