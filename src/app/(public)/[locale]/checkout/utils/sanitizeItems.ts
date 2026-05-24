/* =====================================================
   CONSTANTS
===================================================== */

const VITRECTOMED_PRODUCT_ID =
  "3tuSUenbUVVF6cuSHwS9";

/* =====================================================
   TYPES
===================================================== */

type CartItem = {
  id: string;
  quantity: number;

  [key: string]: unknown;
};

/* =====================================================
   SANITIZE ITEMS
===================================================== */

export function sanitizeItems<
  T extends CartItem,
>(
  items: T[]
): T[] {
  return items.map(
    (item) => {
      /* =========================================
         LIMIT VITRECTOMED PRODUCT
      ========================================= */

      if (
        item.id ===
        VITRECTOMED_PRODUCT_ID
      ) {
        return {
          ...item,

          quantity:
            Math.min(
              item.quantity,
              2
            ),
        };
      }

      /* =========================================
         DEFAULT
      ========================================= */

      return item;
    }
  );
}
