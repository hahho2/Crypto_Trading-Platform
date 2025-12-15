# Razorpay Payment Integration Setup

## Overview
The wallet deposit feature now supports Razorpay payment gateway, allowing users to deposit funds using various payment methods including:
- UPI
- Credit/Debit Cards
- Net Banking
- Wallets (Paytm, PhonePe, etc.)

## Setup Instructions

### 1. Create Razorpay Account
1. Visit [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up for a free account
3. Complete KYC verification (for production use)

### 2. Get API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test Keys or Live Keys
4. You'll get:
   - Key ID (starts with `rzp_test_` for test mode)
   - Key Secret

### 3. Configure Backend

Update `src/main/resources/application.properties`:

```properties
# Razorpay Payment Gateway Configuration
razorpay.key.id=rzp_test_YOUR_KEY_ID_HERE
razorpay.key.secret=YOUR_KEY_SECRET_HERE
```

### 4. Configure Frontend

Update `frontend/src/pages/Dashboard.tsx` (line ~130):

```typescript
key: 'rzp_test_YOUR_KEY_ID_HERE', // Replace with your actual Razorpay Key ID
```

### 5. Test Payment Flow

#### Test Mode Cards:
Razorpay test mode accepts these card numbers:

**Success Cards (Payment will succeed):**
- **Visa:** 4111 1111 1111 1111
- **Mastercard:** 5555 5555 5555 4444
- **Rupay:** 6073 8499 9000 0095
- **CVV:** Any 3 digits (e.g., 123)
- **Expiry:** Any future date (e.g., 12/30)
- **Name:** Any name (e.g., Harsh)

**Failure Cards (To test payment failures):**
- **Card:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

**Note:** In Razorpay test mode, you must use these specific test card numbers. Real card numbers will not work in test mode.

#### Test UPI:
- Use any UPI ID in test mode (success@razorpay)

### 6. Payment Flow

1. User enters deposit amount
2. Clicks "Pay with Razorpay"
3. Razorpay checkout modal opens
4. User completes payment
5. On success:
   - Payment verified
   - Funds added to wallet
   - Balance updated in real-time

### 7. Production Deployment

For production use:
1. Complete KYC verification in Razorpay Dashboard
2. Get Live API Keys
3. Replace test keys with live keys
4. Enable webhook for payment notifications
5. Implement proper payment verification on backend

### 8. Security Notes

- Never commit API keys to version control
- Use environment variables for production
- Implement signature verification for webhooks
- Use HTTPS in production
- Implement rate limiting on payment endpoints

### 9. Currency Conversion

Current implementation assumes INR currency. To support USD:
1. Integrate currency conversion API
2. Update amount calculation in WalletController
3. Display proper currency symbol in UI

### 10. Webhook Setup (Optional for Production)

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/wallet/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Implement webhook handler in backend

## Features

✅ Secure payment processing via Razorpay
✅ Multiple payment method support
✅ Real-time payment status updates
✅ Clean, modern UI with payment details
✅ Mobile-responsive checkout
✅ Test mode for development
✅ Error handling and user feedback

## Support

For Razorpay integration issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

## Screenshots

The deposit interface now shows:
- "Powered by Razorpay" badge
- Payment method icons
- Secure payment information
- Quick amount selection ($100, $500, $1000, $5000)
