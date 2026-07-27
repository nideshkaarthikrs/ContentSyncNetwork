-- Normalizes existing User.email values to lowercase/trimmed form so stored
-- data matches the new invariant enforced in AuthRepository (always
-- lowercase/trim email before read/write).

-- Pre-flight: if two rows collide once emails are lowercased/trimmed, the
-- UPDATE below would hit the User_email_key unique index mid-statement with an
-- opaque error, and identity-service would never boot (identity-migrate gates
-- it in docker-compose). Fail first with an actionable message instead.
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT count(*) INTO dup_count
  FROM (
    SELECT lower(trim(email))
    FROM "User"
    GROUP BY lower(trim(email))
    HAVING count(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION USING
      MESSAGE = format(
        'email normalization blocked: %s email group(s) differ only by case/whitespace. '
        'Inspect with: SELECT lower(trim(email)) AS normalized, array_agg(email) AS variants '
        'FROM "User" GROUP BY 1 HAVING count(*) > 1; '
        'then merge or delete the duplicate accounts and re-run the migration.',
        dup_count
      );
  END IF;
END $$;

UPDATE "User" SET email = lower(trim(email)) WHERE email <> lower(trim(email));

-- Enforce the invariant at the DB level so writers that bypass AuthRepository
-- (seed scripts, Prisma Studio, future admin endpoints) can't reintroduce
-- case-variant duplicates.
-- NOTE: Prisma cannot represent functional indexes in schema.prisma, so a
-- future `prisma migrate dev` diff may propose dropping this index — keep it
-- (re-add it in the generated migration if that happens).
CREATE UNIQUE INDEX "User_email_lower_key" ON "User" (lower(email));
