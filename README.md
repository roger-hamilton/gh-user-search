# gh-user-search

A simple `React` app to search users by email or name. Provides an infinite scrolling list of users that match the query. Currently displays the following information:
- User Avatar
- Full Name (with link to github user page)
- Login
- Join Date
- Updated Date
- Location (if available)
- Email (if available and if user is logged in)
- Count of Public Repos (with link to full list)

App is available at: https://gh-user-search-35481.web.app/

## Project Structure

This is split into two parts:
1) the front end code
2) firebase function to handle github oauth web flow

This is done because one of the requirements is to display the email's in the user's displayed data, and according to Github's [documentation](https://docs.github.com/en/rest/reference/users#get-a-user) you can only see publicly visible email addesses when authenticated.

The function is necessary because github oauth does not support the implicit flow that SPAs normally use.

### Front End

The front end is a [Vite](https://vitejs.dev/) app using [React](https://reactjs.org/), [headless ui](https://headlessui.dev/), and [Tailwind CSS](https://tailwindcss.com/).

### Firebase Function

Simply takes the code from github flow and exchanges it for the auth token and returns it to the front end as a hash parameter.

## Development

To get started run `npm install` and `npm run dev`.

For development there is a seperate `server.js` that adds the same logic as the authCallback firebase function to the dev server. The final built files are static and do not actually use this file.

## Deployment

The Vite app is deployed via github actions to firebase hosting on merge into `main` branch. Alternatively you can deploy via the firebase cli with `firebase deploy --only hosting`.

The firebase function is deployed via the firebase cli with `firebase deploy --only functions` from within the project root.

## FAQ

Why didn't you use [octokit](https://www.npmjs.com/package/octokit), it provides the rest api interface for you?
> There is an issue with a down-stream dependency (node-fetch) that is trying to load the nodejs code instead of the browser code when loaded with `Vite`. Also I am only using one endpoint - so pulling in the abiltiy to access the whole api seemed like overkill.

Why do you ask to login with Github, this seems to add a lot of complexity?
> Yes, it does add a lot of complexity - but it is the only way to get the public email for user accounts (one of the requirements for the project).