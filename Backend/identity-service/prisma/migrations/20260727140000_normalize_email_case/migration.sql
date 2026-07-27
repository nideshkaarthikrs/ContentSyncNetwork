-- Normalizes existing User.email values to lowercase/trimmed form so stored
-- data matches the new invariant enforced in AuthRepository (always
-- lowercase/trim email before read/write). The User_email_key unique index
-- stays active during this UPDATE, so if a real case-variant duplicate pair
-- exists, this statement fails loudly (unique violation) rather than
-- silently merging rows.
UPDATE "User" SET email = lower(trim(email)) WHERE email <> lower(trim(email));
