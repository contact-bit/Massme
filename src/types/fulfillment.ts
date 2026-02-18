export type FulfillmentStatus = "pending" | "preparing" | "shipped" | "delivered";

export type FulfillmentTracking = {
  carrier?: string;
  trackingNumber?: string;
  shipDate?: string; // ISO
};

export type FulfillmentShipStation = {
  orderKey: string; // ton orderId interne
  orderId?: number; // shipstation orderId
};

export type OrderFulfillment = {
  status: FulfillmentStatus;
  shipstation?: FulfillmentShipStation;
  tracking?: FulfillmentTracking;
};
