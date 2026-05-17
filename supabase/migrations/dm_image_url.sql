-- Add image_url column to dm_messages (was missing from original migration)
alter table dm_messages
  add column if not exists image_url text;

-- Also make content nullable so image-only messages are allowed
alter table dm_messages
  alter column content drop not null;

-- Drop the old check constraint that required content > 0 chars
alter table dm_messages
  drop constraint if exists dm_messages_content_check;

-- Add a new constraint: at least one of content or image_url must be present
alter table dm_messages
  add constraint dm_messages_has_body
    check (
      (content is not null and char_length(content) > 0 and char_length(content) <= 2000)
      or image_url is not null
    );

-- Add index on image_url for storage queries
create index if not exists dm_msg_image_idx on dm_messages(image_url) where image_url is not null;

-- Enable Storage bucket for DM attachments if not already done
-- (run this separately in the Supabase dashboard if needed)
-- insert into storage.buckets (id, name, public) values ('dm-attachments', 'dm-attachments', true)
-- on conflict do nothing;
