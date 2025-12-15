# Trading Platform Frontend

A modern, responsive React frontend for the trading platform with authentication and 2FA support.

## Features

- 🔐 **User Authentication**
  - Sign Up / Sign In
  - JWT token-based authentication
  - Secure session management

- 🔒 **Two-Factor Authentication (2FA)**
  - OTP verification via email
  - Timed OTP expiration
  - Secure login flow

- 🔑 **Password Management**
  - Forgot password functionality
  - OTP-based password reset
  - Secure password validation

- 📊 **Trading Dashboard**
  - Portfolio overview
  - Account balance tracking
  - Quick trading actions
  - Transaction history

- 🎨 **Modern UI/UX**
  - Responsive design
  - Gradient themes
  - Smooth animations
  - Mobile-friendly

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   └── api.ts              # API configuration
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Signup.tsx          # Signup page
│   │   ├── Verify2FA.tsx       # 2FA verification
│   │   ├── ForgotPassword.tsx  # Forgot password
│   │   ├── ResetPassword.tsx   # Reset password
│   │   └── Dashboard.tsx       # Main dashboard
│   ├── services/
│   │   ├── api.service.ts      # Axios instance
│   │   └── auth.service.ts     # Auth API calls
│   ├── styles/
│   │   ├── index.css           # Global styles
│   │   ├── App.css             # App styles
│   │   ├── Auth.css            # Auth page styles
│   │   └── Dashboard.css       # Dashboard styles
│   ├── App.tsx                 # Main app component
│   └── index.tsx               # Entry point
├── package.json
└── tsconfig.json
```

## API Endpoints Used

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `POST /auth/verify-signin/{otp}` - Verify 2FA OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/verify-forgot/{otp}` - Reset password with OTP

### Dashboard
- `GET /api` - Secure API endpoint

## Features in Detail

### Authentication Flow
1. User enters credentials on login page
2. Backend validates credentials
3. If 2FA is enabled, user receives OTP via email
4. User enters OTP for verification
5. Upon success, JWT token is stored and user redirects to dashboard

### Password Reset Flow
1. User clicks "Forgot Password"
2. Enters email address
3. Receives OTP via email
4. Enters OTP and new password
5. Password is reset and user can login

### Protected Routes
- Dashboard and other authenticated routes check for JWT token
- Users without valid token are redirected to login page
- Token is automatically attached to all API requests

## Environment Variables

The app uses a proxy configuration in `package.json`:
```json
"proxy": "http://localhost:8080"
```

For production, update the `API_BASE_URL` in `src/config/api.ts`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the Trading Platform application.
