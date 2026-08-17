UPDATE users
SET role = 'root', updated_at = NOW()
WHERE role = 'admin';

COMMENT ON COLUMN users.role IS 'Authorization role: root, admin, reseller, or user';