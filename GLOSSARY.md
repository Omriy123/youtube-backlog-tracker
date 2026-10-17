# Video Backlog Tracking

A personal video collection for keeping up with saved videos and deciding what to watch next.

## Language

**Library**:
The entire collection of saved videos, across Inbox, Backlog, watch lists, and retained history. It is the container for the collection, not a destination list of its own.
_Avoid_: Backlog when referring to the entire collection

**Entire Library view**:
A browsing view of active videos across Inbox, Backlog, and watch lists. Retained watched and dismissed records remain available through History.
_Avoid_: All active as the visible name of this view

**Inbox**:
The list of videos awaiting a placement or rediscovery decision, normally newly saved videos. A previously sorted video may return through Undo, an explicit move when its custom list is deleted, or a generic repeat save with a pending review when it was watched or dismissed.
_Avoid_: Unsorted

**Backlog**:
The generic list of reviewed videos deliberately saved for later, without selecting a watch-soon list.
_Avoid_: Inbox, Library

**Watch list**:
A list of videos the user intends to watch soon. Membership expresses viewing intent, not whether playback has started.
_Avoid_: Currently watching when it implies playback progress

**List importance order**:
The user-defined ranking of watch lists from more important to less important. It is separate from temporary sorting of lists by properties such as video count.
_Avoid_: Priority score, video priority

**Manual video order**:
The saved arrangement of videos within a list, initially following release-date order until manually rearranged, or preserving source order for a newly imported list. Viewing another sort order does not replace the saved arrangement.

**Temporary filtered order**:
An arrangement of videos that applies only to their filtered view. It leaves the saved Manual video order unchanged and ends when the filter is cleared.

**First saved date**:
The date a video was first added to the Library, regardless of its later list moves or repeat watches.
_Avoid_: Upload date when referring to saving into the extension

**Personal title**:
A title deliberately given to a saved video by the user, distinct from the title supplied by its page or provider.
_Avoid_: Provider title, fetched title

**First Inbox-exit date**:
The date a video first completed its initial placement decision, either by leaving Inbox or by being saved directly into Backlog or a watch list. Later list moves do not replace this date.

**Latest list-entry date**:
The date of the video's most recent entry into a list.

**Channel view**:
A view of saved videos grouped or filtered by their channel, within one list or across the Library. It does not give a video another list membership.

**Watched**:
A video marked as handled for viewing, normally by opening it from the tracker or explicitly marking it watched. This status does not establish that playback occurred or finished.
_Avoid_: Playback completed

**Dismissed**:
A video the user has decided not to watch. Dismissed videos are retained but hidden from active lists by default.

**Pending rediscovery review**:
An unresolved decision about a saved video's previous watched or dismissed activity. The video remains in Inbox after a generic repeat save, or in its explicitly chosen destination, until the user confirms keeping it there or dismisses it.

**History**:
A record of changes in the Library, including videos' previous destinations and when they were moved, removed, or marked watched or dismissed.

**Library snapshot**:
A saved copy of the Library's state at a particular time, including its videos, lists, arrangements, and history. Snapshots may be saved automatically or deliberately by the user.
_Avoid_: Watch event, open-tab session

**Library restoration**:
Returning the Library's user-controlled organization, status, history, and authored values to a retained point or snapshot, reversing later user changes together. Automatic metadata remains at its latest valid values or missing, rather than returning stale provider responses.

**Selective recovery**:
Reversing one recorded Library action while preserving unrelated later user decisions. A batch is recovered as one action, and conflicting later decisions must be resolved before reversal.

**Library backup**:
A portable copy of the Library and its retained recovery information, saved outside extension storage for later restoration. Automatic backups preserve separate versions; restoration is deliberate.
_Avoid_: Sync when referring to restoring a saved backup version

**Watch event**:
An occasion when a video was marked watched, through opening it from the tracker or an explicit action. A video may have multiple watch events when watched again.

**Possible duplicate**:
A different upload whose metadata suggests it may repeat an existing video's content. It is a suggestion for user review, not a confirmed match or an automatic merge.

**Exact duplicate**:
Another reference to the same underlying upload as a video already in the Library. It represents the existing video, not a second saved record or another active list membership.
_Avoid_: Possible duplicate, reupload
