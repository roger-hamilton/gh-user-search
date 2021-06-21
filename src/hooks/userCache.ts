import { useEffect, useState } from "react";

// use promise cache to allow for the same user being loaded at the same time
const userPromiseCache = new Map<any, any>();

export const useUserCache = <K, T extends any>(key: K, fetchUser: () => Promise<T>) => {
  const userPromise: Promise<T> = userPromiseCache.get(key) ?? fetchUser();

  if (!userPromiseCache.has(key)) {
    console.log('fetching user', key)
    userPromiseCache.set(key, userPromise);
  } else {
    console.log('got from cache! no network call incurred', key)
  }

  const [user, setUser] = useState<T | undefined>();

  useEffect(() => {
    userPromise
      .then(setUser)
      .catch(() => userPromiseCache.delete(key));
  }, [setUser]);

  return user;
}