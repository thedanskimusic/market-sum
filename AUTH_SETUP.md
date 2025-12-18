# Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your NestJS application.

## Overview

The authentication system uses:
- **Google OAuth 2.0** for user authentication
- **JWT tokens** for session management
- **Passport.js** for authentication strategies
- **In-memory user storage** (can be replaced with a database)

## Prerequisites

1. A Google Cloud Console account
2. Node.js and npm installed
3. Your NestJS application running

## Step 1: Set up Google OAuth Credentials

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add the following authorized redirect URIs:
   - `http://localhost:3000/api/v1/auth/google/callback` (for development)
   - `https://your-domain.com/api/v1/auth/google/callback` (for production)
5. Note down your **Client ID** and **Client Secret**

## Step 2: Environment Configuration

Create or update your `.env` file with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Other existing variables...
PORT=3000
NODE_ENV=development
```

## Step 3: Install Dependencies

The required packages are already installed:

```bash
npm install passport-google-oauth20 @types/passport-google-oauth20 bcryptjs
```

## Step 4: API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/google` | Initiate Google OAuth login |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| GET | `/api/v1/auth/profile` | Get current user profile |
| GET | `/api/v1/auth/logout` | Logout user |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users (protected) |
| GET | `/api/v1/users/:id` | Get user by ID (protected) |
| PATCH | `/api/v1/users/:id` | Update user (protected) |
| DELETE | `/api/v1/users/:id` | Delete user (protected) |

## Step 5: Authentication Flow

### 1. User Login Flow

1. User visits `/api/v1/auth/google`
2. User is redirected to Google OAuth consent screen
3. User authorizes the application
4. Google redirects to `/api/v1/auth/google/callback`
5. Application creates/updates user record
6. JWT token is generated and user is redirected to frontend

### 2. Protected Route Access

1. Frontend includes JWT token in Authorization header: `Bearer <token>`
2. JWT strategy validates the token
3. User information is attached to the request
4. Route handler can access user via `@CurrentUser()` decorator

## Step 6: Frontend Integration

### React Example

```javascript
// Login component
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3000/api/v1/auth/google';
};

// Handle callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Store token in localStorage or secure storage
    localStorage.setItem('access_token', token);
    // Redirect to dashboard
    navigate('/dashboard');
  }
}, []);

// API calls with authentication
const apiCall = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const user = await response.json();
};
```

### Vue.js Example

```javascript
// Login method
methods: {
  googleLogin() {
    window.location.href = 'http://localhost:3000/api/v1/auth/google';
  }
}

// Handle callback
mounted() {
  const token = this.$route.query.token;
  if (token) {
    localStorage.setItem('access_token', token);
    this.$router.push('/dashboard');
  }
}
```

## Step 7: Security Considerations

### 1. JWT Security

- Use a strong, unique JWT secret
- Set appropriate token expiration times
- Consider implementing refresh tokens
- Store tokens securely on the frontend

### 2. Environment Variables

- Never commit sensitive credentials to version control
- Use different credentials for development and production
- Rotate secrets regularly

### 3. HTTPS in Production

- Always use HTTPS in production
- Update Google OAuth redirect URIs to use HTTPS
- Set secure cookies for session management

## Step 8: Database Integration

The current implementation uses in-memory storage. To integrate with a database:

1. Install a database driver (e.g., `@nestjs/typeorm`, `@nestjs/mongoose`)
2. Create user entity/model
3. Update `UserService` to use database operations
4. Add database connection to `AppModule`

### Example with TypeORM

```typescript
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Step 9: Testing

### Test the Authentication Flow

1. Start your NestJS application:
   ```bash
   npm run start:dev
   ```

2. Visit `http://localhost:3000/api/v1/auth/google`

3. Complete the Google OAuth flow

4. Verify you're redirected with a JWT token

5. Test protected endpoints with the token

### API Testing with Swagger

1. Visit `http://localhost:3000/api` (if Swagger is configured)
2. Use the "Authorize" button to add your JWT token
3. Test protected endpoints

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"JWT token invalid" error**
   - Verify JWT_SECRET is set correctly
   - Check token expiration
   - Ensure token is sent in correct format

3. **"User not found" error**
   - Check if user was created successfully
   - Verify database connection (if using one)

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your_production_jwt_secret
```

### 2. Update Google OAuth Settings

1. Add production redirect URIs to Google Console
2. Remove development redirect URIs
3. Update authorized domains

### 3. Security Headers

Consider adding security headers:
```typescript
// main.ts
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

## Support

For issues related to:
- **Google OAuth**: Check [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **NestJS**: Check [NestJS Documentation](https://docs.nestjs.com/)
- **Passport.js**: Check [Passport.js Documentation](http://www.passportjs.org/)

## Australian Compliance Notes

- Ensure user data is stored in Australia (if required)
- Consider implementing data retention policies
- Review privacy policy requirements under Australian law
- Consider implementing user consent management for data collection
