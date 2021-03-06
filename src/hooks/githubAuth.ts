import { GHUserDetails, ghClient } from '../githubApiClient';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';


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

export enum LoginState {
  NotLoggedIn = 'NOT_LOGGED_IN',
  LoggedIn = 'LOGGED_IN',
  Unknown = 'UNKNOWN' // could be logging in
}

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

const parseHash = () => location.hash
  .slice(1) // remove leading '#'
  .split('&')
  .map(p => p.split('='))
  .reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    {} as Record<string, string>
  );



export const useGitHubAuth = () => {
  const [token, setToken] = useState(initialToken);

  const [user, setUser] = useState<GHUserDetails | null>(null);

  const [state, setState] = useState<LoginState>(LoginState.Unknown);

  const [error, setError] = useState<string | null>(null);

  const processHash = useCallback(() => {
    // check if we have access token in hash
    if (location.hash.length) {
      const hash = parseHash();
      // clear token from url
      location.hash = '';
  
      if (hash.access_token) {
        if (localStorage.getItem(STATE_KEY) === hash.state) {
  
          setToken(hash.access_token);
          localStorage.setItem(TOKEN_KEY, hash.access_token);
  
          return hash.access_token;
        } else {
          setError('State values do not match');
        }
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      const currentToken = processHash() ?? token;

      if (!currentToken) {
        setState(LoginState.NotLoggedIn);
        // nothing else can happen now until the users logs in
        return;
      }

      const currentUser = await getCurrentUser(currentToken!);

      if (!currentUser) {
        setToken(null);
        setError(`Couldn't get user from access token`);
        setState(LoginState.NotLoggedIn);
      } else {
        localStorage.setItem(LAST_LOGIN_KEY, currentUser.login);
        setState(LoginState.LoggedIn);
      }
      setUser(currentUser);
    })();
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      localStorage.removeItem(LAST_LOGIN_KEY);
      setState(LoginState.NotLoggedIn);
  }, [])

  const login = useCallback(() => {
    // initalize github login flow
    const state = uuid();
    localStorage.setItem(STATE_KEY, state);

    const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);

    // send the user to github login flow
    location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&login=${lastLogin ?? ''}&allow_signup=false`;
  }, []);

  return { token, user, error, state, logout, login }
}