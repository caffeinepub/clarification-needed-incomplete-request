# Castle Imperior

## Current State

The app is a luxury watch store with:
- A public storefront (hero, watch carousel, order modal, chat widget)
- An admin panel with Watches, Orders, and Messages tabs
- Admin access is gated via Internet Identity login (`isCallerAdmin` backend call)
- The "Admin Login" button in the navbar triggers Internet Identity login; after login, admins see an "Admin Panel" link
- The admin panel includes an "Add New Timepiece" form with name, description, price, image upload, and a publish toggle
- No dedicated "Owner Login" page or section exists -- access is purely via the navbar button

## Requested Changes (Diff)

### Add
- A clearly labeled "Owner Login" button or section in the navbar / a dedicated owner access area, so the owner knows exactly where to go to manage the store
- After login, if user is admin, show a prominent "Go to Admin Panel" / "Manage Store" call-to-action that leads directly to the admin panel and the watch upload form
- Improve discoverability: add a short instructional note in the admin panel header reminding the owner they can upload watch photos from the Watches tab

### Modify
- Rename the "Admin Login" button to "Owner Login" so it is clear this is the owner's entry point
- After the owner logs in, automatically show the Admin Panel section (currently the owner must click a separate "Admin Panel" link after login)
- Improve the "Add New Timepiece" form UX: add a helper text note near the image upload field clarifying accepted formats and suggesting good photo angles

### Remove
- Nothing to remove

## Implementation Plan

1. In `App.tsx` Navbar: rename "Admin Login" button label to "Owner Login" and "Logout" stays as is
2. In `App.tsx`: when `isAdmin` becomes true after login, automatically set `showAdmin` to true (so the panel opens without a second click)
3. In `App.tsx` Navbar: rename "Admin Panel" nav link label to "Manage Store"
4. In `AdminPanel.tsx`: add a small helper note near the "Add New Timepiece" form image upload area with accepted formats info
5. In `AdminPanel.tsx`: update the panel header subtitle from "Restricted Access" to "Owner Dashboard"

## UX Notes
- The owner (non-technical) needs a clear, obvious login path
- Auto-opening the admin panel after login removes friction
- "Owner Login" is more natural language than "Admin Login" for a store owner
