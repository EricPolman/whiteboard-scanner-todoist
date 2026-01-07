# Setup Guide

## Quick Start

Follow these steps to get the Whiteboard Scanner running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Todoist OAuth

1. Visit [Todoist App Console](https://developer.todoist.com/appconsole.html)
2. Click "Create a new app"
3. Fill in:
   - **App name**: Whiteboard Scanner (or your preferred name)
   - **OAuth redirect URL**: `http://localhost:3000/api/auth/callback/todoist`
4. Save and copy your Client ID and Client Secret

### 3. Configure Environment Variables

The `.env.local` file has already been created with a generated secret. You just need to add your Todoist credentials:

1. Open `.env.local`
2. Replace `your-todoist-client-id` with your actual Client ID
3. Replace `your-todoist-client-secret` with your actual Client Secret

Your `.env.local` should look like:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=2CUqotRdxwP2NCT896M6jJT2ht/Op7/Yh2vyXRv14EQ=
TODOIST_CLIENT_ID=abc123youractualclientid
TODOIST_CLIENT_SECRET=def456youractualsecret
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

## Testing the App

1. Click "Sign in with Todoist"
2. Authorize the application
3. Upload a test whiteboard image (you can use any image with text)
4. Review the extracted text
5. Select a Todoist project
6. Create tasks

## Troubleshooting

### "Failed to fetch projects" error
- Make sure you've correctly set `TODOIST_CLIENT_ID` and `TODOIST_CLIENT_SECRET`
- Verify the OAuth redirect URL in Todoist matches exactly: `http://localhost:3000/api/auth/callback/todoist`

### OCR not detecting text
- Ensure the image is clear and well-lit
- Try with printed text first (handwriting has lower accuracy)
- Make sure text is horizontal in the image

### Authentication issues
- Clear your browser cookies and try again
- Check that all environment variables are set correctly
- Restart the development server after changing `.env.local`

## Production Deployment

See the main [README.md](README.md) for detailed deployment instructions.
