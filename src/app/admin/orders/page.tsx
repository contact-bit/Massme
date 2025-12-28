export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <main className="admin-page">
      <h1 className="admin-title">📦 Commandes</h1>
      <p style={{ opacity: 0.7 }}>
        Page commandes. (On reconnecte ensuite ta liste + actions ici.)
      </p>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <a className="btn-primary" href="/admin/export">
          Aller à l’export
        </a>
      </div>
    </main>
  );
}
