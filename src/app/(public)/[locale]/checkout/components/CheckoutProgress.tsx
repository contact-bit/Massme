"use client";

import "./CheckoutProgress.css";

type CheckoutStep =
  | "shipping"
  | "billing"
  | "payment";

type StepItem = {
  id: CheckoutStep;
  number: number;
  label: string;
};

type Props = {
  currentStep: CheckoutStep;

  t: {
    shipping: string;
    payment: string;
  };
};

const STEP_ORDER: StepItem[] = [
  {
    id: "billing",
    number: 1,
    label: "Informations",
  },

  {
    id: "shipping",
    number: 2,
    label: "Livraison",
  },

  {
    id: "payment",
    number: 3,
    label: "Paiement",
  },
];

export default function CheckoutProgress({
  currentStep,
}: Props) {

  const currentIndex =
    STEP_ORDER.findIndex(
      (step) =>
        step.id === currentStep
    );

  return (
    <nav
      className="checkout-progress"
      data-step={currentStep}
      aria-label="Progression de la commande"
    >

      <div className="checkout-progress-steps">

        {STEP_ORDER.map(
          (step, index) => {

            const isActive =
              step.id === currentStep;

            const isCompleted =
              index < currentIndex;

            return (
              <div
                key={step.id}
                className={`
                  checkout-progress-step
                  ${
                    isActive
                      ? "checkout-progress-step-active"
                      : ""
                  }
                  ${
                    isCompleted
                      ? "checkout-progress-step-completed"
                      : ""
                  }
                `}
              >

                {/* =========================
                    CIRCLE
                ========================= */}

                <div
                  className="checkout-progress-circle"
                  aria-current={
                    isActive
                      ? "step"
                      : undefined
                  }
                >
                  {isCompleted
                    ? "✓"
                    : step.number}
                </div>

                {/* =========================
                    LABEL
                ========================= */}

                <span className="checkout-progress-label">
                  {step.label}
                </span>

              </div>
            );
          }
        )}

      </div>
    </nav>
  );
}
