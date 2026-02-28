-- Prevent duplicate post creation from retried/double-submitted requests.
BEGIN;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_idempotency_key_unique
  ON public.posts(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMIT;
