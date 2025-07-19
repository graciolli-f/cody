-- Document Versions Table Schema
-- Run this SQL in your Supabase SQL Editor to add version history support

-- Create document_versions table
CREATE TABLE document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'title_updated', 'content_modified', 'restored')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON document_versions(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access versions of documents they own
CREATE POLICY "Users can access versions of their own documents" ON document_versions
  FOR ALL USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Function to automatically create a version when a document is updated
CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
DECLARE
  change_type_val TEXT;
  old_title TEXT;
  old_content TEXT;
BEGIN
  -- Get the previous version for comparison
  SELECT title, content INTO old_title, old_content
  FROM documents WHERE id = NEW.id;

  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    change_type_val := 'created';
  ELSIF OLD.title != NEW.title AND OLD.content != NEW.content THEN
    change_type_val := 'content_modified';
  ELSIF OLD.title != NEW.title THEN
    change_type_val := 'title_updated';
  ELSIF OLD.content != NEW.content THEN
    change_type_val := 'content_modified';
  ELSE
    -- No significant changes, don't create a version
    RETURN NEW;
  END IF;

  -- Create version record
  INSERT INTO document_versions (document_id, title, content, change_type, user_id)
  VALUES (NEW.id, NEW.title, NEW.content, change_type_val, NEW.user_id);

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically version documents
CREATE TRIGGER trigger_create_document_version
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_version();

-- Create initial versions for existing documents (run once)
INSERT INTO document_versions (document_id, title, content, change_type, user_id, created_at)
SELECT id, title, content, 'created', user_id, created_at
FROM documents
WHERE id NOT IN (SELECT document_id FROM document_versions); 