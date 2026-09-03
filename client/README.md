# Socially Frontend

React + Vite frontend for the Social-media application.

## Features

- Register and login
- JWT session through an HTTP-only cookie
- Protected feed
- Create posts
- Like/unlike posts
- Add comments
- Discover people
- Responsive layout
- Logout

## Run locally

1. Start MongoDB.
2. Start the backend from the repository root:

```bash
npm install
npm run dev
```

3. In another terminal:

```bash
cd client
npm install
npm run dev
```

4. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend sends `credentials: 'include'` with API requests so the browser can manage the backend's HTTP-only authentication cookie.

## Environment

Copy `.env.example` to `.env` if the backend API is not running at the default URL.

```env
VITE_API_URL=http://localhost:5000/api
```
