import { useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';

const isAxiosError = (err: any): err is AxiosError => err.isAxiosError;

export interface GHUser {
  login: string
  id: number,
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User'
  site_admin: boolean
}

export interface GHUserDetails extends GHUser {
  name: string
  company: string
  blog: string
  location: string
  email: string
  hireable: boolean
  bio: string
  twitter_username: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GHSearchSuccess<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

export interface GHSearchError {
  error: true
  statusCode: number
  message: string
}


export type GHSearchResult<T> =
| GHSearchSuccess<T>
| GHSearchError

const isSearchError = (res: GHSearchResult<any>): res is GHSearchError => 'error' in res;

const ghClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});


type WithRateLimit<T> = T & {
  rateLimitRemaining?: number
  rateLimitReset?: number
}

export const searchPagedUsers = (query: string, perPage = 30) =>
  async (page: number): Promise<WithRateLimit<GHSearchResult<GHUser>>> => {
    try {
      const res = await ghClient.get<GHSearchResult<GHUser>>('/search/users', {
        params: {
          q: `${query} in:email ${query} in:name`,
          page,
          per_page: perPage,
        },
      });

      return {
        ...res.data,
        rateLimitRemaining: res.headers['x-ratelimit-remaining'],
        rateLimitReset: res.headers['x-ratelimit-reset'],
      };
    } catch (err) {
      if(isAxiosError(err)) {
        console.error(err.message);
        return {
          error: true,
          message: err.message,
          statusCode: err.response?.status ?? 0,
          rateLimitRemaining: err.response?.headers['x-ratelimit-remaining'],
          rateLimitReset: err.response?.headers['x-ratelimit-reset'],
        }
      } {
        console.error(err);
        return {
          error: true,
          message: err.message,
          statusCode: 0,
        }
      }
    }
  }


let nextSearchId = 1;

// so... this ended up being pretty useless - but it does work!
export const searchAllPages = <T>(
  fetchPage: (page: number) => Promise<GHSearchResult<T>>,
  onPage: (pageData: T[], page: number) => any,
  onComplete: (searchId: number) => any,
  maxPage = 1,
  initalPage = 1,
) => {
  let isCanceled = false;
  let page = initalPage;

  // hold onto an id to assosicate search values with the request
  // primarally to make sure that only data from the expected request
  // is handled. (i.e. a slow previous request returns after a newer faster request)
  const searchId = nextSearchId++;

  // async IFFE to loop thru pages until one of the following occurs:
  // - Error
  // - Canceled
  // - Max Page reached
  // - No more pages
  (async () => {
    let currPage: GHSearchResult<T>;
    let fetchCount = 0;
    do{
      currPage = await fetchPage(page);

      if (isCanceled || isSearchError(currPage)) {
        return onComplete(searchId);
      }
      
      onPage(currPage.items, page);

      fetchCount += currPage.items.length;
      page++;

      if (page > maxPage) {
        // fire off complete func before delaying between pages
        return onComplete(searchId);
      }
      // delay 1 sec between pages
      await new Promise(res => setTimeout(res, 1000));
    } while(fetchCount < currPage.total_count);

    onComplete(searchId);
  })();
  
  return {
    searchId,
    cancel: () => {
      isCanceled = true;
    },
  };
}



export const useGitHubUserSearch = () => {

  const usersRef = useRef<GHUser[]>([]);

  const [users, setUsers] = useState<GHUser[]>([]);
  const [loading, setLoading] = useState(false);

  const runningSearch = useRef<ReturnType<typeof searchAllPages>>({
    searchId: 0,
    cancel: () => {},
  });

  const search = async (query: string, maxPages: number = 1) => {
    // cancel the last search
    runningSearch.current.cancel();
    setLoading(true);

    // start new paginated search
    const newSearch = searchAllPages(
      searchPagedUsers(query, 100),
      (data, page) => {
        if (page === 1) {
          // on first page overwrite any data that is already there
          usersRef.current = data;
        } else {
          // on subsequent pages append to current user list
          usersRef.current = [...usersRef.current, ...data];
        }
        setUsers(usersRef.current);
      },
      (searchId) => {
        if (searchId === runningSearch.current.searchId) {
          // only cancel loading state if this was the most current search
          setLoading(false);
        }
      },
      maxPages,
    );

    // set this search as the current one
    runningSearch.current = newSearch;
  }

  return {
    users,
    loading,
    search,
    clear: () => setUsers([]),
  }
}