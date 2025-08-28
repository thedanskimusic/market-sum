# Market Summary API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive NestJS API for market data and news aggregation with Google OAuth authentication, built for the Australian market.

## 🚀 Features

- **Google OAuth Authentication** - Secure user login with Google accounts
- **Market Data Integration** - Real-time market data from multiple sources
- **News Aggregation** - Australian financial news from AFR, ASX, and RBA
- **JWT Token Management** - Secure session management
- **Rate Limiting** - API protection and throttling
- **Caching** - Performance optimization
- **Swagger Documentation** - Interactive API documentation

## 📋 Prerequisites

- Node.js 20.18.1+ (use `nvm use` to switch to the correct version)
- npm or yarn
- Google Cloud Console account (for OAuth)
- Cloudflare Tunnel (for local development)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd market-sum

# Switch to the correct Node.js version
nvm use

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Google OAuth Configuration (you'll get these in step 3)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/v1/auth/google/callback

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for redirects)
FRONTEND_URL=https://your-ngrok-url.ngrok.io

# API Keys (optional for basic functionality)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
YAHOO_FINANCE_API_KEY=your_yahoo_finance_api_key
```

### 3. Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable the Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs (you'll update this after getting ngrok URL)

### 4. Start Development with Cloudflare Tunnel

```bash
# Terminal 1: Start the application
npm run start:dev
# or
yarn start:dev

# Terminal 2: Start Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

### 5. Configure Google OAuth with Cloudflare Tunnel URL

1. **Copy the Cloudflare Tunnel URL** (e.g., `https://abc123.trycloudflare.com`)
2. **Update Google OAuth settings:**
   - Go back to Google Cloud Console
   - Update the redirect URI to: `https://abc123.trycloudflare.com/api/v1/auth/google/callback`
3. **Update your .env file:**
   ```env
   GOOGLE_CALLBACK_URL=https://abc123.trycloudflare.com/api/v1/auth/google/callback
   FRONTEND_URL=https://abc123.trycloudflare.com
   ```
4. **Copy your Google credentials** to the `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   ```

### 6. Test the Authentication

1. **Visit the Google OAuth endpoint:**
   ```
   https://abc123.trycloudflare.com/api/v1/auth/google
   ```

2. **Complete the OAuth flow** - you'll be redirected with a JWT token

3. **Test protected endpoints:**
   ```bash
   # Get user profile (replace YOUR_JWT_TOKEN with the actual token)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        https://abc123.trycloudflare.com/api/v1/auth/profile
   ```

## 📚 Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugger
npm run start:prod         # Start in production mode

# Building
npm run build              # Build the application
npm run format             # Format code with Prettier
npm run lint               # Lint code with ESLint

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Utilities
npm run clean              # Clean all generated files
npm run clean:dist         # Clean build output only
npm run clean:modules      # Clean node_modules only
```

## 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/google` | Initiate Google OAuth login |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| GET | `/api/v1/auth/profile` | Get current user profile (protected) |
| GET | `/api/v1/auth/logout` | Logout user (protected) |

## 👥 User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users (protected) |
| GET | `/api/v1/users/:id` | Get user by ID (protected) |
| PATCH | `/api/v1/users/:id` | Update user (protected) |
| DELETE | `/api/v1/users/:id` | Delete user (protected) |

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/                 # Authentication module
│   │   ├── strategies/       # Passport strategies
│   │   ├── guards/          # JWT guards
│   │   ├── decorators/      # Custom decorators
│   │   └── dto/             # Data transfer objects
│   ├── user/                # User management
│   ├── market/              # Market data
│   └── news/                # News aggregation
├── config/                  # Configuration
├── common/                  # Shared utilities
└── types/                   # TypeScript types
```

## 🔧 Development Workflow

### Daily Development

1. **Start the application:**
   ```bash
   nvm use
   yarn start:dev
   ```

2. **Start ngrok (in new terminal):**
   ```bash
   ngrok http 3000
   ```

3. **Update .env with new ngrok URL** (if it changed)

4. **Update Google OAuth redirect URI** (if ngrok URL changed)

### Testing Authentication

```bash
# Test OAuth flow
curl -I https://your-ngrok-url.ngrok.io/api/v1/auth/google

# Test protected endpoint (after getting JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-ngrok-url.ngrok.io/api/v1/auth/profile
```

## 🚀 Production Deployment

### GCP Cloud Run Deployment

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project your-project-id

# Deploy to Cloud Run
gcloud run deploy market-sum-api \
  --source . \
  --region=australia-southeast1 \
  --allow-unauthenticated
```

### Environment Variables for Production

Update your production environment variables:

```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your_production_jwt_secret
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error:**
   - Ensure ngrok URL is added to Google OAuth settings
   - Check for trailing slashes or protocol mismatches

2. **"JWT token invalid" error:**
   - Verify JWT_SECRET is set correctly
   - Check token expiration

3. **"Module not found" errors:**
   - Run `npm install` or `yarn install`
   - Check Node.js version with `nvm use`

4. **ngrok URL changes:**
   - Update Google OAuth redirect URI
   - Update .env file with new URL

### Debug Mode

```env
LOG_LEVEL=debug
```

## 📖 Additional Documentation

- [Authentication Setup Guide](AUTH_SETUP.md) - Detailed OAuth setup
- [Authentication Summary](AUTH_SUMMARY.md) - Quick reference
- [Environment Variables](env.example) - Configuration template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section above
- Review the authentication documentation
- Open an issue on GitHub

---

**Note:** This project is optimized for the Australian market with local data sources and compliance considerations.
