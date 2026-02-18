// src/lib/paypal-client.ts
import paypal from "@paypal/checkout-server-sdk";

function getEnvironment() {
  if (process.env.PAYPAL_ENV === "live") {
    return new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );
  }

  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  );
}

export function getPayPalClient() {
  const environment = getEnvironment();
  return new paypal.core.PayPalHttpClient(environment);
}
