import {
  type CphDensity,
  type CphTheme,
  CphAppShell,
  CphButton,
  CphCard,
  CphDensityToggle,
  CphIcon,
  CphInsightPanel,
  CphKnowledgeGraph,
  CphPanel,
  CphProvider,
  CphSearch,
  CphSignalTile,
  CphTable,
  CphThemeToggle,
} from "@nickrobison/colophon";
import { useState } from "react";

import { graphEdges, graphNodes, navItems, rows, signals, topics } from "./data";

function readParams() {
  const q = new URLSearchParams(window.location.search);
  const theme = q.get("theme");
  const density = q.get("density");
  const view = q.get("view");
  return {
    theme: (theme === "dark" ? "dark" : "light") as CphTheme,
    density: (density === "compact" || density === "dense" ? density : "comfortable") as CphDensity,
    view: (view === "table" ? "table" : "cards") as "cards" | "table",
  };
}

function PageHeading() {
  return (
    <div className="cph-page-heading">
      <div>
        <span className="cph-eyebrow">Research intelligence / 04 June 2025</span>
        <h1>The shape of your knowledge.</h1>
        <p>Trace the ideas, people, and evidence moving through your research corpus.</p>
      </div>
      <div className="cph-period" role="group" aria-label="Select time period">
        {["30 days", "Quarter", "All time"].map((p) => (
          <button key={p} type="button" className="cph-period__btn">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function Signals() {
  return (
    <div className="cph-signal-grid">
      {signals.map((s) => (
        <CphSignalTile
          key={s.mark}
          mark={s.mark}
          value={s.value}
          delta={s.delta}
          label={s.label}
          urgent={s.urgent}
        />
      ))}
    </div>
  );
}

function GraphPanel() {
  return (
    <CphPanel
      className="cph-graph-panel"
      heading={
        <div>
          <span className="cph-eyebrow">Concept topology</span>
          <h2>Intellectual lineages</h2>
        </div>
      }
      footer={
        <>
          <span>Displaying 10 of 2,941 concepts</span>
          <CphButton variant="text">
            Open graph explorer <CphIcon name="arrow" size={15} />
          </CphButton>
        </>
      }
    >
      <div className="cph-graph-wrap">
        <CphKnowledgeGraph
          nodes={graphNodes}
          edges={graphEdges}
          label="Knowledge graph: intellectual lineages connecting Empiricism, Bacon, Rationalism, Enlightenment, Hume, Skepticism, Rousseau, Social Contract, Deism, and Kant"
        />
        <div className="cph-graph-annotation">
          <CphIcon name="spark" size={15} />
          <span>
            <strong>12 new links</strong> inferred this week
          </span>
        </div>
      </div>
      <div className="cph-legend">
        <span>
          <i className="cph-graph__dot cph-graph__dot--primary" aria-hidden="true" />
          Highlighted cluster
        </span>
        <span>
          <i className="cph-graph__dot" aria-hidden="true" />
          Adjacent concept
        </span>
      </div>
    </CphPanel>
  );
}

function TopicsPanel() {
  return (
    <CphPanel
      heading={
        <div>
          <span className="cph-eyebrow">Corpus composition</span>
          <h2>Dominant fields</h2>
        </div>
      }
    >
      <div className="cph-topic-list">
        {topics.map((t, i) => (
          <div key={t.name} className="cph-topic-row">
            <span aria-hidden="true" className="cph-topic-row__rank">
              0{i + 1}
            </span>
            <div className="cph-topic-row__body">
              <div>
                <strong>{t.name}</strong>
                <small>{t.count}</small>
              </div>
              <div className="cph-meter" aria-hidden="true">
                <i style={{ width: `${t.value}%` }} />
              </div>
            </div>
            <span className="cph-topic-row__value">{t.value}%</span>
          </div>
        ))}
      </div>
    </CphPanel>
  );
}

function InquiryPanel({ initialView = "cards" }: { initialView?: "cards" | "table" }) {
  const [view, setView] = useState<"cards" | "table">(initialView);
  return (
    <CphPanel
      className="cph-panel--full"
      heading={
        <div>
          <span className="cph-eyebrow">Active scholarship</span>
          <h2>Inquiry register</h2>
          <p className="cph-panel-sub">
            A working ledger of research moving from collection to publication.
          </p>
        </div>
      }
      footer={
        <>
          <span>Showing 4 of 17 active inquiries</span>
          <CphButton variant="text">
            View all inquiries <CphIcon name="arrow" size={13} />
          </CphButton>
        </>
      }
    >
      <div className="cph-view-switcher" role="group" aria-label="Choose inquiry layout">
        <CphButton variant="text" aria-pressed={view === "cards"} onPress={() => setView("cards")}>
          <CphIcon name="grid" size={16} />
          <span>Cards</span>
        </CphButton>
        <CphButton variant="text" aria-pressed={view === "table"} onPress={() => setView("table")}>
          <CphIcon name="list" size={16} />
          <span>Table</span>
        </CphButton>
      </div>
      {view === "cards" ? (
        <div className="cph-inquiry-grid">
          {rows.map((r, i) => (
            <CphCard
              key={r.id}
              id={r.id}
              title={r.inquiry}
              owner={r.owner}
              sources={r.sources}
              stageLabel={r.stageLabel}
              note={r.note}
              concepts={r.concepts}
              featured={i === 0}
            />
          ))}
        </div>
      ) : (
        <CphTable rows={rows} />
      )}
    </CphPanel>
  );
}

export function App() {
  const initial = readParams();
  return (
    <CphProvider defaultTheme={initial.theme} defaultDensity={initial.density}>
      <CphAppShell
        sidebar={{
          brand: { mark: "K", name: "Kepler", subtitle: "Knowledge Systems" },
          sectionTitle: "Workspace",
          navItems,
          note: {
            index: "Nº 04",
            quote: "Knowledge is a network, not a filing cabinet.",
            caption: "Current research principle",
          },
          profile: { initials: "AM", name: "Dr. Ada Mercer", role: "Research Fellow" },
          defaultSelectedId: "overview",
        }}
        bottomNav={{ items: navItems }}
        topBarLeading={<CphSearch onSubmit={() => {}} />}
        topBarActions={
          <>
            <span className="cph-sync" aria-live="polite">
              <i aria-hidden="true" />
              Index synced 4m ago
            </span>
            <CphDensityToggle />
            <CphThemeToggle />
            <CphButton variant="primary">
              <span className="cph-btn__full">New inquiry</span>
              <CphIcon name="arrow" size={16} />
            </CphButton>
          </>
        }
      >
        <PageHeading />
        <Signals />
        <div className="cph-dashboard-grid">
          <GraphPanel />
          <CphInsightPanel
            title="An emerging connection"
            brief="16 citations share vocabulary around order, utility, and observable cause."
            actionLabel="Examine 24 connections"
          >
            <p>
              References to <em>natural order</em> increasingly bridge your work on Enlightenment
              epistemology and early political economy.
            </p>
          </CphInsightPanel>
          <TopicsPanel />
          <InquiryPanel initialView={initial.view} />
        </div>
      </CphAppShell>
    </CphProvider>
  );
}
