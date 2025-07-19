# Collaborative Document Editor

A real-time collaborative document editor built with React, TypeScript, Tailwind CSS, Tiptap, and Supabase.

## Features

### Phase 1 (Current Implementation)
- ✅ User authentication (email/password login with Supabase)
- ✅ Rich text editor with Tiptap (headings, bold, italic, lists, code blocks, etc.)
- ✅ Document CRUD operations (create, read, update, delete)
- ✅ Auto-save functionality
- ✅ Responsive dashboard with document listing
- ✅ Protected routes and proper error handling
- ✅ Clean, minimal UI inspired by Notion/Dropbox Paper

### Coming in Future Phases
- Real-time collaboration with Yjs
- Document sharing and permissions
- Version history and snapshots
- User presence indicators

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Editor**: Tiptap (ProseMirror-based)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone and Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key
3. Create the database schema:

\`\`\`sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Set up Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own documents
CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### 3. Environment Configuration

Create a `.env` file in the project root:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Replace the values with your actual Supabase project URL and anonymous key.

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

### Authentication
1. Visit the app and click "Create new account" to sign up
2. Verify your email if email confirmation is enabled in Supabase
3. Sign in with your credentials

### Document Management
1. **Create**: Click "New Document" on the dashboard
2. **Edit**: Click on any document to open the editor
3. **Save**: Documents auto-save as you type
4. **Delete**: Hover over a document and click the trash icon
5. **Title**: Click on the document title to rename it

### Editor Features
- **Text formatting**: Bold, italic, inline code
- **Headings**: H1, H2, H3
- **Lists**: Bullet points and numbered lists
- **Blocks**: Blockquotes and code blocks
- **Undo/Redo**: Full history support

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── DocumentEditor.tsx
│   └── LoadingSpinner.tsx
├── pages/               # Page components
│   ├── DashboardPage.tsx
│   ├── DocumentPage.tsx
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── stores/              # Zustand state management
│   ├── authStore.ts
│   └── documentStore.ts
├── lib/                 # Configuration and utilities
│   └── supabase.ts
├── App.tsx              # Main app component with routing
├── main.tsx             # React entry point
└── index.css            # Global styles and Tailwind imports
\`\`\`

## Development Guidelines

### Code Quality
- Functions should do one thing
- Keep files under 300 lines
- Use meaningful variable names
- Add JSDoc comments for public functions
- Handle async operations properly

### Security
- User input is validated client-side and server-side (RLS)
- Environment variables are used for configuration
- Authentication is required for all document operations

### Performance
- Auto-save is debounced to avoid excessive API calls
- Documents are cached in local state
- Optimistic updates for better UX

## Deployment

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist/` directory.

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project locally or connect to GitHub
2. Set environment variables in Netlify settings
3. Deploy the `dist/` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding guidelines
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the GitHub issues
2. Review the Supabase documentation
3. Check the Tiptap documentation for editor-related questions 