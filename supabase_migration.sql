-- Supabase PostgreSQL Migration Script
-- Discord-Style Role & Permission Management System Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT NOT NULL UNIQUE,
    color_code TEXT NOT NULL DEFAULT '#64748b',
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Junction Table: Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Create Junction Table: User Roles (Mapping users to multiple roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 5. Seed Granular Permissions Grouped by Category
INSERT INTO permissions (permission_key, category, description) VALUES
    -- Category: Financials & P&L
    ('finance:view_p_and_l', 'Financials', 'Ability to view P&L Statements and monthly balance charts'),
    ('finance:view_cashflow', 'Financials', 'Ability to inspect cashflow logs, accounts ledger, and forecasts'),
    ('finance:approve_budgets', 'Financials', 'Ability to approve budget shifts, vendor payments, and write-offs'),

    -- Category: Tasks & Operations
    ('tasks:create_and_assign', 'Tasks', 'Ability to assign new work tasks, set assignees, and build checklists'),
    ('tasks:edit_deadlines', 'Tasks', 'Ability to override deadlines, task priorities, and SLA schedules'),
    ('tasks:approve_completed', 'Tasks', 'Ability to mark team assignments as complete and close open tickets'),
    ('tasks:update_own_status', 'Tasks', 'Ability to update personal task progress (Todo -> In Progress -> Done)'),

    -- Category: HR & Attendance
    ('attendance:view_all_logs', 'HR', 'Ability to check operator shift logs, present ratios, and punch records'),
    ('leaves:approve_requests', 'HR', 'Ability to authorize employee leaves and auto-deduct leave balances'),
    ('employees:onboard_and_offboard', 'HR', 'Ability to add or delete directory staff records and adjust base profiles'),

    -- Category: Department Control
    ('dept:view_analytics', 'Operations', 'Ability to inspect detailed department OEE metrics and line dashboards'),
    ('dept:override_lead_actions', 'Operations', 'Ability to override operations schedules, shift assignments, and batch runs')
ON CONFLICT (permission_key) DO UPDATE 
SET category = EXCLUDED.category, description = EXCLUDED.description;

-- 6. Seed Default System Roles
INSERT INTO roles (role_name, color_code, is_system_default) VALUES
    ('CEO', '#ff5a5f', TRUE),
    ('HR Manager', '#22C55E', TRUE),
    ('Production Head', '#F59E0B', TRUE),
    ('Marketing Employee', '#8B5CF6', TRUE),
    ('Design Operator', '#0EA5E9', TRUE)
ON CONFLICT (role_name) DO NOTHING;

-- 7. Configure Row Level Security (RLS) Policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if calling JWT claims indicate CEO or Super Admin privileges
CREATE OR REPLACE FUNCTION auth.is_ceo_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Assumes standard custom claims or role attribute inside auth.jwt() metadata
  RETURN (
    coalesce(current_setting('request.jwt.claims', true)::json->>'role', '') = 'CEO'
    OR coalesce(current_setting('request.jwt.claims', true)::json->>'role', '') = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CEO-Only RLS Policies for Roles
CREATE POLICY "Allow read access to authenticated users" 
ON roles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "CEO-Only Insert on Roles" 
ON roles FOR INSERT TO authenticated 
WITH CHECK (auth.is_ceo_or_admin());

CREATE POLICY "CEO-Only Update on Roles" 
ON roles FOR UPDATE TO authenticated 
USING (auth.is_ceo_or_admin());

CREATE POLICY "CEO-Only Delete on Roles" 
ON roles FOR DELETE TO authenticated 
USING (auth.is_ceo_or_admin());

-- CEO-Only RLS Policies for Role-Permissions mappings
CREATE POLICY "Allow read access to role_permissions" 
ON role_permissions FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "CEO-Only Insert/Update/Delete on Role-Permissions" 
ON role_permissions FOR ALL TO authenticated 
USING (auth.is_ceo_or_admin());

-- RLS Policies for Permissions (Read-only for all users)
CREATE POLICY "Read access for all authenticated users on permissions"
ON permissions FOR SELECT TO authenticated USING (TRUE);

-- RLS Policies for User Roles mapping
CREATE POLICY "Read access for all authenticated users on user_roles"
ON user_roles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "CEO-Only Insert/Update/Delete on User-Roles"
ON user_roles FOR ALL TO authenticated
USING (auth.is_ceo_or_admin());
