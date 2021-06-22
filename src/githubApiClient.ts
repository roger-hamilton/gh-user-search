import axios from 'axios'

export const ghClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

export interface GHUser {
  login: string
  id: number,
  node_id: string
  avatar_url: string
  gravatar_id: string | null
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
  type: string
  site_admin: boolean
}

export interface GHUserDetails extends GHUser {
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username?: string | null
  public_repos: number | null
  public_gists: number | null
  followers: number | null
  following: number | null
  created_at: string | null
  updated_at: string | null
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

export const isSearchError = (res: GHSearchResult<any>): res is GHSearchError => 'error' in res;

interface SearchUsersRequest {
  query: string
  page?: number
  per_page?: number
  token: string | null
}

export const searchUsers = async ({ query, page = 0, per_page = 30, token }: SearchUsersRequest) => {
  const res = await ghClient.get<GHSearchResult<GHUser>>('/search/users', {
    params: {
      q: `${query} in:email ${query} in:name`,
      page,
      per_page,
    },
    headers: {
      Authorization: token ? `token ${token}` : undefined
    }
  });

  return res.data;
}