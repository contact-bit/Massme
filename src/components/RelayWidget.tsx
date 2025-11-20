"use client";

export default function RelayModalPickup({
  onSelect,
  onClose,
}: {
  onSelect: (relay: any) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-2xl rounded-lg p-4 relative">
        
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-3">Choisir un point Pickup</h2>

        {/* TON WIDGET EXISTANT */}
        <div id="pickup-widget"></div>

      </div>
    </div>
  );
}
