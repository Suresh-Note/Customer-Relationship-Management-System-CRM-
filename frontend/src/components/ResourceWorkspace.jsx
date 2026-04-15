import React, { useEffect, useState } from "react";

function EmptyContent({ title, body }) {
  return (
    <div className="crm-lead-empty-panel">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function renderTabContent(tab) {
  if (!tab.items.length) {
    return (
      <EmptyContent
        title={tab.emptyTitle || "No items yet"}
        body={tab.emptyBody || "Content will appear here."}
      />
    );
  }

  if (tab.kind === "timeline") {
    return (
      <div className="crm-lead-timeline">
        {tab.items.map((item) => (
          <div key={item.id} className="crm-lead-timeline__item">
            <span
              className={`crm-lead-timeline__dot crm-lead-timeline__dot--${item.tone}`}
            />
            <div className="crm-lead-timeline__content">
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
              <small>
                {item.date} · {item.owner}
              </small>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab.kind === "cards") {
    return (
      <div className="crm-lead-notes">
        {tab.items.map((item) => (
          <article key={item.id} className="crm-lead-note-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="crm-lead-deals">
      {tab.items.map((item) => (
        <article key={item.id} className="crm-lead-deal-card">
          <div>
            <strong>{item.title}</strong>
            <p>{item.subtitle}</p>
          </div>
          <div className="crm-lead-deal-card__meta">
            {item.pill && (
              <span className={`crm-lead-pill crm-lead-pill--${item.pill.tone}`}>
                {item.pill.label}
              </span>
            )}
            {item.value && <strong>{item.value}</strong>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ResourceWorkspace({ config }) {
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("activity");

  useEffect(() => {
    if (!config.items.length) {
      return;
    }

    const hasSelectedItem = config.items.some(
      (item) => String(item.id) === String(selectedId)
    );

    if (!hasSelectedItem) {
      setSelectedId(config.items[0].id);
    }
  }, [config.items, selectedId]);

  const activeItem =
    config.items.find((item) => String(item.id) === String(selectedId)) ||
    config.items[0] ||
    null;

  useEffect(() => {
    if (!activeItem?.tabs?.length) {
      return;
    }

    const hasActiveTab = activeItem.tabs.some((tab) => tab.key === activeTab);

    if (!hasActiveTab) {
      setActiveTab(activeItem.tabs[0].key);
    }
  }, [activeItem, activeTab]);

  if (!activeItem) {
    return (
      <div className="crm-leads-page">
        <div className="crm-leads-page__inner">
          <div className="crm-lead-empty-card">
            <h1>{config.title}</h1>
            <p>No records available in this workspace yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const activeTabConfig =
    activeItem.tabs.find((tab) => tab.key === activeTab) || activeItem.tabs[0];

  return (
    <div className="crm-leads-page">
      <div className="crm-leads-page__inner">
        <header className="crm-leads-header">
          <div>
            <p className="crm-leads-header__eyebrow">{config.eyebrow}</p>
            <h1>{config.title}</h1>
            <p>{config.description}</p>
          </div>

          <div className="crm-leads-header__meta">
            {config.meta.map((metaItem) => (
              <span key={metaItem}>{metaItem}</span>
            ))}
          </div>
        </header>

        <section className="crm-lead-directory" aria-label={`${config.title} selector`}>
          {config.items.map((item) => {
            const isActive = String(item.id) === String(activeItem.id);

            return (
              <button
                key={item.id}
                type="button"
                className={`crm-lead-directory__item${isActive ? " is-active" : ""}`}
                onClick={() => {
                  setSelectedId(item.id);
                  setActiveTab(item.tabs[0]?.key || "activity");
                }}
              >
                <span className="crm-lead-directory__avatar">{item.directory.avatar}</span>
                <span className="crm-lead-directory__copy">
                  <strong>{item.directory.title}</strong>
                  <small>{item.directory.meta}</small>
                </span>
              </button>
            );
          })}
        </section>

        <section className="crm-lead-workspace">
          <aside className="crm-lead-sidebar">
            <article className="crm-lead-card crm-lead-card--profile">
              <div className="crm-lead-avatar">{activeItem.profile.avatar}</div>
              <h2>{activeItem.profile.title}</h2>
              <p className="crm-lead-card__subtext">{activeItem.profile.subtitle}</p>

              <div className="crm-lead-pill-row">
                {activeItem.profile.pills.map((pill) => (
                  <span key={pill.label} className={`crm-lead-pill crm-lead-pill--${pill.tone}`}>
                    {pill.label}
                  </span>
                ))}
              </div>

              <dl className="crm-lead-details">
                {activeItem.profile.details.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="crm-lead-card crm-lead-card--score">
              <div className="crm-lead-card__label">{activeItem.profile.scoreLabel}</div>
              <div className="crm-lead-score">
                <div className="crm-lead-score__track">
                  <span
                    className="crm-lead-score__fill"
                    style={{ width: `${activeItem.profile.score}%` }}
                  />
                </div>
                <strong>{activeItem.profile.score} / 100</strong>
              </div>
            </article>

            <article className="crm-lead-card">
              <div className="crm-lead-card__label">Tags</div>
              <div className="crm-lead-tag-list">
                {activeItem.profile.tags.map((tag) => (
                  <span key={tag} className="crm-lead-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </aside>

          <div className="crm-lead-main">
            <article className="crm-lead-panel">
              <div className="crm-lead-panel__header">
                <div className="crm-lead-tabs" role="tablist" aria-label={`${config.title} tabs`}>
                  {activeItem.tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      className={`crm-lead-tabs__button${activeTab === tab.key ? " is-active" : ""}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button type="button" className="crm-lead-panel__menu" aria-label="More actions">
                  ...
                </button>
              </div>

              {renderTabContent(activeTabConfig)}

              <div className="crm-lead-open-deals">
                <div className="crm-lead-open-deals__header">
                  <strong>{activeItem.bottomSection.title}</strong>
                  <button type="button" className="crm-lead-open-deals__button">
                    {activeItem.bottomSection.buttonLabel}
                  </button>
                </div>

                {activeItem.bottomSection.items.length ? (
                  <div className="crm-lead-open-deals__list">
                    {activeItem.bottomSection.items.map((item) => (
                      <div key={item.id} className="crm-lead-open-deals__row">
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.subtitle}</p>
                        </div>
                        <div className="crm-lead-open-deals__row-meta">
                          {item.pill && (
                            <span className={`crm-lead-pill crm-lead-pill--${item.pill.tone}`}>
                              {item.pill.label}
                            </span>
                          )}
                          {item.value && <strong>{item.value}</strong>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="crm-lead-empty-panel crm-lead-empty-panel--soft">
                    <strong>{activeItem.bottomSection.emptyTitle || "Nothing here yet"}</strong>
                    <p>{activeItem.bottomSection.emptyBody || "Linked records will appear here."}</p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
