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
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      {/* COMMANDES */}
      <article className="kpi-card">
        <div className="kpi-top">
          <span className="kpi-label">Commandes</span>
        </div>

        <div className="kpi-value">{stats.count}</div>

        <div className="kpi-sub">
          Nombre total de commandes
        </div>
      </article>

      {/* PAYÉES */}
      <article className="kpi-card success">
        <div className="kpi-top">
          <span className="kpi-label">Payées</span>
          <span className="kpi-dot" />
        </div>

        <div className="kpi-value">{stats.paidCount}</div>

        <div className="kpi-sub">
          {moneyEUR(stats.paidEUR)}
        </div>
      </article>

      {/* EN ATTENTE */}
      <article className="kpi-card warning">
        <div className="kpi-top">
          <span className="kpi-label">En attente</span>
          <span className="kpi-dot" />
        </div>

        <div className="kpi-value">{stats.pendingCount}</div>

        <div className="kpi-sub">
          Paiement non validé
        </div>
      </article>

      {/* PANIER MOYEN */}
      <article className="kpi-card primary highlight">
        <div className="kpi-top">
          <span className="kpi-label">Panier moyen</span>
          <span className="kpi-dot" />
        </div>

        <div className="kpi-value">
          {moneyEUR(stats.avg)}
        </div>

        <div className="kpi-sub">
          CA total : {moneyEUR(stats.totalEUR)}
        </div>
      </article>

    </section>
  );
}