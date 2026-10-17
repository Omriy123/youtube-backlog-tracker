# Mark videos watched when opened from the tracker

The normal action for opening a saved video opens it in a new tab, marks it watched, and removes it from the active list, while retaining history hidden from ordinary views. This deliberately trades certainty about actual viewing for the user's preferred workflow: they should not have to return to the tracker to confirm completion. Explicit watched and dismissed actions remain available, and the watched status must not be interpreted as verified playback completion.

The rule also applies to videos already marked unavailable and to bulk opening: successfully creating the browser tab counts as opening, without requiring successful video playback. Failure to create the tab leaves the video in its active list; a video that becomes available later can be queued again through the repeat-save review.

Q44 adds a review before normal opening for previously watched/dismissed videos saved again through a destination shortcut: show the warning and prior details, then resolve Dismiss or Leave here. The normal opening action must not bypass that pending rediscovery review; the exact interaction is specified in the feature design.

The [expanded capture contract](../specs/expanded-capture.md) applies that gate to both pending generic rediscoveries in Inbox and explicit-destination rediscoveries. Keep/Leave here alone does not open; destination review additionally offers explicit Leave here & open. A failed tab creation leaves the reviewed record active with review resolved; only successful tab creation creates the watched transition/event. Detailed bulk continuation remains owned by opening's focused design.
