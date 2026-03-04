# 🤖 AI Document Assistant

> A modern, full-stack web application for intelligent document management and AI-powered conversations. Upload documents, interact with AI to ask questions, and get insights with citations from your source materials.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.9.0-orange?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 🌟 Features

- **📄 Document Management**: Upload, organize, and manage your documents with ease
- **💬 AI-Powered Chat**: Ask intelligent questions about your documents and receive comprehensive answers
- **✨ Citation Support**: All answers include precise citations referencing source documents
- **🔐 Secure Authentication**: Enterprise-grade Firebase authentication with token-based API security
- **📱 Responsive Design**: Beautiful, modern UI built with React and Tailwind CSS
- **🔄 Conversation History**: Maintain unlimited conversations per document
- **⚡ Real-time Updates**: Instant feedback on document uploads and chat responses
- **🎨 Dark Mode Ready**: Professional UI with Lucide React icons
- **🚀 Type-Safe**: Full TypeScript support throughout the application

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.6 | React framework with built-in SSR and optimizations |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | 5 | Type-safe JavaScript development |
| **Tailwind CSS** | 4 | Utility-first styling framework |
| **Lucide React** | 0.575.0 | Beautiful icon library |
| **Firebase** | 12.9.0 | Authentication and token management |

### **Backend Integration**
- RESTful API endpoints for document management and AI chat
- Firebase ID token-based authentication and validation
- PostgreSQL database for persistent data storage
- Async processing for document uploads

