
# ServeTracker

A process server tracking application built with Appwrite backend integration.

## Setup

### Prerequisites

1. Node.js and npm installed
2. An Appwrite account and project set up

### Appwrite Setup

1. Create a new Appwrite project or use an existing one
2. Create a database named "serve-tracker-db" with the following collections:
   - `clients` - for storing client information
   - `serve_attempts` - for storing serve attempt records
   - `client_cases` - for storing case information
   - `client_documents` - for storing document metadata
3. Create a storage bucket named "client-documents" for document files
4. Set up the attributes in each collection as shown in the app

### Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Update the Appwrite endpoint and project ID

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

This project is configured for Netlify deployment.

```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy
```
