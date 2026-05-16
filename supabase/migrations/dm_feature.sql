-- ============================================================
-- Direct Messaging Feature
-- Run this in your Supabase SQL editor
-- ============================================================

-- DM conversations (one row per pair of users)
create table if not exists dm_conversations (
  id               uuid primary key default gen_random_uuid(),
  user1_id         uuid references profiles(id) on delete cascade not null,
  user2_id         uuid references profiles(id) on delete cascade not null,
  created_at       timestamptz default now() not null,
  last_message_at  timestamptz,
  constraint dm_conversations_unique unique (user1_id, user2_id),
  constraint dm_conversations_no_self check (user1_id != user2_id)
);

-- Messages inside DM conversations
create table if not exists dm_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid references dm_conversations(id) on delete cascade not null,
  sender_id        uuid references profiles(id) on delete cascade not null,
  content          text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  created_at       timestamptz default now() not null,
  read_at          timestamptz
);

-- Indexes
create index if not exists dm_conv_user1_idx     on dm_conversations(user1_id);
create index if not exists dm_conv_user2_idx     on dm_conversations(user2_id);
create index if not exists dm_conv_last_msg_idx  on dm_conversations(last_message_at desc nulls last);
create index if not exists dm_msg_conv_time_idx  on dm_messages(conversation_id, created_at asc);
create index if not exists dm_msg_sender_idx     on dm_messages(sender_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table dm_conversations enable row level security;
alter table dm_messages      enable row level security;

-- dm_conversations: visible only to the two participants
create policy "dm_conv_select"
  on dm_conversations for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "dm_conv_insert"
  on dm_conversations for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- dm_messages: only participants can read / write
create policy "dm_msg_select"
  on dm_messages for select
  using (
    exists (
      select 1 from dm_conversations dc
      where dc.id = dm_messages.conversation_id
        and (dc.user1_id = auth.uid() or dc.user2_id = auth.uid())
    )
  );

create policy "dm_msg_insert"
  on dm_messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from dm_conversations dc
      where dc.id = dm_messages.conversation_id
        and (dc.user1_id = auth.uid() or dc.user2_id = auth.uid())
    )
  );

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime on dm_messages so clients receive live updates
alter publication supabase_realtime add table dm_messages;
