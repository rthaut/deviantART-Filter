import { InitMenus } from "./background/menus";
import { OnRuntimeMessage } from "./background/messages";
import { OnNotificationClicked } from "./background/notifications";
import { OnInstalled } from "./background/runtime";
import { OnStorageChanged } from "./background/storage";
import { OpenOrShowURL, OnTabUpdate } from "./background/tabs";

browser.notifications.onClicked.addListener(OnNotificationClicked);
browser.pageAction.onClicked.addListener(async (tab) => {
  // TODO: make this configurable to either open the management page directly or show the popup app
  // TODO: could/should we "initialize" the behavior when the extension is loaded, and then use a storage change listener to "change" the behavior when that option changes? or should we just check the option every time the page action is clicked?

  browser.pageAction.setPopup({
    tabId: tab.id,
    popup: "pages/popup.html",
  });
  await browser.pageAction.openPopup();

  // await OpenOrShowURL(browser.runtime.getURL("pages/manage.html"))
});
browser.runtime.onInstalled.addListener(OnInstalled);
browser.runtime.onMessage.addListener(OnRuntimeMessage);
browser.storage.onChanged.addListener(OnStorageChanged);
browser.tabs.onUpdated.addListener(OnTabUpdate);

InitMenus();
