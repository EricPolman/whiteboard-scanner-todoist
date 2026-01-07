# Deployment Checklist

Use this checklist when deploying the Whiteboard Scanner to production.

## Pre-Deployment

- [ ] Test the application locally
- [ ] Verify OCR works with various test images
- [ ] Test Todoist authentication flow
- [ ] Test task creation with different projects
- [ ] Check all error handling scenarios
- [ ] Review and test mobile responsiveness
- [ ] Run `npm run build` successfully
- [ ] Check for TypeScript errors: `npm run type-check` or review build output

## Todoist App Configuration

- [ ] Create/update Todoist OAuth app at [Todoist App Console](https://developer.todoist.com/appconsole.html)
- [ ] Add production OAuth redirect URL: `https://your-domain.vercel.app/api/auth/callback/todoist`
- [ ] Note down Client ID and Client Secret for production

## Vercel Setup

### Initial Deployment

- [ ] Push code to GitHub repository
- [ ] Import project in Vercel
- [ ] Connect GitHub repository

### Environment Variables

Set these in Vercel project settings → Environment Variables:

- [ ] `NEXTAUTH_URL` = `https://your-domain.vercel.app`
- [ ] `NEXTAUTH_SECRET` = Generate new secret with `openssl rand -base64 32`
- [ ] `TODOIST_CLIENT_ID` = Your production Todoist client ID
- [ ] `TODOIST_CLIENT_SECRET` = Your production Todoist client secret

**Important**: Use different credentials for production than development!

### Deploy

- [ ] Deploy to production
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

## Post-Deployment Testing

- [ ] Visit production URL
- [ ] Test Todoist sign-in flow
- [ ] Upload a test whiteboard image
- [ ] Verify OCR extraction works
- [ ] Create test tasks in Todoist
- [ ] Verify tasks appear in Todoist
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Check error handling (network errors, invalid images, etc.)

## Security Checklist

- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Environment variables are set in Vercel (not committed to git)
- [ ] `.env.local` is in `.gitignore`
- [ ] OAuth redirect URL uses HTTPS in production
- [ ] NextAuth secret is strong and unique for production

## Optional Enhancements

- [ ] Set up custom domain in Vercel
- [ ] Configure analytics (Vercel Analytics, Google Analytics, etc.)
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Add favicon and app icons
- [ ] Create OG image for social sharing
- [ ] Set up Vercel preview deployments for branches

## Monitoring

After deployment, monitor:

- [ ] Error logs in Vercel dashboard
- [ ] User feedback
- [ ] OCR accuracy
- [ ] Task creation success rate
- [ ] Authentication issues

## Rollback Plan

If issues occur:

1. Check Vercel deployment logs
2. Revert to previous deployment in Vercel dashboard
3. Fix issues locally
4. Test thoroughly
5. Redeploy

## Updates and Maintenance

- [ ] Document any production issues
- [ ] Keep dependencies updated
- [ ] Monitor Todoist API changes
- [ ] Update documentation as needed
- [ ] Collect user feedback for improvements

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Todoist API Documentation](https://developer.todoist.com/rest/v2)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com)
