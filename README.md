# The JERK Tracker X

A modern restaurant order tracking app built with Next.js, Styled Components, and AWS DynamoDB.

## Features

- **Order Management**: Create, track, and manage restaurant orders
- **Admin Dashboard**: View all orders, generate QR codes, manage order status
- **Cloud Persistence**: Orders stored in AWS DynamoDB for multi-user access
- **Responsive Design**: Modern UI with Styled Components and Framer Motion
- **Static Export**: Deployed to GitHub Pages for fast loading

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=us-east-1
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

### Deployment

#### GitHub Pages
The app is deployed to GitHub Pages using static export:
```bash
npm run build
npm run deploy
```

## Architecture

- **Frontend**: Next.js with App Router, static export for GitHub Pages
- **Styling**: Styled Components with theme system
- **Storage**: Browser localStorage for order persistence
- **Deployment**: GitHub Pages (static hosting)

## Storage

Orders are stored in browser localStorage, making this perfect for:
- Demo and development purposes
- Single-user scenarios
- No backend infrastructure needed
- Works perfectly with GitHub Pages static hosting

**Note**: Orders are browser-specific and will not sync across devices or users. For multi-user scenarios, you would need to add a backend service.

## Fixed Issues

✅ **QR Code Generation**: Fixed basePath handling for GitHub Pages deployment  
✅ **localStorage Access**: Added proper SSR/client-side checks  
✅ **Order Persistence**: Unified localStorage key usage across components  
✅ **GitHub Pages Compatibility**: Proper basePath configuration for static export  
✅ **Error Handling**: Improved fallback mechanisms for localStorage operations