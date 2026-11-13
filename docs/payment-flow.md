# Payment flow: COD and PayOS

## Supported methods

- `COD`: checkout commits the order and stock reservation. Payment stays `PENDING` until delivery is completed/received, when the existing order flow marks **COD only** as paid.
- `BANK_TRANSFER`: checkout commits order and pending payment first. The browser asks the API for a PayOS link, then redirects to PayOS. Browser return never marks the order paid.

## API contract

Customer routes require `CLIENT` and verify ownership through `orders.user_id`:

- `POST /api/v1/checkout/orders` — idempotently creates order, shop orders, stock reservation, and pending payment.
- `POST /api/v1/orders/{orderId}/payment` — creates/recovers a PayOS link; returns `data.checkout_url`, `data.qr_code`, and status.
- `GET /api/v1/orders/{orderId}/payment` — authoritative payment state for polling after returning from PayOS.
- `POST /api/v1/webhooks/payos` — public provider callback. HMAC signature, stable provider order code, amount, and transaction reference are verified; duplicate references are idempotent.

Only a signed webhook can mark an online payment `PAID`. A lost browser connection is recovered by repeating the POST or polling GET.

## Configuration

Set the following in ignored root `.env` or a deployment secret manager; never commit real credentials:

```dotenv
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_RETURN_URL=http://localhost:5173/payment/result
PAYOS_CANCEL_URL=http://localhost:5173/payment/result
PUBLIC_API_URL=https://public-api.example.com
```

PayOS must reach `PUBLIC_API_URL/api/v1/webhooks/payos` over HTTPS. Localhost is not reachable by PayOS; use a temporary secure tunnel for development and register/confirm its webhook URL with PayOS. API keys remain backend-only. Empty credentials disable transfer link creation while COD continues working; partial credential sets fail startup.

The payment migration creates `payment_attempts` and `payment_webhook_events`. Development Compose applies migrations at startup; production must run the migration command before deploying the API.

## Financial boundaries and testing

This integration collects payments; it does not implement provider-backed refunds. Cancelling an order or approving a return must not be reported as a completed refund. Paid orders retain their actual payment state for audit and reconciliation until a refund workflow is implemented.

Unit tests cover canonical webhook signatures and malformed/tampered values. Automated integration tests must mock provider calls and never initiate real transfers. PayOS documents the merchant production API endpoint; any live-account test should be separately controlled, low-value, and confirmed by the operator after the webhook is reachable.
