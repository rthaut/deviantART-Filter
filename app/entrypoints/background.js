import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

import { InitMenus } from "scripts/background/menus";
import { OnRuntimeMessage } from "scripts/background/messages";
import { OnNotificationClicked } from "scripts/background/notifications";
import { OnInstalled } from "scripts/background/runtime";
import { OnStorageChanged } from "scripts/background/storage";
import { OpenOrShowURL, OnTabUpdate } from "scripts/background/tabs";

export default defineBackground({
  persistent: true,
  main() {
    browser.notifications.onClicked.addListener(OnNotificationClicked);
    browser.pageAction.onClicked.addListener(() =>
      OpenOrShowURL(browser.runtime.getURL("manage.html")),
    );
    browser.runtime.onInstalled.addListener(OnInstalled);
    browser.runtime.onMessage.addListener(OnRuntimeMessage);
    browser.storage.onChanged.addListener(OnStorageChanged);
    browser.tabs.onUpdated.addListener(OnTabUpdate);

    InitMenus();
  },
});
