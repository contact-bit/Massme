"use client";

export function AdminState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-state">
      <div className="admin-state-card">
        <div className="admin-state-icon" aria-hidden="true" />
        <div>
          <h3 className="admin-state-title">{title}</h3>
          {desc ? <p className="admin-state-desc">{desc}</p> : null}
          {action ? <div className="admin-state-action">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
