import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

import { InitMenus } from "scripts/background/menus";
import { OnRuntimeMessage } from "scripts/background/messages";
import { OnNotificationClicked } from "scripts/background/notifications";
import { OnInstalled } from "scripts/background/runtime";
import { OnStorageChanged } from "scripts/background/storage";
import {
  InitPageActionEmulation,
  OpenOrShowURL,
  OnTabUpdate,
} from "scripts/background/tabs";

export default defineBackground({
  // MV3 uses a non-persistent service worker; `persistent` only applies to MV2
  persistent: import.meta.env.MANIFEST_VERSION === 2,
  main() {
    // Firefox (MV2) still has a real page action; Chrome/Edge (MV3) use the
    // action API, with per-tab enabling emulating the old page action behavior
    const pageAction = browser.pageAction ?? browser.action;

    browser.notifications.onClicked.addListener(OnNotificationClicked);
    pageAction.onClicked.addListener(() =>
      OpenOrShowURL(browser.runtime.getURL("manage.html")),
    );
    browser.runtime.onInstalled.addListener(OnInstalled);
    browser.runtime.onInstalled.addListener(InitPageActionEmulation);
    browser.runtime.onStartup.addListener(InitPageActionEmulation);
    browser.runtime.onMessage.addListener(OnRuntimeMessage);
    browser.storage.onChanged.addListener(OnStorageChanged);
    browser.tabs.onUpdated.addListener(OnTabUpdate);

    InitMenus();
  },
});
