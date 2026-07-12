-- Add counterpart_id to mark_transactions so gift rows can reference
-- the other party (sender for gift_received, recipient for gift_sent).
ALTER TABLE public.mark_transactions
  ADD COLUMN IF NOT EXISTS counterpart_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mark_tx_counterpart
  ON public.mark_transactions(counterpart_id)
  WHERE counterpart_id IS NOT NULL;
