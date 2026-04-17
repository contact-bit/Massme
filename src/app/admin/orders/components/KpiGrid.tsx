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
    <section className="gridKpi" aria-label="Indicateurs commandes">
      <article className="card cardPad kpiCard">
        <div className="kLabel">Commandes</div>
        <div className="kValue">{stats.count}</div>
        <div className="kSub">
          Période : {from} → {to}
        </div>
      </article>

      <article className="card cardPad kpiCard">
        <div className="kLabel">Payées</div>
        <div className="kValue">{stats.paidCount}</div>
        <div className="kSub">{moneyEUR(stats.paidEUR)}</div>
      </article>

      <article className="card cardPad kpiCard">
        <div className="kLabel">En attente</div>
        <div className="kValue">{stats.pendingCount}</div>
        <div className="kSub">Paiement non validé</div>
      </article>

      <article className="card cardPad kpiCard kpiCard--highlight">
        <div className="kLabel">Panier moyen</div>
        <div className="kValue">{moneyEUR(stats.avg)}</div>
        <div className="kSub">CA total : {moneyEUR(stats.totalEUR)}</div>
      </article>
    </section>
  );
}