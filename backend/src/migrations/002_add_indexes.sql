-- Індекс для прискорення пошуку заявок за статусом
CREATE INDEX IF NOT EXISTS idx_requests_status ON AccessRequests (status);
-- Індекс для прискорення пошуку заявок за ID користувача
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON AccessRequests (userId);