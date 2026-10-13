# Video Backlog Tracking

A personal video collection for keeping up with saved videos and deciding what to watch next.

## Language

**Library**:
The entire collection of saved videos, across Inbox, Backlog, watch lists, and retained history. It is the container for the collection, not a destination list of its own.
_Avoid_: Backlog when referring to the entire collection

**Inbox**:
The list of videos awaiting a placement decision, normally newly saved videos. Previously sorted videos may return through Undo or an explicit move when their custom list is deleted, but not through ordinary moves or repeat saves.
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
The saved arrangement of videos within a list, following release-date order until the user manually rearranges it. Viewing another sort order does not replace the saved arrangement.

**First saved date**:
The date a video was first added to the Library, regardless of its later list moves or repeat watches.
_Avoid_: Upload date when referring to saving into the extension

**First Inbox-exit date**:
The date a video first left Inbox. Later list moves do not replace this date.

**Latest list-entry date**:
The date of the video's most recent entry into a list.

**Channel view**:
A view of saved videos grouped or filtered by their channel, within one list or across the Library. It does not give a video another list membership.

**Watched**:
A video marked as handled for viewing, normally by opening it from the tracker or explicitly marking it watched. This status does not establish that playback occurred or finished.
_Avoid_: Playback completed

**Dismissed**:
A video the user has decided not to watch. Dismissed videos are retained but hidden from active lists by default.

**History**:
A record of changes to a saved video, including its previous list and when it was moved, removed, or marked watched or dismissed.

**Watch event**:
An occasion when a video was marked watched, through opening it from the tracker or an explicit action. A video may have multiple watch events when watched again.

**Possible duplicate**:
A different upload whose metadata suggests it may repeat an existing video's content. It is a suggestion for user review, not a confirmed match or an automatic merge.
