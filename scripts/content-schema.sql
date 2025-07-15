-- Updated database schema for content management with website integration

-- Content table for all website sections
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('photos', 'videos', 'news', 'announcements', 'reports', 'volunteer')),
    file_url TEXT,
    thumbnail_url TEXT,
    published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Website sync log table
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(id),
    action VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_published ON content(published);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);

-- Insert sample content for each category
INSERT INTO content (title, description, content, category, published, created_by) VALUES
('Community Health Program', 'New health initiative in rural areas', 'We are excited to announce our new community health program that will serve over 1000 families in rural Ethiopia. This program focuses on preventive care, maternal health, and child nutrition.', 'news', true, (SELECT id FROM users WHERE email = 'admin@ethiopia-vitality.org')),
('Annual Impact Report 2024', 'Our yearly impact and financial report', 'This comprehensive report details our achievements, challenges, and financial transparency for the year 2024. Download to see how your support has made a difference.', 'reports', true, (SELECT id FROM users WHERE email = 'admin@ethiopia-vitality.org')),
('Volunteer Training Workshop', 'Join our upcoming volunteer training', 'We are looking for dedicated volunteers to join our mission. This training workshop will prepare you for various volunteer opportunities including healthcare support, education, and community development.', 'volunteer', true, (SELECT id FROM users WHERE email = 'admin@ethiopia-vitality.org')),
('New Partnership Announcement', 'Partnership with local healthcare providers', 'We are pleased to announce our new partnership with three local healthcare providers to expand our reach and improve healthcare access in remote areas.', 'announcements', true, (SELECT id FROM users WHERE email = 'admin@ethiopia-vitality.org'))
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
