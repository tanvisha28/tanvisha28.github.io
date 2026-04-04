/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import { AnimatePresence } from "motion/react";
import ScrollToTop from "./components/ScrollToTop";
import { SoundProvider } from "./audio/SoundProvider";
import { defaultProfileSlug, portfolioProfiles } from "./data/portfolioData";
import { getProfileHomePath, getProfileProjectPath } from "./utils/profileRoutes";

const routerBase = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

function RootRedirect() {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={{
        pathname: getProfileHomePath(defaultProfileSlug),
        search: location.search,
        hash: location.hash,
      }}
    />
  );
}

function LegacyProjectRedirect() {
  const location = useLocation();
  const { id } = useParams();
  const hasProject = Boolean(id && portfolioProfiles[defaultProfileSlug].projects.some((project) => project.id === id));

  return (
    <Navigate
      replace
      to={{
        pathname: hasProject && id ? getProfileProjectPath(defaultProfileSlug, id) : getProfileHomePath(defaultProfileSlug),
        search: location.search,
        hash: location.hash,
      }}
    />
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/project/:id" element={<LegacyProjectRedirect />} />
        <Route path="/:profileSlug" element={<Home />} />
        <Route path="/:profileSlug/project/:id" element={<ProjectDetail />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <Router basename={routerBase}>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </SoundProvider>
  );
}
