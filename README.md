# Sunland Food Ordering App

A complete food ordering application similar to Uber Eats with comprehensive features for customers, drivers, and administrators.

## Features

### Customer Features
- **Menu Browsing**: View menu items with categories, prices, and descriptions
- **Shopping Cart**: Add/remove items, adjust quantities, view totals
- **Order Placement**: Place orders with delivery address and special instructions
- **Payment Integration**: 
  - M-Pesa mobile money payments
  - Airtel Money payments
  - Cash on delivery option
- **SMS Notifications**: Receive order confirmations and status updates
- **Live GPS Tracking**: Track delivery drivers in real-time
- **Order History**: View past orders and their status
- **Profile Management**: Update personal information and delivery addresses

### Driver Features
- **Order Assignment**: Receive assigned delivery orders
- **GPS Location Sharing**: Share real-time location with customers
- **Order Status Updates**: Update delivery status
- **Earnings Tracking**: View completed deliveries and earnings

### Admin Features
- **Menu Management**: Add, edit, and remove menu items
- **Order Management**: View and manage all orders
- **User Management**: Manage customers and drivers
- **Analytics**: View sales reports and performance metrics

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data storage
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Twilio** for SMS notifications
- **M-Pesa/Airtel APIs** for mobile payments

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Zustand** for state management
- **Leaflet** for GPS mapping
- **Axios** for API calls
- **Toast notifications** for user feedback

## Project Structure

```
sunland-ordering-app/
├── server/                          # Backend API
│   ├── src/
│   │   ├── models/                  # MongoDB schemas
│   │   ├── routes/                  # API endpoints
│   │   ├── controllers/             # Business logic
│   │   ├── services/                # External integrations
│   │   ├── middleware/              # Auth & error handling
│   │   └── config/                  # Configuration
│   └── package.json
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API & socket services
│   │   ├── context/                 # State management
│   │   └── hooks/                   # Custom hooks
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sunland-ordering-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   npm start
   ```

### Environment Variables

Create a `.env` file in the server directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sunland-ordering

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Payment APIs (configure with actual credentials)
MPESA_BUSINESS_SHORT_CODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey
AIRTEL_API_KEY=your-airtel-api-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh

### Menu Endpoints
- `GET /api/menus` - Get all menu items
- `GET /api/menus/:id` - Get menu item by ID
- `GET /api/menus/category/:category` - Get menu by category

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### Payment Endpoints
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/callback` - Payment callback

## Real-time Features

### Socket.io Events
- `join_order`: Join order tracking room
- `location_updated`: Driver location updates
- Order status changes broadcast to customers

### GPS Tracking
- Drivers share location via mobile app
- Customers receive real-time updates
- Interactive map with driver and destination markers

## Payment Integration

### M-Pesa Integration
- STK Push for mobile payments
- Callback handling for payment confirmation
- Transaction verification

### Airtel Money Integration
- Similar flow to M-Pesa
- Regional mobile money support

### Cash on Delivery
- No payment required at checkout
- Payment collected by driver upon delivery

## Deployment

### Backend Deployment
```bash
npm run build
npm start
```

### Frontend Deployment
```bash
npm run build
# Serve build folder with nginx/apache
```

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify
- **File Storage**: AWS S3 or Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.

## Notifications & Local Testing

This project supports email and SMS notifications for OTPs and welcome messages. Configure these in your server `.env` (copy `server/.env.example` to `server/.env`).

- Email (SMTP via Nodemailer): `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`. For Gmail, generate an app password and set `EMAIL_SERVICE=gmail`.
- Twilio SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (E.164 format, e.g. `+2547XXXXXXXX`).

If email/SMS are not configured the server will log OTPs to the console and SMS attempts will be skipped gracefully. For safer local testing without sending real messages, set:

```env
DEBUG_RETURN_OTP=true
```

With `DEBUG_RETURN_OTP=true` the endpoints that generate OTPs (`/auth/register-request`, `/auth/resend-otp`) will include a `debugOTP` field in the JSON response. Use this only in development — do not enable in production.

After changing env vars restart the server for them to take effect.


# sunland-ordering-system

# sunland-ordering-system
