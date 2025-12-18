# Google Cloud Platform OAuth Setup Guide

A comprehensive guide for setting up Google OAuth 2.0 authentication in new projects. This guide covers both command-line and web console methods.

## 📋 Prerequisites

- Google Cloud Platform account
- `gcloud` CLI installed (optional but recommended)
- Project where you want to enable OAuth

## 🚀 Quick Start

### Option 1: Command Line Setup (Recommended for Repetitive Tasks)

#### 1. Install and Authenticate gcloud CLI

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
```bash
# Download installer from: https://cloud.google.com/sdk/docs/install
```

**Initialize:**
```bash
# Authenticate
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config list
```

#### 2. Enable Required APIs

```bash
# Enable Google+ API (legacy, but still works)
gcloud services enable plus.googleapis.com

# OR enable Google People API (recommended)
gcloud services enable people.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled | grep -E "plus|people"
```

#### 3. Get Project Information

```bash
# Get project number (needed for some operations)
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

echo "Project ID: $(gcloud config get-value project)"
echo "Project Number: $PROJECT_NUMBER"
```

---

### Option 2: Web Console Setup (Easier for First-Time Setup)

#### 1. Create or Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown at top
3. Click "New Project" or select existing project
4. Note your Project ID

#### 2. Enable Required APIs

1. Navigate to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click on the API
4. Click **"Enable"**
5. Repeat for the other API if needed

**Or via CLI:**
```bash
gcloud services enable plus.googleapis.com people.googleapis.com
```

#### 3. Configure OAuth Consent Screen

1. Navigate to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Fill in required information:
   - **App name**: Your application name
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **"Save and Continue"**
5. **Scopes** (Step 2):
   - Click **"Add or Remove Scopes"**
   - Select: `email`, `profile`, `openid`
   - Click **"Update"** then **"Save and Continue"**
6. **Test users** (Step 3 - if in testing mode):
   - Click **"Add Users"**
   - Add your email address
   - Click **"Add"**
7. Click **"Save and Continue"** through remaining steps
8. Review and **"Back to Dashboard"**

#### 4. Create OAuth 2.0 Client ID

1. Navigate to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. If prompted, configure consent screen (see step 3 above)
4. **Application type**: Select **"Web application"**
5. **Name**: Enter a descriptive name (e.g., "My App Web Client")
6. **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
   ```
   https://your-domain.com/api/v1/auth/google/callback
   ```
   Or for local development:
   ```
   http://localhost:3000/api/v1/auth/google/callback
   ```
   Or for Cloudflare Tunnel:
   ```
   https://your-tunnel-url.trycloudflare.com/api/v1/auth/google/callback
   ```
