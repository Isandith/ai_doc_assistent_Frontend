# Firebase Authentication Setup

This document explains how Firebase authentication is integrated with the FastAPI backend.

## Architecture Overview

### Frontend (Next.js)
- **Firebase Authentication**: Handles user registration and login
- **ID Token Management**: Obtains Firebase ID tokens after authentication
- **Backend Sync**: Sends tokens to backend for validation and user profile sync

### Backend (FastAPI)
- **Token Validation**: Verifies Firebase ID tokens using Firebase Admin SDK
- **User Profile Storage**: Maintains local user records in PostgreSQL
- **Protected Endpoints**: Uses Bearer token authentication

## Authentication Flow

### Registration Flow
1. User enters email, password, and display name in frontend
2. Frontend creates user in Firebase using `createUserWithEmailAndPassword`
3. Frontend updates Firebase profile with display name
4. Frontend gets Firebase ID token
5. Frontend sends token to `/auth/register` endpoint
6. Backend validates token and creates local user record
7. User is redirected to dashboard

### Login Flow
1. User enters email and password in frontend
2. Frontend signs in to Firebase using `signInWithEmailAndPassword`
3. Frontend gets Firebase ID token
4. Frontend sends request to `/auth/me` with Bearer token
5. Backend validates token and returns user data
6. User is redirected to dashboard

### Protected API Requests
```typescript
const token = await getFirebaseToken();
const response = await fetch(`${API_URL}/protected-endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## File Structure

```
app/lib/Authentication/
├── firebase.ts              # Firebase configuration and initialization
├── authenticationModel.ts   # TypeScript types and interfaces
└── authenticationApi.ts     # Authentication functions (register, login, logout)
```

## Key Functions

### Authentication API (`authenticationApi.ts`)

#### `registerUser(email, password, displayName)`
Creates a new user account in Firebase and syncs with backend.

```typescript
const result = await registerUser('user@example.com', 'password123', 'John Doe');
if (result.success) {
  console.log('User registered:', result.user);
}
```

#### `loginUser(email, password)`
Authenticates existing user with Firebase.

```typescript
const result = await loginUser('user@example.com', 'password123');
if (result.success) {
  console.log('User logged in:', result.user);
}
```

#### `logoutUser()`
Signs out current user from Firebase.

```typescript
await logoutUser();
```

#### `getCurrentUser()`
Fetches current user data from backend using Firebase token.

```typescript
const user = await getCurrentUser();
console.log('Current user:', user);
```

#### `getFirebaseToken()`
Gets the current Firebase ID token.

```typescript
const token = await getFirebaseToken();
```

#### `onAuthStateChange(callback)`
Monitors Firebase authentication state changes.

```typescript
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user);
  } else {
    console.log('User signed out');
  }
});
```

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Firebase Configuration

Firebase configuration is in `app/lib/Authentication/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyD_frwZCPJeOsE_5Xq62WoalcMItQ-gIOY",
  authDomain: "student-task-4cec3.firebaseapp.com",
  projectId: "student-task-4cec3",
  storageBucket: "student-task-4cec3.firebasestorage.app",
  messagingSenderId: "274541900288",
  appId: "1:274541900288:web:5510434aaefad3c942dee5",
  measurementId: "G-08DCG4BDLH"
};
```

## Backend Integration

### Database Schema

The backend uses the following user table structure:

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### Backend Endpoints

#### `POST /auth/register`
Syncs Firebase user to local database.

**Request:**
```json
{
  "id_token": "firebase_id_token_here",
  "display_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully.",
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "email_verified": false
  }
}
```

#### `GET /auth/me`
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "email_verified": true
}
```

#### `POST /auth/verify-token`
Verify Firebase ID token.

**Request:**
```json
{
  "id_token": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "email_verified": true
  }
}
```

## Security Notes

1. **Client-Side**: Firebase handles password hashing and storage
2. **Token Expiry**: Firebase ID tokens expire after 1 hour
3. **Token Refresh**: Firebase SDK automatically refreshes tokens
4. **Backend Validation**: All tokens are validated server-side using Firebase Admin SDK
5. **SSL Required**: Use HTTPS in production for secure token transmission

## Error Handling

Common Firebase error codes:
- `auth/email-already-in-use`: Email is already registered
- `auth/invalid-email`: Invalid email format
- `auth/weak-password`: Password is too weak (< 6 characters)
- `auth/user-not-found`: User doesn't exist
- `auth/wrong-password`: Incorrect password
- `auth/user-disabled`: Account has been disabled

## Testing

### Register a New User
1. Navigate to the app
2. Click "Sign Up"
3. Enter email, password (min 6 chars), and username
4. Submit form
5. User should be redirected to dashboard

### Login
1. Navigate to the app
2. Enter registered email and password
3. Click "Sign In"
4. User should be redirected to dashboard

### Logout
1. Click the logout icon in the header
2. User should be signed out and redirected to auth screen

## Troubleshooting

### "Invalid or expired Firebase token"
- Token may have expired (1 hour lifetime)
- User needs to log in again
- Check if Firebase is properly initialized

### "Failed to sync with backend"
- Verify backend API URL in `.env.local`
- Check if backend server is running
- Verify backend Firebase Admin SDK is configured

### "Email already in use"
- User already exists in Firebase
- Try logging in instead
- Or use a different email address

## Production Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Enable Firebase security rules
- [ ] Enable HTTPS for all API requests
- [ ] Set up Firebase Admin SDK on backend with service account key
- [ ] Configure CORS on backend
- [ ] Set up token refresh handling
- [ ] Implement rate limiting on auth endpoints
- [ ] Add email verification flow
- [ ] Set up password reset functionality
