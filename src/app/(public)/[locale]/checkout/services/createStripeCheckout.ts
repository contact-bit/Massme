import type {
  StripeCheckoutPayload,
} from "../types";

type CreateStripeCheckoutParams = {
  payload: StripeCheckoutPayload;

  clearCart: () => void;

  paymentError: string;
};

export async function createStripeCheckout({
  payload,
  clearCart,
  paymentError,
}: CreateStripeCheckoutParams) {
  const res =
    await fetch(
      "/api/checkout",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await res
      .json()
      .catch(
        () => null
      );

  if (
    !res.ok ||
    !json?.url
  ) {
    alert(
      paymentError
    );

    return;
  }

  clearCart();

  window.location.href =
    json.url;
}