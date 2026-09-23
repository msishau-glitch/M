# Wedding Invitation Website Deployment

## Local preview

1. Open a terminal in the project folder.
2. Run:
   `node server.js`
3. Open:
   `http://127.0.0.1:3000/website.html`

## Static hosting deployment

This site is compatible with static hosting platforms such as:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

### Recommended deployment approach

- Upload the project folder to a static host
- Set the root to the project directory
- Use `website.html` as the entry page if your platform requires an explicit file
- Keep the project as plain HTML, CSS, and JavaScript

## Notes

- No PHP is used.
- No XAMPP is required.
- The RSVP form is front-end only by default and can later be connected to Formspree, Google Forms, or a serverless endpoint.
- The RSVP submission flow includes browser validation, basic spam protection, and a graceful confirmation state.
- The countdown uses JavaScript and updates automatically.

## RSVP configuration

To connect the form to a real collecting service, set the submit endpoint in `website.js`:

```js
const RSVP_CONFIG = {
  maxGuests: 10,
  submitUrl: 'https://formspree.io/f/your-form-id',
  maxMessageLength: 250
};
```

- Keep `submitUrl` empty for local preview and testing.
- Do not place private API keys or database credentials in client-side code.
- Use Formspree or a serverless endpoint to keep the invite private and maintainable.

## Social preview metadata

The page metadata is defined in `website.html` and should be adjusted when a real preview image is available.
