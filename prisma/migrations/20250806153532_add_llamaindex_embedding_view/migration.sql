-- Create view that maps your schema to PGVectorStore's expected schema
CREATE VIEW llamaindex_embedding AS
SELECT 
  nc.id,
  nv.note_id::varchar as external_id,
  n.user_id::varchar as collection,
  nc.chunk_text as document,
  jsonb_build_object(
    'note_id', nv.note_id,
    'note_version_id', nc.note_version_id,
    'folder_id', n.folder_id,
    'chunk_index', nc.chunk_index,
    'note_title', n.title
  ) as metadata,
  nc.embedding as embeddings
FROM note_chunk nc
JOIN note_version nv ON nc.note_version_id = nv.id
JOIN note n ON nv.note_id = n.id
WHERE n.is_deleted = false AND nv.is_published = true;