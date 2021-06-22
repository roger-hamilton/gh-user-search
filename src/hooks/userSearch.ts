import { useCallback, useReducer, useState } from 'react';
import { isSearchError, searchUsers, GHUser } from '../githubApiClient';

interface AppendAction {
  type: 'append'
  users: GHUser[] 
}

interface ClearAction {
  type: 'clear'
}

interface SetAction {
  type: 'set'
  query: string
  total: number
  users: GHUser[]
}

interface ErrorAction {
  type: 'error'
  message: string
}

type UserSearchAction =
| AppendAction
| ClearAction
| SetAction
| ErrorAction

type CancellablePromise<T> = Promise<T> & { cancel: () => void }

const cancellablePromise = <T>(fn: (isCancelled: () => boolean) => Promise<T>): CancellablePromise<T> => {
  let cancelled = false;
  const isCancelled = () => cancelled;
  const rawPromise: CancellablePromise<T> = fn(isCancelled) as any;

  // add cancel method to promise
  rawPromise.cancel = () => {
    cancelled = true;
  }

  return rawPromise;
}

interface UserState {
  users: GHUser[]
  query: string
  page: number
  total: number
  error?: string
}

const inialUsersState = { page: -1, query: '', users: [], total: 0 };

const usersReducer = (state: UserState, action: UserSearchAction) => {
  switch(action.type) {
    case 'append':
      return {
        ...state,
        page: state.page + 1,
        users: [
          ...state.users,
          ...action.users,
        ],
        error: undefined
      };
    case 'clear':
      return { ...inialUsersState };
    case 'set':
      return {
        page: 1,
        query: action.query,
        total: action.total,
        users: [...action.users],
        error: undefined
      };
    default:
      return state;
  }
};

const USERS_PER_PAGE = 20;

export const useUserSearch = (token: string | null) => {
  const [usersState, dispatch] = useReducer(usersReducer, inialUsersState);
  
  const [pending, setPending] = useState<CancellablePromise<void>>(
    cancellablePromise(() => Promise.resolve())
  );

  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    // cancel pending promise (if any)
    pending.cancel();

    const newSearch = cancellablePromise(async isCancelled => {
      try {
        setLoading(true);

        const res = await searchUsers({
          query,
          page: 1,
          per_page: USERS_PER_PAGE,
          token,
        });
        
        if (!isCancelled()) {
          if (isSearchError(res)) {
            dispatch({ type: 'error', message: res.message });
          } else {
            dispatch({ type: 'set', query, total: res.total_count, users: res.items});
          }
        }
      } finally {
        // don't setLoading false if this request was cancelled
        if (!isCancelled()) setLoading(false);
      }
    });

    setPending(newSearch);
    // return promise that resolves when search resolves;

    await newSearch;
  }, [pending, token]);

  const nextPage = useCallback(async () => {
    console.log('nextPage', usersState);
    await pending;
    const next = cancellablePromise(async isCancelled => {
      try {
        setLoading(true);

        const res = await searchUsers({
          query: usersState.query,
          page: usersState.page + 1,
          per_page: USERS_PER_PAGE,
          token,
        });

        if (!isCancelled()) {
          if (isSearchError(res)) {
            dispatch({ type: 'error', message: res.message });
          } else {
            dispatch({ type: 'append', users: res.items });
          }
        }
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    });

    setPending(next);

    await next;
  }, [usersState, loading, token]);

  const clear = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  return {
    ...usersState,
    loading,
    search,
    nextPage,
    clear,
  }
}