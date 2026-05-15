import type {
  BankTransferPayload,
} from "../types";

type CreateBankTransferOrderParams = {
  payload: BankTransferPayload;

  locale: string;

  clearCart: () => void;

  paymentError: string;
};

export async function createBankTransferOrder({
  payload,
  locale,
  clearCart,
  paymentError,
}: CreateBankTransferOrderParams) {
  const res =
    await fetch(
      "/api/bank-transfer/create-order",
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
    !json?.ok ||
    !json?.orderId
  ) {
    alert(
      paymentError
    );

    return;
  }

  clearCart();

  window.location.href = `/${locale}/bank-transfer?order_id=${encodeURIComponent(
    json.orderId
  )}&reference=${encodeURIComponent(
    json.reference ||
      json.orderNumber ||
      ""
  )}&amount=${encodeURIComponent(
    String(
      json.totalTTC ?? ""
    )
  )}`;
}