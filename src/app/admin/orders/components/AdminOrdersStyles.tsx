"use client";
import React from "react";

export function AdminOrdersStyles() {
  return (
    <style jsx global>{`
      /* =========================================================
         ADMIN — ORDERS PAGE (STYLES SPÉCIFIQUES)
         S'appuie sur les tokens globaux (--color-*, --radius-*, --space-*)
      ========================================================== */

      body {
        background: var(--color-bg);
      }

      /* Enveloppe page commandes */

      .admin-page {
        max-width: var(--content-default, 1280px);
        margin: 0 auto;
        padding: var(--space-4, 16px) var(--space-4, 16px)
          var(--space-8, 32px);
        color: var(--color-text);
      }

      /* Top bar locale (per-page), sous le topbar global */

      .topBar {
        position: sticky;
        top: calc(var(--header-height, 0px));
        z-index: 10;
        margin: 0 0 var(--space-3, 12px);
        padding: 12px 0;
        background: color-mix(
          in srgb,
          var(--color-bg) 88%,
          transparent
        );
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--color-border);
      }

      .title {
        font-size: var(--text-lg, 18px);
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .sub {
        margin-top: 4px;
        font-size: var(--text-xs, 12px);
        color: var(--color-text-muted);
      }

      .row {
        display: flex;
        gap: var(--space-3, 12px);
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .rowRight {
        display: flex;
        gap: var(--space-2, 8px);
        align-items: center;
        flex-wrap: wrap;
      }

      /* KPI grid */

      .gridKpi {
        display: grid;
        grid-template-columns: repeat(4, minmax(220px, 1fr));
        gap: var(--space-3, 12px);
        margin-top: var(--space-2, 8px);
      }

      @media (max-width: 980px) {
        .gridKpi {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 520px) {
        .gridKpi {
          grid-template-columns: 1fr;
        }
      }

      /* Card générique (spécifique à la page mais alignée visuellement) */

      .card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg, 16px);
        box-shadow: var(--shadow-sm);
      }

      .cardPad {
        padding: var(--space-3, 12px);
      }

      .kLabel {
        font-size: var(--text-xs, 12px);
        color: var(--color-text-muted);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .kValue {
        font-size: var(--text-xl, 24px);
        font-weight: 800;
        margin-top: 6px;
      }

      .kSub {
        font-size: var(--text-xs, 12px);
        color: var(--color-text-muted);
        margin-top: 4px;
      }

      /* Filtres */

      .filters {
        display: grid;
        grid-template-columns: 1.6fr 0.85fr 0.85fr 0.85fr 0.85fr auto;
        gap: var(--space-3, 12px);
        align-items: flex-end;
      }

      @media (max-width: 980px) {
        .filters {
          grid-template-columns: 1fr 1fr;
        }
      }

      .field label {
        display: block;
        font-size: var(--text-xs, 12px);
        font-weight: 700;
        color: var(--color-text-muted);
        margin-bottom: 6px;
      }

      .input,
      .select {
        width: 100%;
        height: 40px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        padding: 0 12px;
        outline: none;
        color: var(--color-text);
        box-shadow: none;
        font-size: var(--text-sm, 14px);
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          background 0.15s ease;
      }

      .input::placeholder,
      .select::placeholder {
        color: var(--color-text-muted);
      }

      .input:focus,
      .select:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-soft, rgba(37, 99, 235, 0.18));
        background: var(--color-surface);
      }

      /* Boutons locaux (rely on .btn-* global si dispo, sinon ceux-ci) */

      .btn {
        height: 40px;
        padding: 0 14px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        font-weight: 600;
        font-size: var(--text-sm, 14px);
        color: var(--color-text);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition:
          transform 0.12s ease,
          box-shadow 0.12s ease,
          background 0.12s ease,
          border-color 0.12s ease;
      }

      .btn:hover {
        background: var(--color-surface-alt);
        box-shadow: var(--shadow-sm);
      }

      .btn:active {
        transform: translateY(1px);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
      }

      .btn--primary {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }

      .btn--ghost,
      .btn--soft {
        background: var(--color-surface-alt);
        border-color: var(--color-border);
      }

      .btn--chip {
        border-radius: 999px;
      }

      /* List header */

      .listHead {
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid var(--color-border);
      }

      .listTitle {
        font-weight: 700;
      }

      .muted {
        color: var(--color-text-muted);
        font-size: var(--text-xs, 12px);
      }

      /* Table */

      .tableWrap {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1080px;
      }

      th {
        text-align: left;
        font-size: var(--text-xs, 12px);
        padding: 10px 12px;
        color: var(--color-text-muted);
        font-weight: 700;
        white-space: nowrap;
        background: var(--color-surface-alt);
      }

      td {
        padding: 10px 12px;
        font-size: var(--text-sm, 13px);
        color: var(--color-text);
        border-top: 1px solid var(--color-border);
        vertical-align: top;
        background: var(--color-surface);
      }

      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      /* Icon buttons */

      .iconBtn {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md, 12px);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--color-border);
        background: var(--color-surface-alt);
        color: var(--color-text);
        cursor: pointer;
        transition:
          transform 0.12s ease,
          box-shadow 0.12s ease,
          background 0.12s ease,
          border-color 0.12s ease;
      }

      .iconBtn:hover {
        background: var(--color-surface);
        box-shadow: var(--shadow-sm);
      }

      .iconBtn:active {
        transform: translateY(1px);
      }

      .iconBtn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none;
      }

      .iconBtn--primary {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }

      .iconBtn--success {
        background: var(--color-success-soft, rgba(16, 185, 129, 0.12));
        color: var(--color-success, #15803d);
        border-color: color-mix(
          in srgb,
          var(--color-success) 40%,
          transparent
        );
      }

      .iconBtn--danger {
        background: var(--color-danger-soft, rgba(239, 68, 68, 0.12));
        color: var(--color-danger, #dc2626);
        border-color: color-mix(
          in srgb,
          var(--color-danger) 40%,
          transparent
        );
      }

      /* Pills statut */

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: var(--text-xs, 12px);
        font-weight: 700;
        background: var(--color-surface-alt);
        color: var(--color-text);
        white-space: nowrap;
      }

      .pill--paid {
        background: var(--color-success-soft, rgba(16, 185, 129, 0.12));
        color: var(--color-success, #15803d);
      }

      .pill--pending {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }

      .pill--canceled {
        background: var(--color-danger-soft, rgba(239, 68, 68, 0.12));
        color: var(--color-danger, #dc2626);
      }

      .pill--refunded {
        background: rgba(59, 130, 246, 0.12);
        color: #2563eb;
      }

      .pill--other {
        background: rgba(148, 163, 184, 0.16);
        color: rgba(30, 41, 59, 0.95);
      }

      /* Status block */

      .statusBlock {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.45;
        max-width: 260px;
      }

      .statusMain {
        color: #c05621;
        font-weight: 700;
      }

      .statusHint {
        color: var(--color-text-muted);
        font-weight: 500;
        margin-top: 2px;
      }

      .statusBlock:hover .statusHint {
        text-decoration: underline;
      }

      /* Footer list */

      .footer {
        padding: 12px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        border-top: 1px solid var(--color-border);
        flex-wrap: wrap;
      }

      /* Layout cartes mobile */

      .hideMobile {
        display: block;
      }

      .showMobile {
        display: none;
      }

      @media (max-width: 900px) {
        .hideMobile {
          display: none;
        }
        .showMobile {
          display: block;
        }
      }

      .cards {
        padding: 12px;
        display: grid;
        gap: 12px;
      }

      .orderCard {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg, 16px);
        padding: 12px;
        background: var(--color-surface);
        box-shadow: var(--shadow-sm);
      }

      .cardTop {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: flex-start;
      }

      .amount {
        font-weight: 800;
        font-size: 16px;
      }

      .date {
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 2px;
      }

      .cardBody {
        margin-top: 10px;
        font-size: 13px;
      }

      .cardEmail {
        margin-top: 6px;
        color: var(--color-text);
      }

      .cardItems {
        margin-top: 6px;
      }

      .cardBtns {
        margin-top: 12px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }

      .selectLine {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* Drawer */

      .drawerBackdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;
        z-index: 50;
      }

      .drawerBackdrop--open {
        opacity: 1;
        pointer-events: auto;
      }

      .drawer {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: min(560px, 94vw);
        background: var(--color-surface);
        border-left: 1px solid var(--color-border);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        transform: translateX(102%);
        transition: transform 0.22s ease;
        z-index: 51;
        display: flex;
        flex-direction: column;
      }

      .drawer--open {
        transform: translateX(0);
      }

      .drawerHead {
        padding: 14px;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .drawerTitle {
        font-weight: 700;
        font-size: 14px;
      }

      .drawerBody {
        padding: 14px;
        overflow: auto;
      }

      /* Détails commande */

      .detailGrid {
        display: grid;
        gap: 14px;
      }

      .detailTop {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .detailAmount {
        font-weight: 800;
        font-size: 18px;
      }

      .detailDate {
        margin-top: 4px;
        color: var(--color-text-muted);
        font-size: 12px;
      }

      .box {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg, 16px);
        padding: 12px;
        background: var(--color-surface-alt);
      }

      .boxTitle {
        font-weight: 700;
        font-size: 13px;
        margin-bottom: 10px;
      }

      .kv {
        display: grid;
        grid-template-columns: 90px 1fr;
        gap: 10px;
        font-size: 13px;
        align-items: start;
        margin-top: 6px;
      }

      .kvKey {
        color: var(--color-text-muted);
        font-weight: 700;
      }

      .kvVal {
        color: var(--color-text);
        font-weight: 700;
      }

      .rowBtns {
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .items {
        display: grid;
        gap: 10px;
      }

      .itemCard {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg, 16px);
        padding: 12px;
        background: var(--color-surface);
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .itemLeft {
        min-width: 0;
      }

      .itemName {
        font-weight: 700;
        font-size: 13px;
      }

      .itemDesc {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-muted);
      }

      .itemMeta {
        margin-top: 6px;
        font-size: 12px;
        color: var(--color-text-muted);
      }

      .itemPrice {
        font-weight: 800;
        white-space: nowrap;
      }

      .sum {
        margin-top: 12px;
        border-top: 1px solid var(--color-border);
        padding-top: 12px;
        display: grid;
        gap: 6px;
      }

      .sumRow {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
      }

      .sumKey {
        color: var(--color-text-muted);
        font-weight: 700;
      }

      .sumVal {
        color: var(--color-text);
        font-weight: 700;
      }

      .sumRow--total {
        margin-top: 4px;
      }

      .sumKey--total,
      .sumVal--total {
        font-weight: 800;
      }

      .addr {
        font-size: 13px;
        color: var(--color-text);
        white-space: pre-wrap;
      }

      /* Toast local */

      .toast {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 60;
        padding: 10px 12px;
        border-radius: var(--radius-lg, 16px);
        border: 1px solid var(--color-border);
        background: color-mix(
          in srgb,
          var(--color-surface) 96%,
          transparent
        );
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-md);
        font-weight: 700;
        font-size: 13px;
        color: var(--color-text);
      }
    `}</style>
  );
}