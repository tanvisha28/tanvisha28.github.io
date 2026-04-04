/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearPendingHomeRestore, getHomeRestoreState, getProfileSlugFromHomePath, readPendingHomeRestore } from "../utils/homeScrollState";

export default function ScrollToTop() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    const homeProfileSlug = getProfileSlugFromHomePath(pathname);
    if (homeProfileSlug && !hash) {
      const explicitRestore = getHomeRestoreState(state);
      const pendingRestore = readPendingHomeRestore(homeProfileSlug);
      if (explicitRestore?.profileSlug === homeProfileSlug) {
        return;
      }

      if (pendingRestore?.profileSlug === homeProfileSlug) {
        return;
      }

      clearPendingHomeRestore(homeProfileSlug);
    }

    window.scrollTo(0, 0);
  }, [hash, pathname, state]);

  return null;
}
