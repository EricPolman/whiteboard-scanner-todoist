# Whiteboard Scanner - Project Specification

## Overview
A Next.js web application that allows users to photograph or upload whiteboard images, automatically extracts text lines using OCR, and creates corresponding tasks in a specified Todoist project.

## Core Features

### 1. Image Input
- Upload whiteboard images (JPEG, PNG, HEIC)
- Capture photos directly from device camera (mobile support)
- Support for multiple image formats and sizes
- Image preview before processing

### 2. Text Extraction
- OCR processing to detect and extract text from whiteboard images
- Line-by-line text recognition
- Handling of handwritten and printed text
- Text cleanup and formatting

### 3. Task Management
- Manual editing of extracted text before submission
- Checkbox interface to select/deselect individual lines
- Merge or split lines as needed
- Add due dates, priorities, or labels (optional)

### 4. Todoist Integration
- OAuth authentication with Todoist
- Project selection from user's Todoist account
- Bulk task creation API calls
- Error handling and retry logic

## Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Context or Zustand
- **Form Handling**: React Hook Form

### Backend/API
- **API Routes**: Next.js API routes
- **OCR Service**: One of the following:
  - Google Cloud Vision API
  - Azure Computer Vision API
  - AWS Textract
  - Tesseract.js (client-side, free)
- **Todoist API**: Todoist REST API v2
- **Authentication**: NextAuth.js for OAuth

### Storage & Deployment
- **Image Storage**: Temporary (processing only) or AWS S3/Vercel Blob
- **Environment Variables**: Vercel environment variables
- **Deployment**: Vercel

## Architecture

### User Flow
1. User lands on homepage
2. User authenticates with Todoist (if not already)
3. User uploads/captures whiteboard image
4. Image is processed via OCR API
5. Extracted text lines displayed in editable list
6. User reviews, edits, and selects lines
7. User selects target Todoist project
8. User clicks "Create Tasks"
9. Tasks created in Todoist
10. Success confirmation displayed

### API Endpoints

#### `/api/auth/[...nextauth]`
- Handle Todoist OAuth flow
- Manage session tokens

#### `/api/ocr`
- POST: Upload image and return extracted text
- Process image using OCR service
- Return structured array of text lines

#### `/api/todoist/projects`
- GET: Fetch user's Todoist projects
- Requires authentication

#### `/api/todoist/tasks`
- POST: Create multiple tasks in specified project
- Batch creation for efficiency

### Data Flow
```
Image Upload → OCR Processing → Text Extraction → 
User Review/Edit → Todoist API → Task Creation → Confirmation
```

## Key Requirements

### Functional Requirements
- FR1: User can upload or capture whiteboard images
- FR2: System extracts text lines from images with >80% accuracy
- FR3: User can edit extracted text before creating tasks
- FR4: User can authenticate with Todoist via OAuth
- FR5: User can select target Todoist project
- FR6: System creates individual tasks for each selected line
- FR7: User receives confirmation of successful task creation

### Non-Functional Requirements
- NFR1: OCR processing completes within 10 seconds for typical images
- NFR2: Support images up to 10MB in size
- NFR3: Mobile-responsive design
- NFR4: Secure handling of API credentials
- NFR5: Graceful error handling with user-friendly messages

## Security Considerations
- Secure storage of OAuth tokens (encrypted, httpOnly cookies)
- No permanent storage of uploaded images
- HTTPS only in production
- Rate limiting on API endpoints
- Input validation and sanitization

## OCR Service Selection

### Recommended: Tesseract.js (Phase 1)
**Pros:**
- Free and open-source
- Client-side processing (privacy-friendly)
- No API costs
- Good for printed text

**Cons:**
- Less accurate for handwritten text
- Slower processing
- Larger bundle size

### Alternative: Google Cloud Vision API (Phase 2)
**Pros:**
- Highly accurate
- Fast processing
- Excellent handwriting recognition
- Supports many languages

**Cons:**
- Costs money (free tier: 1,000 images/month)
- Requires GCP account
- Images sent to external service

## Todoist API Integration

### Authentication
- OAuth 2.0 flow
- Scopes required: `data:read_write`
- Store access token securely

### API Endpoints Used
- `GET /rest/v2/projects` - List projects
- `POST /rest/v2/tasks` - Create task
- Rate limit: ~450 requests per 15 minutes

### Task Creation
- Create tasks synchronously or in batch
- Handle failures gracefully
- Provide retry mechanism

## UI/UX Design

### Pages
1. **Home** (`/`): Landing page with upload/camera interface
2. **Review** (`/review`): Edit extracted text and select project
3. **Success** (`/success`): Confirmation page with links to Todoist

### Key UI Components
- Image upload/capture component
- Loading spinner during OCR processing
- Editable task list with checkboxes
- Project selector dropdown
- Error toast notifications
- Mobile-first responsive design

## Error Handling
- Network errors: Retry with exponential backoff
- OCR failures: Provide manual text input fallback
- Todoist API errors: Display error message and allow retry
- Authentication errors: Re-prompt for login

## Future Enhancements (Post-MVP)
- Support for multiple images in one session
- Automatic detection of bullet points, checkboxes, or numbered lists
- AI-powered text cleanup and formatting
- Due date extraction from text (e.g., "tomorrow", "next Monday")
- Priority detection (e.g., "urgent", "important")
- Label/tag suggestions based on text content
- History of previously scanned whiteboards
- Export to other task managers (Trello, Asana, etc.)
- Chrome extension version
- Mobile app (React Native)

## Success Metrics
- OCR accuracy rate
- Task creation success rate
- User completion rate (upload → task creation)
- Average processing time
- User retention

## Development Phases

### Phase 1: MVP (Weeks 1-2)
- Basic Next.js setup
- Image upload interface
- Tesseract.js OCR integration
- Simple text editing UI
- Todoist OAuth + task creation

### Phase 2: Enhancement (Weeks 3-4)
- Improved OCR (switch to Google Cloud Vision if needed)
- Better UI/UX
- Mobile optimization
- Error handling refinement

### Phase 3: Polish (Week 5)
- Performance optimization
- Testing and bug fixes
- Documentation
- Deployment
