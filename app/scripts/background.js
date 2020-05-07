import { InitMenus } from './background/menus';
import { OnRuntimeMessage } from './background/messages';
import { OnNotificationClicked } from './background/notifications';
import { OnInstalled } from './background/runtime';
import { OnStorageChanged } from './background/storage';
import { OpenOrShowURL, OnTabUpdate } from './background/tabs';


browser.notifications.onClicked.addListener(OnNotificationClicked);
browser.pageAction.onClicked.addListener(() => OpenOrShowURL(browser.runtime.getURL('pages/manage.html')));
browser.runtime.onInstalled.addListener(OnInstalled);
browser.runtime.onMessage.addListener(OnRuntimeMessage);
browser.storage.onChanged.addListener(OnStorageChanged);
browser.tabs.onUpdated.addListener(OnTabUpdate);

InitMenus();
