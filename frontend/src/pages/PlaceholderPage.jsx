import React from "react";

function PlaceholderPage({ title }) {
  return (
    <main className="crm-dashboard-page">
      <section className="crm-dashboard-page__inner">
        <header className="crm-dashboard-header">
          <div>
            <p className="crm-dashboard-header__eyebrow">{title}</p>
            <h1>{title}</h1>
            <p className="crm-dashboard-header__subtext">
              This page is connected in the sidebar. We can build this section next.
            </p>
          </div>
        </header>

        <section className="crm-dashboard-card">
          <div className="crm-dashboard-card__header">
            <div>
              <h2>{title} page</h2>
              <p>Sidebar item added row wise on the left side.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default PlaceholderPage;
