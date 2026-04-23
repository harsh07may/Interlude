# Journal Digitization App — Design Specification
**Date:** April 24, 2026  
**Phase:** 1 (MVP)  
**Status:** Design Approved

---

## Executive Summary

A web app (PWA) that enables users to digitize handwritten interstitial journal pages by photographing them. The app extracts timestamps and text using OCR, displays results in a journal-style layout, and allows users to copy the digitized content. Phase 1 focuses on capture and extraction only; organization, search, and export are deferred to Phase 2+.

**Target Users:** Both new practitioners and existing interstitial journalists (personal use only).

---

## Core Features (Phase 1 MVP)

### 1. Capture & Digitization
- Users can upload images or use device camera to capture journal pages
- Supports JPG, PNG, and PDF formats
- Single page per upload (pages can contain multiple timestamped entries)

### 2. OCR Extraction
- Extract timestamps and raw text from journal pages
- Minimal structure: no parsing of journal entry sections
- OCR method is configurable (see Settings below)

### 3. Results Display
- Results presented in journal-style layout:
  - Date header at top
  - Timestamps (left-aligned, bold, monospace)
  - Vertical line separator
  - Text (right-aligned, readable spacing)
- Matches the visual aesthetic of handwritten journals
- User can copy all results to clipboard

### 4. OCR Configuration (Settings)
- Users choose their OCR processing method:
  - **Client-Side (Default):** PaddleOCR running in browser
  - **Backend API:** Custom endpoint (local GPU machine or cloud service)
- Selected method is persistent (stored in localStorage)
- Backend API configuration: URL input + test button
- No authentication required for Phase 1

---

## User Workflow

### Main Dashboard
- Clean, minimal interface
- Single call-to-action button: "Digitize Journal Page"
- Settings icon (top-right) for OCR configuration
- No history or dashboard display in Phase 1

### Modal Workflow (Digitize Journal Page)
1. User clicks "Digitize Journal Page" → Modal opens
2. Upload area displayed:
   - Drag-and-drop zone (primary)
   - Camera button (mobile-optimized)
   - File input fallback
3. User uploads/captures image
4. OCR processes (loading state shown)
5. Results display in journal-style layout
6. User can:
   - Copy results to clipboard
   - Click "Scan Another Page" (stays in modal for batch capture)
   - Close modal to return to dashboard
7. No persistent storage; user manually saves results (Phase 2 adds this)

### Settings Modal
- Radio button selection: Client-Side vs Backend API
- Backend API URL input field
- Test button to verify backend connection
- Clear labels and help text

---

## Technical Architecture

### OCR Processing Strategy
**Primary Method (Default):** Client-side PaddleOCR
- Runs entirely in browser via JavaScript
- Fast, private, suitable for PWA
- Good accuracy for legible handwriting
- No server required

**Secondary Method (Optional):** Backend API
- User configures custom endpoint
- Sends image to backend; receives extracted text
- Use case: higher accuracy (GPU-accelerated OCR) or cloud API (Google Vision, etc.)
- Backend choice is user-selected, not automatic fallback

### Data Flow
1. Image upload/capture → stored in memory
2. Check user's OCR configuration setting
3. Route to selected processor:
   - Client-side: Process with PaddleOCR
   - Backend: POST image to user's API endpoint
4. OCR returns extracted text + confidence scores
5. Parser converts output to structured format:
   ```typescript
   {
     date: "9th June '26, Monday",
     entries: [
       { timestamp: "10:04", text: "Going to finish..." },
       { timestamp: "10:46", text: "I fell into..." }
     ]
   }
   ```
6. Display in results modal

### Error Handling
- **OCR Failure:** "Could not extract text. Try another image."
- **Unsupported Format:** "Please upload JPG, PNG, or PDF."
- **Backend API Unreachable:** "Cannot connect to OCR backend. Check your settings."
- **Large File:** "Image is too large. Please use a smaller file."
- User can retry or cancel

---

## UI/UX Design

### Design Philosophy
- **Minimal, focused:** One task per screen
- **Journal-inspired:** Results mimic handwritten journal aesthetic
- **Clean typography:** Monospace for timestamps, readable serif/sans-serif for body text
- **Light, spacious:** Whitespace reduces cognitive load
- **No unnecessary clutter:** Only display what's needed

### Components & Layout

#### Dashboard
- Header: App title ("Journal Digitizer" or similar)
- Settings icon (top-right corner)
- Center: Large "Digitize Journal Page" button
- Clean whitespace, light background

#### Modal: Upload Area
- Large drag-and-drop zone with visual feedback (dashed border, highlight on hover)
- Camera button (mobile devices)
- "Or click to select file" fallback text
- Clear instructions

#### Modal: Results Display
- Date header (extracted from OCR or manual input in Phase 2)
- Entries formatted as:
  ```
  [timestamp] | [text content]
  [timestamp] | [text content]
  ```
