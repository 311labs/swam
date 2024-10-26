# SWAMCORE

## v0.2.61 - October 26, 2024

 * added: new image previewer with zoom and rotate


## v0.2.60 - October 26, 2024

 * improved: pdf previewer with rotation and ability to download


## v0.2.59 - October 26, 2024

 * added: new pdf preview plugin


## v0.2.58 - October 23, 2024

 * added: visibility into taskqueues to see workers and channels


## v0.2.57 - October 15, 2024

 * added: support for bundling incidents by group


## v0.2.56 - October 14, 2024

 * updated: model view updated to show pretty json if value is dict or list


## v0.2.55 - September 26, 2024

 * fixed: when saving new model, save all changes


## v0.2.54 - September 13, 2024

 * cleanup: chat better support for media 
 * cleanup: model state dialog view rendering


## v0.2.53 - September 12, 2024

 * added: new model dialog header with state and context menus


## v0.2.52 - September 12, 2024

 * updated: medialib shows the owner of the media item


## v0.2.51 - September 11, 2024

 * added: ability to show/hide columns


## v0.2.50 - September 11, 2024

 * fixed: bug where in live charts the x axis labels did not always update


## v0.2.49 - September 10, 2024

 * added: dialog helper to get model
 * removed: debug logs for tooltips


## v0.2.48 - September 09, 2024

 * added: chat type for email


## v0.2.47 - September 08, 2024

 * hotfix: tooltip removal causes error


## v0.2.46 - September 08, 2024

 * remvoed: logging from tooltip bug


## v0.2.45 - September 08, 2024

 * fixed: bug where tooltips can linger forever


## v0.2.44 - September 08, 2024

  * changed: access requests now look for tickets
  * fixed: bug in table filter bar not rerendering corrrectly


## v0.2.42 - September 05, 2024

 * fixed: dialog media picker error during upload
 * fixed: filterbars that are empty cause errors


## v0.2.41 - September 05, 2024

 * updated: filter logs by new timerange filter


## v0.2.40 - September 04, 2024

 * removed: filters completely from swamlite


## v0.2.39 - September 04, 2024

 * cleanup: removed new extensions from swam_lite


## v0.2.38 - September 04, 2024

 * hotfix: for terminals


## v0.2.37 - September 04, 2024

 * added: timerange picker with filter support
 * cleanup: abstracted out daterange and timerange from filters and made filters easier to extend


## v0.2.36 - September 04, 2024

 * fixed: bug when passing models to collection constructor
 * fixed: bug when adding table filter buttons not always working


## v0.2.35 - September 03, 2024

 * hotfix: website topbar broken


## v0.2.34 - August 30, 2024

 * added: redis connection monitoring
 * added: view abuse ip info


## v0.2.33 - August 27, 2024

 * added: form builder input add_classes option


## v0.2.32 - August 27, 2024

 * added: callback on when tablepage creates a model, for setup of defaults


## v0.2.31 - August 26, 2024

 * fixed: double event for when dialog closes via bg


## v0.2.30 - August 25, 2024

 * added: log datetime filtering


## v0.2.29 - August 25, 2024

 * added: time pickers


## v0.2.28 - August 25, 2024

 * fixed: log view bug when specifying component field


## v0.2.26 - August 22, 2024

 * added: map view now has support for zooming and detailed markers
 * added: searchdown can now clear and supports event searchdown:clear


## v0.2.25 - August 16, 2024

 * fixed: taskqueue filtering of scheduled was broken
 * added: taskqueue header now includes scheduled and failed
 * added: saving of default_portal when a user is invited


## v0.2.24 - August 14, 2024

 * fixed: bug in topbar.user_menu not updating after user fetch


## v0.2.23 - August 14, 2024

 * fixed: bug where if the user doesn't have permission to active group nothing works


## v0.2.22 - August 14, 2024

 * added: user menu now support permissions
 * fixed: wiki dialog no longer defautls has wiki button


## v0.2.21 - August 14, 2024

 * added: ability to enable/disable showing of left panel
 


## v0.2.20 - August 14, 2024

 * added: dismiss_on_submit for edit model dialogs, auto dismisses dialog instead of waiting for save
 * updated: medialib to use dismiss_on_submit so user can continue using portal while uploading


## v0.2.18 - August 14, 2024

 * hotfix: attributes was sticking to the class level instead of instance if assigned direct
 * wikimedia: fixed incorrect assigning via attributes vs set


## v0.2.17 - August 14, 2024

 * added: wiki media now support upload direct to s3
 * fixed: invalid url for none media links


## v0.2.16 - August 13, 2024

 * added new progressview
 * updated: toast now lets you set message to swamview
 * updated: medialib now support large file uploads direct to s3
 * updated: rest.upload now support progress


## v0.2.15 - August 13, 2024

 * updated: "Localize.icon ignores null icons"


## v0.2.15 - August 12, 2024

 * fixed: input button overlays now opaque
 * updated: wiki system to support proper permissions


## v0.2.15 - August 12, 2024

 * fixed: input button overlays now opaque
 * updated: wiki system to support proper permissions



## v0.2.15

 * ADDED: Charts can now show popup table of data
 * FIXED: Collection local download not handling currency commas


## v0.2.14

 * Improved: Wiki system more robust
 * Added: Now more abstract to add wiki support to portal
 * Added: Audit Log default datetime param

## v0.2.12

 * NEW: Wiki sub system
 * NEW: SideBar support for dynamic menus from a collection
 * NEW: Wiki Image insert support

## v0.2.11

 * FIXED: bug when clearing param it still is in filters
 * ADDED: taskqueue now shows list of workers and queue stats
 * ADDED: refresh button in task queue
 * FIXED: taskqueue barchart getting squashed
 * ADDED: ability to set chart height
 * ADDED: Cloud Watch: Firewall events
 * ADDED: List all servers, versions
 * ADDED: Domain watcher, lists domains in system and ssl cert expires
 
 
