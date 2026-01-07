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

### 3. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and Gemini API key:

1. Open `.env.local`
2. Replace `your-todoist-client-id` with your actual Client ID
3. Replace `your-todoist-client-secret` with your actual Client Secret
4. Replace `your-gemini-api-key-here` with your actual Gemini API key

Your `.env.local` should look like:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=2CUqotRdxwP2NCT896M6jJT2ht/Op7/Yh2vyXRv14EQ=
TODOIST_CLIENT_ID=abc123youractualclientid
TODOIST_CLIENT_SECRET=def456youractualsecret
GEMINI_API_KEY=AIzaSyYourActualGeminiKey
```

**Important**: The Gemini API key is now server-side only and won't be exposed in the browser.

### 5UTH_URL=http://localhost:3000
NEXTAUTH_SECRET=2CUqotRdxwP2NCT896M6jJT2ht/Op7/Yh2vyXRv14EQ=
TODOIST_CLIENT_ID=abc123youractualclientid
TODOIST_CLIENT_SECRET=def456youractualsecret
```

### 4. Run the Development Server

```bash
npm run dev
```6

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
- VeText extraction not working
- Verify your `GEMINI_API_KEY` is correct
- Check the browser console for error messages
- Make sure the image is clear and well-lit
- Ensure you have an active internet connection (Gemini API requires it)
- Try with printed text first (handwriting has lower accuracy)
- Make sure text is horizontal in the image

### Authentication issues
- Clear your browser cookies and try again
- Check that all environment variables are set correctly
- Restart the development server after changing `.env.local`

## Production Deployment

See the main [README.md](README.md) for detailed deployment instructions.
