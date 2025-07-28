# Portfolio Back-End by Matthijn

## Introduction

As you've already known that I made my own website with GitHub static hosting. To take my web-developing skill to the next level, I would like to enhance my site with back-end web-development.

There are several instruments that I'd like to enhance it with back-end:
1. **Blogs**: I'm going to store my blogs in a database (using MongoDB).
2. **Galleries**: I'm going to store my photos in a cloud storage to prevent my assets to be stolen.
3. **Contact**: I'm going to use my own script to handle form instead of using Formspree's API.

**Finally, I would like you to check my portfolio by checking on this site!: https://maatthijn.github.io/**

## What's New?

### v1.2.1
1. Created an email service API for front-end site.
2. Protected admin site by using brute-force protection.
3. A login-attempt-left warning will show when user enters a wrong identity.
4. Enhanced mobile galleries maintenance to avoid listening to delete or edit image when clicking on an image for the first time.

## Logs

### v1.2
This is a massive update because I refused to deploy every minor update until I fully finish my admin site. Here are points of the updates:

1. Created an admin page to maintain my contents.
2. Optimized serverless cold start by calling the server at "Home" section.
3. Secured my admin site by implementing JWT protection.
4. Automatically logged out when idling for too long (15 minutes) or exceeding 3 hours of logging in.
5. Allowed admin to create a new content (blog/image) or manage an existing content, either edit or delete it.
6. Enabled an action to draft a new or a published content.

### v1.1
1. Added Vercel deployment to the site.
2. Fixed every problem with my blog fetching mechanism.
3. Added a script to fetch galleries from database (which stores URLs from Cloudinary).

### v1.0
1. Added a script to fetch blogs from database.

© 2025 Hafidh Maulana Matin