- Vertical line separator visual element
- Copy button (copies all results)
- "Scan Another Page" button to stay in modal
- "Done" button to close and return to dashboard

#### Settings Modal
- Title: "OCR Settings"
- Radio button group: "Client-Side (Faster, Less Accurate)" vs "Backend API (Custom)"
- Conditional fields:
  - If Backend API selected: URL input + test button
  - Test button: "Verify Connection" → shows success/failure
- Save/Cancel buttons
- Help text explaining each option

### Responsive Behavior
- **Desktop:** Two-column layouts where applicable (upload on left, results on right)
- **Mobile:** Full-width, single column, stacked elements
- **Touch Targets:** Minimum 44px for all buttons and interactive elements
- **Modal:** Takes full screen on mobile, centered on desktop

### Styling Approach
- **Production-ready code from day one**
- Plain CSS or minimal Tailwind (keep it simple)
- Focus on usability and clarity, not visual polish
- Accessible color contrast (WCAG AA minimum)
- Responsive typography (scales for mobile/desktop)

---

## Component Structure

```
src/
├── App.tsx                    # Main app wrapper
├── components/
│   ├── Dashboard.tsx          # Main screen with "Digitize" button
│   ├── DigitizeModal.tsx      # Modal container
│   ├── UploadArea.tsx         # Drag-drop + camera/file input
│   ├── OCRProcessor.tsx       # OCR logic routing
│   ├── ResultsDisplay.tsx     # Journal-style results layout
│   └── SettingsModal.tsx      # OCR configuration
├── hooks/
│   ├── useOCRConfig.ts        # OCR settings management (localStorage)
│   └── useImageUpload.ts      # Image capture/upload handling
├── lib/
│   ├── paddleocr.ts           # PaddleOCR client integration
│   ├── ocrParser.ts           # Parse OCR output → structured format
│   └── utils.ts               # Helpers (formatting, validation)
└── types/
    └── index.ts               # TypeScript interfaces & types
```

### Key Dependencies (TBD in Implementation)
- PaddleOCR.js or alternative client-side OCR library
- React 19 (already available in Interlude)
- TypeScript 6.0
- No heavy state management (React hooks sufficient)

---

## Architecture Principles

### Production-Ready from Day One
- Solid error handling (no silent failures)
- Clean, documented code (no shortcuts)
- Type-safe with TypeScript strict mode
- Accessible UI (WCAG AA baseline)

### Flexible, Not Over-Engineered
- Simple component structure (easy to extend)
- Modular hooks for reusable logic
- Settings abstraction allows easy backend swaps in future
- No premature optimization or unnecessary abstraction

### PWA-First Design
- Works offline (after initial load)
- Camera integration for mobile capture
- Responsive, touch-friendly UI
- Fast, no heavy external dependencies

---

## Out of Scope (Phase 1)

- Dashboard/history of scanned pages
- Persistent storage of results
- Search and organize features
- Export to external tools (Notion, Obsidian, etc.)
- User authentication or accounts
- Batch processing UI (upload multiple files at once)
- Edit/refine OCR results inline
- Sharing or collaboration features

### Phase 2+ Features
See `docs/future-features.md` for detailed roadmap:
- Review & Edit (fix OCR errors)
- Organize & Search (group by date, filter, search)
- Export (text, JSON, PDF, integrations)

---

## Success Criteria

**Phase 1 is successful when:**
1. ✅ User can upload/capture a journal page
2. ✅ OCR extracts timestamps and text with acceptable accuracy
3. ✅ Results display in journal-style layout
4. ✅ User can copy results to clipboard
5. ✅ Settings allow toggling between client-side and backend OCR
6. ✅ App works responsively on mobile and desktop
7. ✅ Code is production-ready (error handling, types, clean structure)

---

## Implementation Notes

### OCR Library Selection (TBD)
- Primary candidate: PaddleOCR.js (lightweight, works client-side)
- Alternatives: Tesseract.js, EasyOCR.js
- Selection depends on accuracy vs bundle size tradeoff

### Backend API Specification (TBD)
- Users provide custom endpoint URL
- Expected input: multipart/form-data with image file
- Expected output: JSON with extracted text
- No specific backend required; users responsible for their own

### Testing Strategy (TBD)
- Unit tests for OCR parser logic
- Integration tests for modal workflow
- Manual testing on mobile/desktop
- No E2E testing required for Phase 1

---

## Future Considerations

- **Analytics:** Track which OCR method users prefer, success rates
- **Performance:** Monitor bundle size as features are added
- **Accessibility:** Expand beyond WCAG AA as needed
- **Mobile App:** Consider native iOS/Android apps (PWA is Phase 1)
- **Monetization:** Ad-free, optional "pro" backend features in future

---

## Document History

| Date | Status | Notes |
|------|--------|-------|
| 2026-04-24 | Approved | Design spec finalized after brainstorming session |