7. Click **"CREATE"**
8. **Copy the credentials:**
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (you won't see it again!)

#### 5. Update Your Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
FRONTEND_URL=https://your-domain.com
```

---

## 🔄 Updating Redirect URIs

When your URL changes (e.g., new Cloudflare Tunnel URL):

### Via Web Console:
1. Go to **"APIs & Services" > "Credentials"**
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**:
   - Remove old URL (if needed)
   - Add new URL: `https://new-url.com/api/v1/auth/google/callback`
4. Click **"SAVE"**

### Via CLI (if using Identity Platform):
```bash
# List existing OAuth clients
gcloud alpha identity oauth-clients list

# Update redirect URI (requires client ID)
gcloud alpha identity oauth-clients update CLIENT_ID \
  --redirect-uris="https://new-url.com/api/v1/auth/google/callback"
```

---

## ✅ Verification Steps

### 1. Test OAuth Configuration

```bash
# Check if APIs are enabled
gcloud services list --enabled | grep -E "plus|people"

# Verify project configuration
gcloud config get-value project
```

### 2. Test OAuth Flow

1. Start your application:
   ```bash
   npm run start:dev
   ```

2. Visit your auth endpoint:
   ```
   http://localhost:3000/api/v1/auth/google
   ```
   Or your production URL

3. You should be redirected to Google login

4. After login, you should be redirected back with a token

### 3. Common Issues

**"OAuth client was not found"**
- Verify Client ID in `.env` matches Google Console
- Ensure you're using the correct project
- Check OAuth consent screen is configured

**"Invalid redirect URI"**
- Ensure redirect URI in Google Console matches `.env` exactly
- Check for trailing slashes
- Verify protocol (http vs https)

**"Access blocked: This app's request is invalid"**
- OAuth consent screen not fully configured
- Add your email as a test user (if in testing mode)
- Complete all consent screen steps

---

## 📝 Quick Reference Checklist

### Initial Setup
- [ ] Create/select Google Cloud project
- [ ] Enable Google+ API or Google People API
- [ ] Configure OAuth consent screen
- [ ] Add required scopes (email, profile, openid)
- [ ] Add test users (if in testing mode)
- [ ] Create OAuth 2.0 Client ID
- [ ] Copy Client ID and Secret
- [ ] Add credentials to `.env` file
- [ ] Set correct redirect URI in both Google Console and `.env`
- [ ] Test OAuth flow

### When URL Changes
- [ ] Update redirect URI in Google Cloud Console
- [ ] Update `GOOGLE_CALLBACK_URL` in `.env`
- [ ] Update `FRONTEND_URL` in `.env`
- [ ] Restart application
- [ ] Test OAuth flow

---

## 🛠️ Useful Commands

```bash
# List all enabled APIs
gcloud services list --enabled

# Enable a specific API
gcloud services enable API_NAME

# Get project information
gcloud projects describe PROJECT_ID

# List OAuth clients (if using Identity Platform)
gcloud alpha identity oauth-clients list

# Get access token for API calls
gcloud auth print-access-token

# Switch between projects
gcloud config set project PROJECT_ID

# List all projects
gcloud projects list
```

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [OAuth Credentials](https://console.cloud.google.com/apis/credentials)
- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## 📋 Environment Variables Template

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=https://your-domain.com

# JWT Configuration (for token generation)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

---

## 🎯 Project-Specific Notes

### For NestJS Projects:
- Use `@nestjs/passport` and `passport-google-oauth20`
- Configure in `auth.module.ts`
- Set up Google Strategy in `strategies/google.strategy.ts`
- Use `@UseGuards(AuthGuard('google'))` on routes

### For Express Projects:
- Use `passport` and `passport-google-oauth20`
- Configure passport middleware
- Set up routes for `/auth/google` and `/auth/google/callback`

### For Next.js Projects:
- Use `next-auth` with Google provider
- Configure in `pages/api/auth/[...nextauth].ts`
- Set callback URL to: `https://your-domain.com/api/auth/callback/google`

---

## 💡 Tips

1. **Keep credentials secure**: Never commit `.env` files to git
2. **Use different projects**: Separate dev/staging/production OAuth clients
3. **Test users**: Add yourself as a test user during development
4. **URL changes**: Cloudflare Tunnel URLs change - consider using a custom domain
5. **Rate limits**: Google OAuth has rate limits - be mindful in development
6. **Scopes**: Only request scopes you actually need
7. **HTTPS**: Production requires HTTPS for OAuth

---

## 🆘 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution**: Ensure the redirect URI in Google Console exactly matches your `.env` file, including:
- Protocol (http/https)
- Domain
- Port (if localhost)
- Path
- No trailing slashes

### Issue: "access_denied" during OAuth flow
**Solution**: 
- Check OAuth consent screen is published (or you're a test user)
- Verify scopes are correctly configured
- Ensure app is not in restricted mode

### Issue: Can't find OAuth client in console
**Solution**:
- Verify you're in the correct project
- Check you're looking in "Credentials" not "Service Accounts"
- Ensure OAuth consent screen is configured first

---

**Last Updated**: 2025-01-28  
**Version**: 1.0

