/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { clearPendingHomeRestore, getHomeRestoreState, getProfileSlugFromHomePath, readPendingHomeRestore } from "../utils/homeScrollState";

export default function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const homeProfileSlug = getProfileSlugFromHomePath(pathname);
    if (homeProfileSlug && !hash) {
      const explicitRestore = getHomeRestoreState(state);
      if (explicitRestore?.profileSlug === homeProfileSlug) {
        return;
      }

      if (navigationType === "POP" && readPendingHomeRestore(homeProfileSlug)) {
        return;
      }

      clearPendingHomeRestore(homeProfileSlug);
    }

    window.scrollTo(0, 0);
  }, [hash, navigationType, pathname, state]);

  return null;
}
