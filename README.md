# E-commerce Backend API

A Node.js and Express backend for an e-commerce application with PostgreSQL database integration and Stripe payment processing.

## Tech Stack

- **Node.js** — Backend runtime
- **Express.js** — REST API framework
- **PostgreSQL / Supabase** — Database
- **Stripe** — Payment processing using PaymentIntents
- **JWT** — Authentication
- **bcrypt** — Password hashing
- **Zod** — Request validation

## Features

- User registration and login
- Product listing and retrieval
- Order creation and management
- Stripe PaymentIntent integration
- Idempotency key handling for payment requests
- Order and payment tracking

*Update this list to reflect the features implemented in your current code.*

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

The structure above is illustrative. Adjust it to match the actual project.

## Prerequisites

- Node.js and npm
- PostgreSQL or Supabase database
- Stripe account with test-mode API keys

## Installation

1. Clone the repository.
2. Navigate to the backend directory.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root.

Example environment variables:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Use the exact variable names required by your application. The webhook secret is needed if Stripe webhooks are configured.

**Security:** Never commit real API keys, database credentials, or secrets to Git.

## Running the Application

Start the server using the command configured in `package.json`.

For example:

```bash
node src/server.js
```

If a development script is configured:

```bash
npm run dev
```

## API Overview

Typical API operations include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/products` | Retrieve products |
| GET | `/api/products/:id` | Retrieve a product |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/:id` | Retrieve an order |
| POST | `/api/payments/checkout` | Initiate a payment |

These are example routes. Confirm the actual paths and HTTP methods in your route files.

## Stripe Payment Flow

1. The customer creates an order.
2. The backend retrieves the order and verifies ownership.
3. The backend checks whether the order is eligible for payment.
4. The backend creates a Stripe PaymentIntent.
5. The backend associates the PaymentIntent ID with the order.
6. The backend returns the PaymentIntent ID and client secret to the frontend.
7. The frontend completes the payment using Stripe.js.
8. The backend confirms the final payment status using trusted server-side payment information, such as verified Stripe webhooks.

### Idempotency

The payment implementation uses an idempotency key such as:

`payment-order-<order_id>`

The key is sent to Stripe when creating a PaymentIntent to help prevent duplicate operations when the same request is retried.

The key can also be stored against the order for tracking and troubleshooting.

For retries of the same logical payment operation, reuse the same key. If the application supports separate payment attempts for the same order, manage those attempts and their keys appropriately.

### Payment Amount

Stripe expects amounts in the currency's smallest unit. For INR, the amount is expressed in paise.

If the order total is stored in rupees, convert it to paise before creating the PaymentIntent. Always calculate and validate the order total on the server.

## Database

The database may contain tables such as:

- `users` — customer accounts
- `products` — product catalogue
- `orders` — order details and payment status
- `order_items` — products and quantities in each order
- `payments` — payment records, if implemented separately

The `orders` table may include `stripe_payment_intent_id` and `idempotency_key` fields.

Refer to the actual database schema for the definitive table and column names.

## Testing

Test the application in this sequence:

1. Register or log in.
2. Retrieve products.
3. Create an order.
4. Initiate checkout.
5. Complete a test payment using Stripe test mode.
6. Verify that the PaymentIntent ID is associated with the correct order.
7. If webhooks are implemented, verify that payment status updates correctly.

## Security Considerations

- Keep secret keys on the backend.
- Hash passwords before storing them.
- Validate all incoming requests.
- Protect authenticated routes.
- Verify that customers can access only their own orders.
- Verify Stripe webhook signatures.
- Do not rely solely on frontend success messages to mark orders as paid.
- Use Stripe test mode during development.

following should be in the .env file 
 
```PORT=5000
DATABASE_URL=YOUR_POSTGRES_TRANSACTION_POOL_URL
JWT_SECRET=ANY_hash_key
STRIPE_SECRET_KEY=Your SK_TEST key```
