import { settings } from "../../config/settings.js";

// `query` keeps the planner's station/radius choice when moving between pages.
export default function Layout({ pages, current, query = "", children }) {
  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          TOD Opportunity Screener
          <span className="area">{settings.studyArea}</span>
        </div>
        <nav>
          {pages.map((p) => (
            <a key={p.path} href={`#${p.path}${query}`} className={p.path === current ? "active" : ""}>
              {p.label}
            </a>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        Prototype, Meeting 3. Data: {settings.dataStatus.toLowerCase()} · asking prices · straight-line distances. Results support, and never replace, professional judgement.
      </footer>
    </div>
  );
}
