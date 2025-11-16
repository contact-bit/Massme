export default function BesoinPageTemplate({
  title,
  subtitle,
  paragraphs,
}: {
  title: string;
  subtitle?: string;
  paragraphs: string[];
}) {
  return (
    <main className="besoin-page">
      <header className="besoin-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <div className="besoin-content">
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </main>
  );
}
