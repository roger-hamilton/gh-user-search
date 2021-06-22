# gh-user-search

## Project Structure

This is split into two parts:
1) the front end code
2) firebase function to handle github oauth web flow

This is done because one of the requirements is to display the email's in the user's displayed data, and according to github's [documentation](https://docs.github.com/en/rest/reference/users#get-a-user) you can only see publicly visible email addesses when authenticated.

The function is necessary because github oauth does not support the implicit flow that SPAs normally use.

### Front End

The front end is a [Vite](https://vitejs.dev/) app using [React](https://reactjs.org/), [headless ui](https://headlessui.dev/), and [Tailwind CSS](https://tailwindcss.com/).

### Firebase Function

Simply takes the code from github flow and exchanges it for the auth token and returns it to the front end as a hash parameter