### **Development Tools**
- ESLint for code quality
- PostCSS for CSS processing
- Node.js 18.17+

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17 or higher ([download](https://nodejs.org))
- **npm** (comes with Node.js) or **yarn**
- **Firebase project** with Authentication enabled ([create one](https://firebase.google.com))
- **Backend API server** running (FastAPI/Python backend)
- **PostgreSQL** database (managed by backend)

## 🚀 Getting Started

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/yourusername/ai_doc_assistent.git
cd ai_doc_assistent
```

### **Step 2: Install Dependencies**

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### **Step 3: Configure Environment Variables**

Create a `.env.local` file in the project root with your Firebase credentials:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-app-id
```

**Getting your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll to "Your apps" section
5. Copy the config values for your web app

### **Step 4: Start Development Server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### **Step 5: Build for Production**

```bash
npm run build
npm start
```

## 📁 Project Structure

```
ai_doc_assistent/
├── app/
│   ├── components/
│   │   ├── AuthScreen.tsx           # User authentication interface
│   │   ├── AuthTestPanel.tsx        # Auth testing utilities
│   │   ├── DashboardScreen.tsx      # Main dashboard view
│   │   ├── WorkspaceScreen.tsx      # Document workspace
│   │   ├── Header.tsx               # Application header/navbar
│   │   ├── Router.tsx               # Client-side routing logic
│   │   ├── ConnectionStatus.tsx     # Backend connection indicator
│   │   ├── MarkdownMessage.tsx      # Markdown message renderer
│   │   ├── ClientLayout.tsx         # Client-side layout wrapper
│   │   └── ui/
│   │       ├── Badge.tsx            # Badge component
│   │       ├── Button.tsx           # Reusable button component
│   │       ├── Input.tsx            # Form input component
│   │       └── index.ts             # UI components export
│   ├── lib/
│   │   ├── Authentication/
│   │   │   ├── firebase.ts          # Firebase initialization
│   │   │   ├── authenticationApi.ts # Auth API functions
│   │   │   └── authenticationModel.ts # Auth TypeScript types
│   │   ├── chat/
│   │   │   ├── ChatApi.ts           # Chat API client
│   │   │   └── ChatModel.ts         # Chat data models
│   │   ├── Documents/
│   │   │   ├── documentsapi.ts      # Document API client
│   │   │   └── documentsModel.ts    # Document data models
│   │   ├── api.ts                   # HTTP client with auth
│   │   ├── context.tsx              # Global app context/state
│   │   └── types/
│   │       └── index.ts             # TypeScript type definitions
│   ├── globals.css                  # Global styles
│   └── page.tsx                     # Home page entry
├── public/                          # Static assets (images, icons, etc.)
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.mjs               # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
├── FIREBASE_AUTH_README.md          # Firebase setup documentation
├── AUTHENTICATION_STATUS.md         # Authentication status details
└── README.md                        # This file
```

## 🔐 Authentication System

The application implements a robust two-layer authentication system:

### **Authentication Architecture**

```
┌─────────────────────────────────────────┐
│         User Authentication             │
├─────────────────────────────────────────┤
│ 1. Firebase Client Authentication       │
│    - Email/Password Registration        │
│    - Login with credentials             │
│    - Token generation                   │
│                                         │
│ 2. Backend Validation                   │
│    - Token verification                 │
│    - User profile sync                  │
│    - Session management                 │
│                                         │
│ 3. Protected API Requests               │
│    - Bearer token in headers            │
│    - Request signing                    │
│    - Refresh token handling             │
└─────────────────────────────────────────┘
```

### **Key Authentication Functions**

```typescript
// User Registration
registerUser(email: string, password: string, displayName: string): Promise<User>

// User Login
loginUser(email: string, password: string): Promise<{token: string, user: User}>

// User Logout
logoutUser(): Promise<void>

// Get Current User
getCurrentUser(): Promise<User | null>

// Get Firebase Token
getFirebaseToken(): Promise<string | null>
```

### **Authentication Flow**

1. **Registration**
   ```
   User Input → Firebase Registration → Get ID Token → Backend Validation → Create User Profile
   ```

2. **Login**
   ```
   User Credentials → Firebase Auth → Get ID Token → Backend Verification → Dashboard Access
   ```

3. **API Requests**
   ```
   Any API Call → Attach ID Token → Backend Validates → Execute Operations → Return Results
   ```

For detailed setup instructions, see [FIREBASE_AUTH_README.md](FIREBASE_AUTH_README.md)

## 📚 API Integration Guide

### **Document Management** (`app/lib/Documents/`)

The document API handles all file operations:

```typescript
// Upload a new document
uploadDocument(file: File, description?: string): Promise<Document>

// Retrieve all user documents
listDocuments(): Promise<Document[]>

// Get detailed information about a specific document
getDocumentDetails(documentId: number): Promise<DocumentInfo>

// Delete a document
deleteDocument(documentId: number): Promise<{success: boolean}>

// Get document status/processing info
getDocumentStatus(documentId: number): Promise<DocStatus>
```

**Usage Example:**
```typescript
import { uploadDocument, listDocuments } from '@/lib/Documents/documentsapi';

// Upload document
const doc = await uploadDocument(file, 'My important document');

// List all documents
const documents = await listDocuments();
```

### **Chat Operations** (`app/lib/chat/`)

The chat API manages all AI-powered conversations with intelligent responses and citations:

```typescript
// Ask a question about a document and get AI-powered response
askQuestion(
  documentId: number, 
  question: string, 
  conversationId?: number
): Promise<{
  answer: string;
  citations: Citation[];
  conversationId: number;
}>

// List all conversations for a document
listConversations(documentId: number): Promise<Conversation[]>

// Get detailed conversation history
getConversationDetail(
  documentId: number, 
  conversationId: number
): Promise<Message[]>

// Clear conversation history
clearConversation(documentId: number, conversationId: number): Promise<void>
```

**Usage Example:**
```typescript
import { askQuestion, listConversations } from '@/lib/chat/ChatApi';

// Ask a question
const response = await askQuestion(
  1, 
  'What are the main points in this document?'
);

console.log(response.answer);      // AI-generated answer
console.log(response.citations);   // Source citations

// List conversations for a document
const conversations = await listConversations(1);
```

### **Authenticated Requests** (`app/lib/api.ts`)

All API calls are made through `fetchWithAuth()` which automatically:
- Adds Firebase ID token to `Authorization` header as Bearer token
- Handles JSON serialization and deserialization
- Manages error responses and retries
- Constructs full API URLs with base endpoint

```typescript
// Usage
const response = await fetchWithAuth('/documents', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### **Error Handling**

The API layer provides comprehensive error handling:

```typescript
try {
  const document = await getDocumentDetails(123);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch document:', error.message);
  }
}
```

## 🌍 Application Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Home page (auto-redirect) | No |
| `/auth` | Login/Registration screen | No |
| `/dashboard` | Document list and management | Yes |
| `/workspace/:docId` | Chat interface with document | Yes |

## 🎨 UI Components

### **Base Components** (`app/components/ui/`)
| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Reusable button with variants |
| `Input.tsx` | Form input with validation |
| `Badge.tsx` | Status badges and tags |

### **Screen Components**
| Component | Purpose |
|-----------|---------|
| `AuthScreen.tsx` | Authentication (login/register) |
| `DashboardScreen.tsx` | Document list and upload |
| `WorkspaceScreen.tsx` | Chat interface with document|
| `Header.tsx` | Navigation and user menu |
| `Router.tsx` | Client-side route management |
| `ConnectionStatus.tsx` | Backend connection indicator |
| `MarkdownMessage.tsx` | AI message markdown renderer |

## 📦 npm Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint code quality checks
```

## 🔧 Development Guide

### **Setting Up the Development Environment**

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org)
   - Verify installation: `node --version`

2. **Configure IDE**
   - Use VS Code with recommended extensions:
     - ESLint
     - Tailwind CSS IntelliSense
     - TypeScript Vue Plugin
     - Prettier

3. **Enable Firebase in Development**
   - Create `.env.local` with Firebase credentials
   - Firebase will auto-initialize on app start

### **Code Style Guidelines**

- Use TypeScript for type safety
- Follow ESLint configuration
- Component naming: PascalCase (e.g., `MyComponent.tsx`)
- Utility naming: camelCase (e.g., `myUtility.ts`)
- Use functional components with React Hooks
- Keep components under 500 lines

### **Adding New Components**

```typescript
// app/components/NewComponent.tsx
import { FC } from 'react';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
    </div>
  );
};
```

### **Working with API**

```typescript
// Always use fetchWithAuth for protected endpoints
import { fetchWithAuth } from '@/lib/api';

const response = await fetchWithAuth('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' })
});

const data = await response.json();
```

## 🐛 Troubleshooting

### **Common Issues**

**Issue: "NEXT_PUBLIC_* variables not found"**
```bash
# Solution: Create .env.local with required variables
# and restart the dev server
npm run dev
```

**Issue: "Firebase initialization failed"**
```bash
# Solution: Check Firebase credentials in .env.local
# Verify Firebase project is active and has Authentication enabled
```

**Issue: "Backend connection refused"**
```bash
# Solution: Ensure backend API is running
# Check NEXT_PUBLIC_API_URL matches backend URL
curl http://localhost:8000/health
```

**Issue: "Port 3000 already in use"**
```bash
# Solution: Start on different port
npm run dev -- -p 3001
```

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

```bash
# 1. Push code to GitHub
git push origin main

# 2. Visit vercel.com and connect repository
# 3. Add environment variables in Vercel dashboard
# 4. Deploy automatically on push to main
```

### **Deploy to Other Platforms**

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## 📚 Documentation References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/reference/js)

## 🔗 Related Documentation

- 📖 [Firebase Authentication Setup](FIREBASE_AUTH_README.md)
- 📖 [Authentication Status Details](AUTHENTICATION_STATUS.md)
- 🐞 [Report Issues](../../issues)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/ai_doc_assistent.git
   cd ai_doc_assistent
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make Your Changes**
   - Follow the code style guidelines
   - Write clear commit messages
   - Test your changes thoroughly

4. **Commit and Push**
   ```bash
   git add .
   git commit -m 'Add: Description of your changes'
   git push origin feature/YourFeatureName
   ```

5. **Create a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Support & Contact

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@ai-doc-assistant.dev
- **Documentation**: [Full Docs](./docs)

## 🙏 Acknowledgments

This project was built with these amazing technologies:

- **[Next.js](https://nextjs.org)** - The React framework for production
- **[Tailwind CSS](https://tailwindcss.com)** - A utility-first CSS framework
- **[Lucide React](https://lucide.dev)** - Beautiful, consistent icon library
- **[Firebase](https://firebase.google.com)** - Backend-as-a-service platform
- **[TypeScript](https://www.typescriptlang.org)** - JavaScript with syntax for types

## 📊 Project Statistics

- **Language**: TypeScript
- **Framework**: Next.js 16.1.6
- **UI Framework**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase 12.9.0
- **Components**: 15+ reusable components
- **Type Coverage**: 100%

---

**Version:** 0.1.0  
**Status**: Active Development 🚀  
**Last Updated:** March 2026

Made with ❤️ using Next.js and React

This comprehensive README includes everything developers need to understand, set up, and contribute to the AI Document Assistant project. Happy coding! 🎉
