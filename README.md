# 🤖 AI Document Assistant

A modern web application for intelligent document management and AI-powered conversations. Upload documents, interact with AI to ask questions, and get insights with citations from your documents.

## 🌟 Features

- **📄 Document Management**: Upload and manage your documents
- **💬 AI-Powered Chat**: Ask questions about your documents and get intelligent responses
- **✨ Citation Support**: Answers include citations from the source documents
- **🔐 Secure Authentication**: Firebase authentication with token-based API security
- **📱 Responsive Design**: Beautiful UI built with React and Tailwind CSS
- **🔄 Conversation History**: Maintain multiple conversations per document
- **⚡ Real-time Updates**: Instant feedback on document uploads and chat responses

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with TypeScript support
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Firebase 12.9.0** - Authentication and auth token management

### Backend Integration
- RESTful API endpoints for document management and chat
- Firebase ID token-based authentication
- PostgreSQL database (via backend)

## 📋 Prerequisites

- Node.js 18.17 or higher
- npm or yarn package manager
- Firebase project with authentication enabled
- Backend API server running

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai_doc_assistent

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 4. Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
ai_doc_assistent/
├── app/
│   ├── components/
│   │   ├── AuthScreen.tsx        # Authentication UI
│   │   ├── DashboardScreen.tsx   # Main dashboard
│   │   ├── WorkspaceScreen.tsx   # Document workspace
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Router.tsx            # Route management
│   │   ├── ConnectionStatus.tsx  # Connection indicator
│   │   ├── MarkdownMessage.tsx   # Markdown renderer
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   ├── Authentication/
│   │   │   ├── firebase.ts       # Firebase config
│   │   │   ├── authenticationApi.ts    # Auth functions
│   │   │   └── authenticationModel.ts  # Auth types
│   │   ├── chat/
│   │   │   ├── ChatApi.ts        # Chat API client
│   │   │   └── ChatModel.ts      # Chat types
│   │   ├── Documents/
│   │   │   ├── documentsapi.ts   # Document API client
│   │   │   └── documentsModel.ts # Document types
│   │   ├── api.ts                # HTTP utilities with auth
│   │   └── context.tsx           # Global app context
│   ├── types/
│   │   └── index.ts              # Global TypeScript types
│   └── page.tsx                  # Home page
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
└── README.md
```

## 🔐 Authentication

The application uses Firebase Authentication with a secure backend validation system:

1. **Firebase Sign-In**: Users register/login via Firebase
2. **Token Management**: Firebase ID tokens are obtained after authentication
3. **Backend Validation**: Tokens are validated against the backend API
4. **Protected Routes**: All API calls include the Bearer token in the Authorization header

### Key Functions

- `registerUser(email, password, displayName)` - Create new account
- `loginUser(email, password)` - Sign in to existing account
- `logoutUser()` - Sign out current user
- `getCurrentUser()` - Fetch current user data
- `getFirebaseToken()` - Get Firebase ID token

For detailed authentication setup, see [FIREBASE_AUTH_README.md](FIREBASE_AUTH_README.md) and [AUTHENTICATION_STATUS.md](AUTHENTICATION_STATUS.md).

## 📚 API Integration

### Document Management (`app/lib/Documents/`)

```typescript
uploadDocument(file: File, description?: string)  // Upload a document
listDocuments()                                    // Get all documents
getDocumentDetails(documentId: number)             // Get document info
deleteDocument(documentId: number)                 // Delete a document
```

### Chat Operations (`app/lib/chat/`)

```typescript
askQuestion(documentId: number, question: string, conversationId?: number)
listConversations(documentId: number)
getConversationDetail(documentId: number, conversationId: number)
```

### Authenticated Requests (`app/lib/api.ts`)

All API calls are made through `fetchWithAuth()` which automatically:
- Adds Firebase ID token to Authorization header
- Handles JSON serialization
- Manages error responses

## 🌍 Available Routes

- `/` - Home (redirects based on auth status)
- `auth` - Authentication screen (login/register)
- `dashboard` - Document list and management
- `workspace` - Document workspace with chat interface

## 🎨 UI Components

### Base Components (`app/components/ui/`)
- `Button.tsx` - Reusable button component
- `Input.tsx` - Text input component
- `Badge.tsx` - Status/tag badges

### Screen Components
- `AuthScreen.tsx` - Login and registration forms
- `DashboardScreen.tsx` - Document management interface
- `WorkspaceScreen.tsx` - Chat and document viewing

## 📦 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔧 Configuration Files

- **next.config.ts** - Next.js configuration
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.js** - Tailwind CSS settings
- **postcss.config.mjs** - PostCSS configuration
- **eslint.config.mjs** - ESLint rules

## 📝 Environment Setup

### Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Email/Password authentication
3. Copy project credentials to `.env.local`

### Backend Requirements
- Backend API must be running at the URL specified in `NEXT_PUBLIC_API_URL`
- API should implement the following endpoints:
  - `POST /auth/register` - User registration
  - `GET /auth/me` - Get current user
  - `POST /documents/upload` - Upload document
  - `GET /documents` - List documents
  - `POST /chat/documents/{id}/ask` - Ask question

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy
```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend server is running
- Check network/CORS settings

### Authentication Issues
- Verify Firebase credentials in `.env.local`
- Check Firebase project settings
- Ensure Firebase authentication is enabled

### Document Upload Issues
- Check file size limits on backend
- Verify user is authenticated
- Check backend disk space

## 📖 Documentation

- [Firebase Authentication Setup](FIREBASE_AUTH_README.md)
- [Authentication Implementation Status](AUTHENTICATION_STATUS.md)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Support

For issues and questions, please open an issue on the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide React](https://lucide.dev)
- Authentication via [Firebase](https://firebase.google.com)

---

**Version:** 0.1.0  
**Last Updated:** March 2026
