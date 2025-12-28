# HotelHub - Hotel Management System

A modern, production-ready hotel management system built with React, Vite, and Tailwind CSS.

## Features

- **User Authentication**: Secure login and registration system with role-based access
- **Room Browsing**: Advanced filtering by type, price, and occupancy
- **Booking System**: Complete booking flow with date selection and guest details
- **Payment Integration**: Checkout page with payment details collection
- **User Dashboard**: View upcoming and past bookings
- **Admin Dashboard**: Manage rooms, bookings, and view analytics
- **Responsive Design**: Mobile-first design that works on all devices
- **Error Handling**: Comprehensive error boundaries and validation

## Tech Stack

- **Frontend**: React 18 + React Router v6
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Form Handling**: React Hook Form patterns

## Project Structure

\`\`\`
src/
├── components/
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components (Header, Footer)
├── context/             # React Context providers
├── pages/               # Page components
│   ├── public/          # Public pages
│   ├── user/            # User-only pages
│   └── admin/           # Admin-only pages
├── routes/              # Route protection components
├── services/            # API service layer (mock)
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
\`\`\`

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## Demo Credentials

- **Admin**: admin@hotel.com / admin123
- **User**: john@example.com / user123

## API Integration

The application uses mock services that can be easily replaced with real API calls. Services are located in `src/services/`:

- `authService.js` - Authentication endpoints
- `roomService.js` - Room management endpoints
- `bookingService.js` - Booking management endpoints

To integrate with your backend, update the service functions to make actual API calls using fetch or axios.

## Key Features Implementation

### Authentication
- JWT token-based authentication
- Role-based access control (User, Admin)
- Protected routes with automatic redirects

### Room Management
- Filter rooms by type, price, and occupancy
- View detailed room information with images
- Real-time availability checking

### Booking System
- Multi-step booking process
- Date validation and conflict checking
- Guest details collection
- Payment information handling

### Admin Dashboard
- Real-time analytics and metrics
- Room management (CRUD operations)
- Booking management and cancellation
- Revenue tracking

## Customization

### Adding New Pages

1. Create a new file in `src/pages/`
2. Add the route in `src/App.jsx`
3. Use existing components and patterns

### Styling

All styling uses Tailwind CSS utility classes. Customize colors and theme in `tailwind.config.js`.

### State Management

Use React Context API for global state. Create new contexts in `src/context/` as needed.

## Error Handling

The application includes:
- Error boundaries for component-level error handling
- Form validation with user-friendly error messages
- Loading states for async operations
- Toast notifications for user feedback

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Memoization of expensive computations
- Optimized re-renders with proper dependency arrays

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

## Backend Integration Guide

### Step 1: Update Service Files

Replace mock data with actual API calls:

\`\`\`javascript
// Example: authService.js
export const login = async (email, password) => {
  const response = await fetch('YOUR_API_URL/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}
\`\`\`

### Step 2: Environment Variables

Create a `.env` file:

\`\`\`
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_KEY=your_stripe_key
\`\`\`

### Step 3: Update API Calls

Update service files to use environment variables:

\`\`\`javascript
const API_URL = import.meta.env.VITE_API_URL
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
