# Social Media App

A MERN-ready social media backend for users, posts and interactions. The current MVP implements secure authentication plus the core social graph and post interactions described by the project's ER model.

## Current architecture

```text
Client (React / mobile / web)
        |
        | HTTP + JSON, credentials included
        v
Express API
  |       |       |
 Auth    Posts   Users
  |       |       |
  +-------+-------+
          |
       MongoDB
```

### Components

- **User model** — account identity, profile data, followers and following.
- **Post model** — author, content/media, likes and comments.
- **Auth utilities** — bcrypt password hashing and JWT creation.
- **Auth middleware** — verifies the JWT from an HTTP-only cookie before protected requests.
- **Auth routes** — register, login, logout and `/me`.
- **Post routes** — feed, create post, like/unlike and comment.
- **User routes** — public profile and follow/unfollow.

## Authentication request flow

### Registration

1. Client sends `POST /api/auth/register` with `username`, `email`, `name` and `password`.
2. The server validates the required fields and password length.
3. The plain password is never stored. `bcrypt.hash(password, 12)` produces `passwordHash`.
4. MongoDB stores the user with `passwordHash` while the password field itself is not persisted.
5. The server signs a JWT whose subject (`sub`) is the user's MongoDB ID.
6. The JWT is placed in an **HTTP-only cookie** named `access_token`.
7. The response contains safe profile data, never the password hash or token.

### Login

1. Client sends `POST /api/auth/login` with email and password.
2. Server loads the user and explicitly selects the protected `passwordHash` field.
3. `bcrypt.compare()` checks the supplied password against the stored hash.
4. On success, a new JWT is signed and sent as the HTTP-only `access_token` cookie.
5. On failure, the API returns `401` without revealing whether the email or password was incorrect.

### Protected request

```text
Browser
  |
  | GET /api/posts
  | Cookie: access_token=<JWT>
  v
requireAuth middleware
  |
  | jwt.verify(token, JWT_SECRET)
  | payload.sub -> user ID
  v
MongoDB -> User
  |
  v
Route handler -> response
```

The frontend does **not** need to store a JWT in `localStorage`. The browser manages the HTTP-only cookie, which JavaScript cannot read. Cross-origin clients must send requests with credentials enabled.

## Token handling

- Algorithm: the default JWT algorithm used by `jsonwebtoken` unless configured otherwise.
- Secret: supplied through `JWT_SECRET`; it must exist only in the server environment.
- Expiration: `JWT_EXPIRES_IN`, defaulting to `7d`.
- Transport: HTTP-only cookie (`access_token`).
- Production cookie: `Secure` + `SameSite=None` for a separately hosted frontend/API.
- Development cookie: `SameSite=Lax` for local development.
- Logout: clears the authentication cookie.
- Expired/invalid tokens are rejected with `401`.

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Create account and sign in |
| POST | `/api/auth/login` | No | Verify credentials and sign in |
| POST | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/posts` | Yes | Get recent feed |
| POST | `/api/posts` | Yes | Create a post |
| POST | `/api/posts/:id/like` | Yes | Like/unlike a post |
| POST | `/api/posts/:id/comments` | Yes | Add a comment |
| POST | `/api/users/:id/follow` | Yes | Follow/unfollow a user |
| GET | `/api/users/:username` | No | Get public profile |
| GET | `/api/health` | No | Health check |

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI and a strong JWT_SECRET
npm run dev
```

For Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

API default: `http://localhost:5000`.

## Security notes

Never commit `.env`, JWT secrets, MongoDB credentials or production credentials. Use HTTPS in production. For a production release, add rate limiting, request validation, CSRF protection appropriate to the deployment, refresh-token rotation if long-lived sessions are required, and a transactional/atomic follow operation for high-concurrency workloads.
