## Next

## 6.11.0 <span className="changelog-date">(2020-05-17)</span>

* Added the Organizer page, which lets you see all your items in a table form, which you can sort and filter (try shift-clicking on a cell!). Add and remove columns and bulk-tag your items to help quickly figure out which items you want to keep and which you can get rid of.
* Fixed stat calculations for special Taken King class items in D1.

## 6.10.0 <span className="changelog-date">(2020-05-10)</span>

## 6.9.0 <span className="changelog-date">(2020-05-03)</span>

* In the Loadout Optimizer, mods have been split into their own menu, separate from perks.
* Fixed a bug where wishlists would ignore settings and load the default wishlist instead.

## 6.8.0 <span className="changelog-date">(2020-04-26)</span>

* Added "armor 2.0" column to spreadsheet exports.
* Fixed a bug that could affect the display of percentage-based objectives.

## 6.7.0 <span className="changelog-date">(2020-04-19)</span>

* Emblems now show a preview of their equipped stat tracker, and show which types of stat tracker the emblem can use.
* Certain stat trackers (under "Metrics" in "Collections") had the wrong display value, like KDA. These have been fixed.
* Loadout Optimizer now allows you to select seasonal mods independent of the gear they go on - it'll try to slot them into any gear.

## 6.6.0 <span className="changelog-date">(2020-04-12)</span>

* Better handling of logging out and into a different Bungie.net account.
* Improved error handling for Bungie.net and DIM Sync issues.

## 6.5.0 <span className="changelog-date">(2020-04-10)</span>

* Improved overall performance and memory usage of DIM - as the game grows, so has DIM's memory usage. If your browser was crashing before, give it a try now.
* Collectibles now show perks.

## 6.4.0 <span className="changelog-date">(2020-04-05)</span>

* Added stat trackers to the Collections page (under "Metrics")
* Improved error handling when Bungie.net is down or something is wrong with your account. Includes helpful tips for D1 users locked out by Twitch-linking bug. If your D1 accounts disappeared, they're in the menu now.
* Accounts in the menu are now always ordered by last-played date.
* DIM will no longer bounce you to a different account if the one you wanted cannot be loaded.
* Fixed some bugs that could cause D1 pages to not display.
* Fix display of collectibles that are tied to one of your alternate characters.
* Fix the levels that reward Bright Engrams after season rank 100.

## 6.3.1 <span className="changelog-date">(2020-03-29)</span>

* Fixed a bug where D1 items could fail to display.
* Fixed a bug where responding "Not now" to the DIM Sync prompt wouldn't cause it to go away forever.
* Make mod slot for Reverie Dawn armor set detect correctly as outlaw.

## 6.3.0 <span className="changelog-date">(2020-03-29)</span>

* Removed duplicate Mods section from the top level of the Collections screen - they're still under the normal collections tree.
* Fixed a missing icon when season rank is over 100.

## 6.2.0 <span className="changelog-date">(2020-03-22)</span>

## 6.1.1 <span className="changelog-date">(2020-03-22)</span>

## 6.1.0 <span className="changelog-date">(2020-03-22)</span>

* Introducing [DIM Sync](https://github.com/DestinyItemManager/DIM/wiki/DIM-Sync-(new-storage-for-tags,-loadouts,-and-settings)), a brand new way for DIM to store your loadouts and tags and sync them between all your devices. This is a big step forward that'll let us build lots of new things and share data between other apps and websites! Plus, you no longer have to log into anything separate, and we should avoid some of the bugs that have in the past led to lost data.
* External wish lists will be checked daily. Settings menu shows last fetched time.
* Seasonal Artifact is no longer considered a weapon or a dupe when searching.
* Event sources for items like Festival of the Lost and Revelry are now under the `source:` search like other sources, instead of `event:`.
* Fixed some recent bugs that prevented editing loadouts.
* Show how much of each material you have next to Spider's vendor info.
* Updated privacy policy with DIM Sync info.
