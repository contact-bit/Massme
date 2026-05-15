/* =====================================================
   CONSTANTS
===================================================== */

const OCULAREST_ID =
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
         LIMIT OCULAREST
      ========================================= */

      if (
        item.id ===
        OCULAREST_ID
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