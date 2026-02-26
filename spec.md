# Castle Imperior

## Current State
New project -- no existing app. This is a fresh watch e-commerce website.

## Requested Changes (Diff)

### Add
- Watch showcase section: cards/boxes displaying each watch with photo, name, price, and left/right arrows to cycle through watch designs (carousel per card or a global carousel)
- Admin: ability to publish/upload watch photos with name and price
- Order flow: customers can click a watch and place an order (name, contact info, selected watch)
- Chat box: live-style chat widget where any visitor can send a text message or photo to the store owner; owner can view and reply
- Black and gold theme throughout (deep black backgrounds, gold accents, borders, buttons, text highlights)
- Site name: Castle Imperior with matching logo/branding

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: Watch catalog (CRUD -- admin adds watches with images via blob-storage), Orders (customers submit orders linked to a watch), Chat messages (visitors send text + optional photo, admin views all messages)
2. Frontend:
   - Landing/hero section with Castle Imperior branding (black & gold)
   - Watch carousel section: each watch displayed in a styled card with image, name, price; left/right arrows to navigate watches
   - Order modal: clicking a watch opens an order form (name, phone/email, watch info)
   - Admin panel (login-gated): upload watch photo, set name & price, publish/unpublish
   - Chat widget (bottom-right floating): open/close, send text or attach photo, displays conversation thread
   - Admin chat view: see all incoming messages with photos, reply
3. Authorization for admin access
4. Blob-storage for watch photos and chat photo attachments

## UX Notes
- Black (#0a0a0a) background, gold (#c9a84c / #d4af37) accents
- Watch cards: dark card with gold border, watch image prominent, name/price in gold, arrow buttons on left and right
- Chat widget: collapsible, dark themed, photo upload button inside input area
- Mobile-friendly layout
- Admin login via Internet Identity
