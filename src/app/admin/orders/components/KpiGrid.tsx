"use client";
import React from "react";
import { moneyEUR } from "../domain/utils";

export function KpiGrid({
  stats,
  from,
  to,
}: {
  stats: {
    count: number;
    paidCount: number;
    pendingCount: number;
    totalEUR: number;
    paidEUR: number;
    avg: number;
  };
  from: string;
  to: string;
}) {
  return (
    <div className="gridKpi">
      <div className="card cardPad">
        <div className="kLabel">Commandes</div>
        <div className="kValue">{stats.count}</div>
        <div className="kSub">
          Période: {from} → {to}
        </div>
      </div>

      <div className="card cardPad">
        <div className="kLabel">Payées</div>
        <div className="kValue">{stats.paidCount}</div>
        <div className="kSub">{moneyEUR(stats.paidEUR)}</div>
      </div>

      <div className="card cardPad">
        <div className="kLabel">En attente</div>
        <div className="kValue">{stats.pendingCount}</div>
        <div className="kSub">pending_payment</div>
      </div>

      <div className="card cardPad">
        <div className="kLabel">Panier moyen</div>
        <div className="kValue">{moneyEUR(stats.avg)}</div>
        <div className="kSub">CA: {moneyEUR(stats.totalEUR)}</div>
      </div>
    </div>
  );
}
