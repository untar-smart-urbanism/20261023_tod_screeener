import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import MapPage from "./pages/MapPage.jsx";
import Analysis from "./pages/Analysis.jsx";
import Sources from "./pages/Sources.jsx";
import Results from "./pages/Results.jsx";
import Sensitivity from "./pages/Sensitivity.jsx";
import Quality from "./pages/Quality.jsx";

// Simple hash-based navigation (#/map, #/analysis …) — no router dependency needed yet.
export const PAGES = [
  { path: "/", label: "Home", component: Home },
  { path: "/map", label: "Map", component: MapPage },
  { path: "/analysis", label: "Analysis", component: Analysis },
  { path: "/sources", label: "Sources", component: Sources },
  { path: "/quality", label: "Quality", component: Quality },
  { path: "/results", label: "Results", component: Results },
  { path: "/sensitivity", label: "Sensitivity", component: Sensitivity },
];

// "#/results?station=S1&radius=800" → path "/results", query "?station=S1&radius=800"
function currentHash() {
  const [path, query] = window.location.hash.replace(/^#/, "").split("?");
  return { path: path || "/", query: query ? `?${query}` : "" };
}

export default function App() {
  const [{ path, query }, setHash] = useState(currentHash());
  useEffect(() => {
    const onChange = () => setHash(currentHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const page = PAGES.find((p) => p.path === path) ?? PAGES[0];
  const Page = page.component;
  return (
    <Layout pages={PAGES} current={page.path} query={query}>
      <Page />
    </Layout>
  );
}
