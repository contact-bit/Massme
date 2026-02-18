"use client";
import React from "react";

export function AdminOrdersStyles() {
  return (
    <style jsx global>{`
      :root {
        --bg: #f5f7fb;
        --card: #ffffff;
        --text: #0b1220;
        --muted: rgba(11, 18, 32, 0.6);
        --border: rgba(11, 18, 32, 0.1);
        --shadow: 0 18px 40px rgba(11, 18, 32, 0.08);
        --shadow2: 0 12px 26px rgba(11, 18, 32, 0.06);
        --radius: 18px;
      }
      body {
        background: var(--bg);
      }
      .adminWrap {
        max-width: 1280px;
        margin: 0 auto;
        padding: 18px 16px 90px;
        color: var(--text);
      }
      .topBar {
        position: sticky;
        top: 0;
        z-index: 10;
        margin: -18px -16px 14px;
        padding: 14px 16px;
        background: rgba(245, 247, 251, 0.78);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(11, 18, 32, 0.08);
      }
      .title {
        font-size: 22px;
        font-weight: 950;
        margin: 0;
      }
      .sub {
        margin-top: 4px;
        font-size: 13px;
        color: var(--muted);
      }

      .row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .rowRight {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .gridKpi {
        display: grid;
        grid-template-columns: repeat(4, minmax(220px, 1fr));
        gap: 12px;
        margin-top: 8px;
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

      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow2);
      }
      .cardPad {
        padding: 14px;
      }

      .kLabel {
        font-size: 12px;
        color: var(--muted);
        font-weight: 850;
      }
      .kValue {
        font-size: 22px;
        font-weight: 950;
        margin-top: 6px;
      }
      .kSub {
        font-size: 12px;
        color: var(--muted);
        margin-top: 4px;
      }

      .filters {
        display: grid;
        grid-template-columns: 1.6fr 0.85fr 0.85fr 0.85fr 0.85fr auto;
        gap: 12px;
        align-items: end;
      }
      @media (max-width: 980px) {
        .filters {
          grid-template-columns: 1fr 1fr;
        }
      }

      .field label {
        display: block;
        font-size: 12px;
        font-weight: 900;
        color: rgba(11, 18, 32, 0.7);
        margin-bottom: 6px;
      }
      .input,
      .select {
        width: 100%;
        height: 42px;
        border-radius: 14px;
        border: 1px solid rgba(11, 18, 32, 0.14);
        background: rgba(255, 255, 255, 0.92);
        padding: 0 12px;
        outline: none;
        color: rgba(11, 18, 32, 0.92);
        box-shadow: 0 10px 22px rgba(11, 18, 32, 0.06);
      }
      .input:focus,
      .select:focus {
        border-color: rgba(11, 18, 32, 0.3);
        box-shadow: 0 16px 34px rgba(11, 18, 32, 0.1);
      }

      .btn {
        height: 42px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1px solid rgba(11, 18, 32, 0.14);
        background: rgba(255, 255, 255, 0.92);
        font-weight: 900;
        color: rgba(11, 18, 32, 0.92);
        cursor: pointer;
        box-shadow: 0 12px 26px rgba(11, 18, 32, 0.06);
        transition: transform 0.12s ease, box-shadow 0.12s ease,
          background 0.12s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .btn:hover {
        box-shadow: 0 18px 40px rgba(11, 18, 32, 0.1);
      }
      .btn:active {
        transform: translateY(1px);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn--primary {
        background: rgba(11, 18, 32, 0.92);
        color: white;
        border-color: rgba(11, 18, 32, 0.2);
      }
      .btn--ghost {
        background: rgba(11, 18, 32, 0.04);
        border-color: rgba(11, 18, 32, 0.1);
      }
      .btn--soft {
        background: rgba(11, 18, 32, 0.04);
        border-color: rgba(11, 18, 32, 0.1);
      }

      .btn--chip {
        border-radius: 999px;
        transition: transform 0.14s ease, box-shadow 0.14s ease,
          background 0.14s ease;
      }
      .btn--chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 18px rgba(15, 23, 42, 0.16);
      }
      .btn--pulse {
        animation: pulsePrep 0.9s ease-out 1;
      }
      @keyframes pulsePrep {
        0% {
          box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5);
          transform: scale(1);
        }
        60% {
          box-shadow: 0 0 0 8px rgba(249, 115, 22, 0);
          transform: scale(1.04);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
          transform: scale(1);
        }
      }

      .listHead {
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid rgba(11, 18, 32, 0.08);
      }
      .listTitle {
        font-weight: 950;
      }
      .muted {
        color: var(--muted);
        font-size: 13px;
      }

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
        font-size: 12px;
        padding: 12px 12px;
        color: rgba(11, 18, 32, 0.65);
        font-weight: 950;
        white-space: nowrap;
        background: rgba(11, 18, 32, 0.03);
      }
      td {
        padding: 12px 12px;
        font-size: 13px;
        color: rgba(11, 18, 32, 0.92);
        border-top: 1px solid rgba(11, 18, 32, 0.06);
        vertical-align: top;
        background: white;
      }

      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      .iconBtn {
        width: 40px;
        height: 40px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(11, 18, 32, 0.1);
        background: rgba(11, 18, 32, 0.04);
        color: rgba(11, 18, 32, 0.9);
        box-shadow: 0 12px 26px rgba(11, 18, 32, 0.06);
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease,
          background 0.12s ease;
      }
      .iconBtn:hover {
        box-shadow: 0 18px 40px rgba(11, 18, 32, 0.1);
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
        background: rgba(11, 18, 32, 0.92);
        color: white;
        border-color: rgba(11, 18, 32, 0.2);
      }
      .iconBtn--success {
        background: rgba(16, 185, 129, 0.14);
        color: rgba(5, 150, 105, 1);
        border-color: rgba(16, 185, 129, 0.26);
      }
      .iconBtn--danger {
        background: rgba(239, 68, 68, 0.12);
        color: rgba(220, 38, 38, 1);
        border-color: rgba(239, 68, 68, 0.26);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 950;
        background: rgba(11, 18, 32, 0.06);
        color: rgba(11, 18, 32, 0.85);
        white-space: nowrap;
      }
      .pill--paid {
        background: rgba(16, 185, 129, 0.14);
        color: rgba(5, 150, 105, 1);
      }
      .pill--pending {
        background: rgba(245, 158, 11, 0.14);
        color: rgba(217, 119, 6, 1);
      }
      .pill--canceled {
        background: rgba(239, 68, 68, 0.14);
        color: rgba(220, 38, 38, 1);
      }
      .pill--refunded {
        background: rgba(59, 130, 246, 0.14);
        color: rgba(37, 99, 235, 1);
      }
      .pill--other {
        background: rgba(148, 163, 184, 0.18);
        color: rgba(30, 41, 59, 0.95);
      }

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
        color: rgba(15, 23, 42, 0.7);
        font-weight: 500;
        margin-top: 2px;
        opacity: 0.92;
      }
      .statusBlock:hover .statusHint {
        text-decoration: underline;
      }

      .footer {
        padding: 12px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        border-top: 1px solid rgba(11, 18, 32, 0.08);
        flex-wrap: wrap;
      }

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
        border: 1px solid rgba(11, 18, 32, 0.1);
        border-radius: 16px;
        padding: 12px;
        background: white;
        box-shadow: var(--shadow2);
      }
      .cardTop {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: flex-start;
      }
      .amount {
        font-weight: 950;
        font-size: 16px;
      }
      .date {
        font-size: 12px;
        color: var(--muted);
        margin-top: 2px;
      }
      .cardBody {
        margin-top: 10px;
        font-size: 13px;
      }
      .cardEmail {
        margin-top: 6px;
        color: rgba(11, 18, 32, 0.75);
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
        background: white;
        border-left: 1px solid rgba(11, 18, 32, 0.1);
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
        border-bottom: 1px solid rgba(11, 18, 32, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      .drawerTitle {
        font-weight: 950;
        font-size: 14px;
      }
      .drawerBody {
        padding: 14px;
        overflow: auto;
      }

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
        font-weight: 950;
        font-size: 18px;
      }
      .detailDate {
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .box {
        border: 1px solid rgba(11, 18, 32, 0.1);
        border-radius: 16px;
        padding: 12px;
        background: rgba(11, 18, 32, 0.02);
      }
      .boxTitle {
        font-weight: 950;
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
        color: var(--muted);
        font-weight: 850;
      }
      .kvVal {
        color: rgba(11, 18, 32, 0.92);
        font-weight: 850;
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
        border: 1px solid rgba(11, 18, 32, 0.1);
        border-radius: 16px;
        padding: 12px;
        background: white;
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .itemLeft {
        min-width: 0;
      }
      .itemName {
        font-weight: 900;
        font-size: 13px;
      }
      .itemDesc {
        margin-top: 4px;
        font-size: 12px;
        color: var(--muted);
      }
      .itemMeta {
        margin-top: 6px;
        font-size: 12px;
        color: var(--muted);
      }
      .itemPrice {
        font-weight: 950;
        white-space: nowrap;
      }

      .sum {
        margin-top: 12px;
        border-top: 1px solid rgba(11, 18, 32, 0.08);
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
        color: rgba(11, 18, 32, 0.65);
        font-weight: 850;
      }
      .sumVal {
        color: rgba(11, 18, 32, 0.92);
        font-weight: 900;
      }
      .sumRow--total {
        margin-top: 4px;
      }
      .sumKey--total,
      .sumVal--total {
        font-weight: 950;
      }

      .addr {
        font-size: 13px;
        color: rgba(11, 18, 32, 0.85);
        white-space: pre-wrap;
      }

      .toast {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 60;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(11, 18, 32, 0.12);
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 40px rgba(11, 18, 32, 0.14);
        font-weight: 950;
        font-size: 13px;
        color: rgba(11, 18, 32, 0.92);
      }
    `}</style>
  );
}
