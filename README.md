# Whiteboard Scanner

A Next.js web application that scans whiteboard images and automatically creates tasks in Todoist using OCR technology.

## Features

- 📸 Upload or capture whiteboard photos
- 🤖 Automatic text extraction using OCR (Tesseract.js)
- ✏️ Edit and review extracted text before creating tasks
- ✅ Select which lines to convert into tasks
- 🎯 Create tasks in any Todoist project
- 🔐 Secure OAuth authentication with Todoist

## Prerequisites

- Node.js 18+ and npm
- A Todoist account
- Todoist OAuth credentials (Client ID and Secret)

## Setup Instructions

### 1. Clone and Install

```bash
cd whiteboard-scanner
npm install
```

### 2. Get Todoist OAuth Credentials

1. Go to [Todoist App Console](https://developer.todoist.com/appconsole.html)
2. Click "Create a new app"
3. Fill in the details:
   - **App name**: Whiteboard Scanner
   - **OAuth redirect URL**: `http://localhost:3000/api/auth/callback/todoist`
4. Save the app and copy your **Client ID** and **Client Secret**

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-generated-secret-here
   TODOIST_CLIENT_ID=your-todoist-client-id
   TODOIST_CLIENT_SECRET=your-todoist-client-secret
   ```

3. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `NEXTAUTH_SECRET`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign in with Todoist**: Click the "Sign in with Todoist" button
2. **Authorize the app**: Grant permissions to access your Todoist account
3. **Upload a whiteboard image**: Drag & drop or click to browse
4. **Review extracted text**: Edit, delete, or deselect any lines
5. **Select a project**: Choose which Todoist project to create tasks in
6. **Create tasks**: Click "Create Tasks" to add them to Todoist

## Project Structure

```
whiteboard-scanner/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth authentication
│   │   ├── ocr/                  # OCR processing endpoint
│   │   └── todoist/              # Todoist API integration
│   │       ├── projects/         # Fetch projects
│   │       └── tasks/            # Create tasks
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── ImageUpload.tsx           # Image upload/capture component
│   ├── TaskList.tsx              # Task list with editing
│   ├── ProjectSelector.tsx       # Todoist project selector
│   └── Providers.tsx             # Session provider
├── lib/
│   └── todoist.ts                # Todoist API client
├── types/
│   ├── index.ts                  # TypeScript types
│   └── next-auth.d.ts            # NextAuth type extensions
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Example environment variables
├── spec.md                       # Project specification
└── todolist.md                   # Development checklist
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **OCR**: Tesseract.js
- **Icons**: Lucide React
- **API**: Todoist REST API v2

## API Endpoints

### `/api/auth/[...nextauth]`
Handles Todoist OAuth authentication flow

### `/api/ocr` (POST)
Processes uploaded images and extracts text
- **Input**: `multipart/form-data` with `image` field
- **Output**: Array of extracted text lines with confidence scores

### `/api/todoist/projects` (GET)
Fetches user's Todoist projects
- **Auth**: Required
- **Output**: Array of Todoist projects

### `/api/todoist/tasks` (POST)
Creates multiple tasks in a Todoist project
- **Auth**: Required
- **Input**: `{ tasks: Task[], projectId: string }`
- **Output**: Success status and created task count

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Update Todoist OAuth redirect URL to your production domain:
   ```
   https://your-domain.vercel.app/api/auth/callback/todoist
   ```
5. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project:
- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: A secure random string
- `TODOIST_CLIENT_ID`: Your Todoist app client ID
- `TODOIST_CLIENT_SECRET`: Your Todoist app client secret

## Troubleshooting

### OCR Not Working
- Make sure the image is clear and well-lit
- Try a higher resolution image
- Ensure text is horizontal and readable
- Tesseract works best with printed text (handwriting may have lower accuracy)

### Authentication Issues
- Verify your Todoist OAuth credentials are correct
- Check that the redirect URL matches exactly (including http/https)
- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Tasks Not Creating
- Verify you're signed in to Todoist
- Check that you've selected a project
- Ensure at least one task is selected
- Check browser console for error messages

## Future Enhancements

- Switch to Google Cloud Vision API for better OCR accuracy
- Support for multiple images in one session
- Due date extraction from text
- Priority and label detection
- History of scanned whiteboards
- Mobile app version

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
