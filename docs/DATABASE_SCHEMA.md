# ConnectOS Database Schema

## Tables

### contacts
```sql
CREATE TABLE contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type text NOT NULL DEFAULT 'active' CHECK (contact_type IN ('historical', 'active')),
  name text NOT NULL,
  company text,
  designation text,
  phone text,
  whatsapp text,
  email text,
  address text,
  industry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, phone, email)
);
```

### events
```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date NOT NULL,
  location text,
  description text,
  status text DEFAULT 'completed' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### interactions
```sql
CREATE TABLE interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  interaction_type text DEFAULT 'met',
  relationship text,
  opportunity text,
  stage text DEFAULT 'New' CHECK (stage IN ('New', 'Contacted', 'Conversation', 'Opportunity', 'Client', 'Lost')),
  notes text,
  follow_up_date date,
  follow_up_status text DEFAULT 'pending' CHECK (follow_up_status IN ('pending', 'completed', 'not_required')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### message_templates
```sql
CREATE TABLE message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### communications
```sql
CREATE TABLE communications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES interactions(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'call', 'other')),
  template_id uuid REFERENCES message_templates(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'pending', 'failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

## Indexes

```sql
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_event_id ON interactions(event_id);
CREATE INDEX idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_contact_id ON communications(contact_id);
```

## Row Level Security

All tables should have RLS enabled:
- Users can only access their own data (user_id matching auth.users.id)
- No one can update or delete other users' data
