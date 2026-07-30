// server/db.js - Production Database setup and seed for PostgreSQL/Supabase
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase') 
                ? { rejectUnauthorized: false } 
                : false
        });
    }
    return pool;
}

function convertSql(sql) {
    let index = 1;
    let converted = sql.replace(/\?/g, () => `$${index++}`);
    
    // SQLite specific insert syntax replacement
    if (converted.toUpperCase().includes('INSERT OR IGNORE INTO')) {
        converted = converted.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
        if (!converted.toUpperCase().includes('ON CONFLICT')) {
            // Determine conflict targets based on table
            if (converted.toLowerCase().includes('role_permissions')) {
                converted += ' ON CONFLICT (role_id, permission_id) DO NOTHING';
            } else if (converted.toLowerCase().includes('permissions')) {
                converted += ' ON CONFLICT (permission_key) DO NOTHING';
            } else if (converted.toLowerCase().includes('user_roles')) {
                converted += ' ON CONFLICT (user_id, role_id) DO NOTHING';
            } else if (converted.toLowerCase().includes('roles')) {
                converted += ' ON CONFLICT (role_name) DO NOTHING';
            } else {
                converted += ' ON CONFLICT DO NOTHING';
            }
        }
    }
    
    // Convert SQLite MAX() to PostgreSQL GREATEST()
    converted = converted.replace(/\bMAX\(/gi, 'GREATEST(');
    
    return converted;
}

async function getDb() {
    const activePool = getPool();
    
    // SQLite compatibility wrapper
    return {
        all: async (sql, params = []) => {
            const converted = convertSql(sql);
            const res = await activePool.query(converted, params);
            return res.rows;
        },
        get: async (sql, params = []) => {
            const converted = convertSql(sql);
            const res = await activePool.query(converted, params);
            return res.rows[0];
        },
        run: async (sql, params = []) => {
            let converted = convertSql(sql);
            const isInsert = converted.trim().toUpperCase().startsWith('INSERT');
            const targetUpper = converted.toUpperCase();
            if (isInsert && !targetUpper.includes('RETURNING')) {
                if (targetUpper.includes('INTO TASKS') || targetUpper.includes('INTO ROLES')) {
                    converted += ' RETURNING id';
                }
            }
            const res = await activePool.query(converted, params);
            return {
                lastID: isInsert && res.rows[0] ? res.rows[0].id : null,
                changes: res.rowCount
            };
        },
        exec: async (sql) => {
            const converted = convertSql(sql);
            return activePool.query(converted);
        }
    };
}

async function initDb() {
    const db = await getDb();
    
    console.log('Initializing database and applying schema migrations...');
    // Create Users Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            annual_leave INTEGER DEFAULT 25,
            sick_leave INTEGER DEFAULT 10
        )
    `);

    // Create Roles Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            role_name TEXT NOT NULL UNIQUE,
            color_code TEXT NOT NULL DEFAULT '#64748b',
            is_system_default INTEGER DEFAULT 0
        )
    `);

    // Create Permissions Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS permissions (
            id SERIAL PRIMARY KEY,
            permission_key TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            description TEXT NOT NULL
        )
    `);

    // Create Junction Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_roles (
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, role_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        )
    `);

    // Create Tasks Table (Production Orders)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            assigner TEXT NOT NULL,
            assignee TEXT NOT NULL,
            dept TEXT NOT NULL,
            deadline TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT DEFAULT 'todo'
        )
    `);

    // Create Attendance Table (Shift Logs)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            check_in_time TEXT,
            check_out_time TEXT,
            date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create Leave Requests Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS leaves (
            id SERIAL PRIMARY KEY,
            employee TEXT NOT NULL,
            type TEXT NOT NULL,
            duration TEXT NOT NULL,
            dates TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'pending'
        )
    `);

    // Create Complaints Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS complaints (
            complaint_no TEXT PRIMARY KEY,
            complaint_date TEXT,
            raised_by TEXT,
            assigned_to TEXT,
            invoice_no TEXT,
            customer_name TEXT,
            customer_contact TEXT,
            complaint_type TEXT,
            severity TEXT,
            description TEXT,
            status TEXT,
            sla_target TEXT,
            sla_due_date TEXT,
            ageing TEXT,
            sla_status TEXT,
            customer_response TEXT,
            first_response_date TEXT,
            root_cause_category TEXT,
            root_cause_details TEXT,
            corrective_action TEXT,
            resolution_details TEXT,
            resolved_date TEXT,
            closed_date TEXT,
            closure_category TEXT
        )
    `);

    // Check if database is already seeded
    const seeded = await db.get("SELECT COUNT(*) as count FROM users");
    if (parseInt(seeded?.count || 0) === 0) {
        console.log('Seeding default database records...');
        // Seed default users
        const hashedPassword = await bcrypt.hash('password', 10);
    
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Sanjai Kumar', 'employee@workhub.com', hashedPassword, 'employee', 'sales', 18, 4]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Jawahir', 'productionhead@workhub.com', hashedPassword, 'teamlead', 'production-ops', 12, 6]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Dave Miller', 'hrhead@workhub.com', hashedPassword, 'hr', 'hr-dept', 22, 8]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Aravind Swamy', 'procurementhead@workhub.com', hashedPassword, 'procurementhead', 'procurement', 20, 6]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Sonia Verma', 'accountshead@workhub.com', hashedPassword, 'accountshead', 'accounts', 24, 7]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Rahul Khanna', 'saleshead@workhub.com', hashedPassword, 'saleshead', 'sales', 19, 5]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Aditya Sharma', 'designhead@workhub.com', hashedPassword, 'designhead', 'design', 21, 6]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Sneha Gupta', 'marketinghead@workhub.com', hashedPassword, 'marketinghead', 'digital_marketing', 22, 8]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Velmurugan Rathinam', 'executive@workhub.com', hashedPassword, 'executive', 'all', 30, 10]
    );
    
    // Add additional operators for directory
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Alex Mercer', 'alex@workhub.com', hashedPassword, 'employee', 'packaging', 20, 5]
    );
    await db.run(
        `INSERT INTO users (name, email, password, role, department, annual_leave, sick_leave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Elena Rostova', 'elena@workhub.com', hashedPassword, 'employee', 'logistics', 15, 7]
    );

    console.log('Seeded database production users.');

    // Seed default production tasks (Batch Runs & Orders)
    const defaultTasks = [
        { name: 'Assemble Batch A41 - Semiconductor Wafers', assigner: 'Marcus Aurelius', assignee: 'Sanjai Kumar', dept: 'assembly', deadline: '2026-07-27', priority: 'high', status: 'inprogress' },
        { name: 'Calibrate CNC Machine B Calibration', assigner: 'Marcus Aurelius', assignee: 'Sanjai Kumar', dept: 'assembly', deadline: '2026-07-29', priority: 'medium', status: 'todo' },
        { name: 'Pre-shipment Safety Audit Run', assigner: 'Marcus Aurelius', assignee: 'Sanjai Kumar', dept: 'assembly', deadline: '2026-07-31', priority: 'low', status: 'completed' },
        { name: 'QA Stress Testing - Batch A41 Samples', assigner: 'Sanjai Kumar', assignee: 'Alex Mercer', dept: 'packaging', deadline: '2026-07-28', priority: 'high', status: 'inprogress' },
        { name: 'Verify Inventory Levels - Line 4 Raw Stocks', assigner: 'Sanjai Kumar', assignee: 'Alex Mercer', dept: 'packaging', deadline: '2026-07-30', priority: 'medium', status: 'todo' },
        { name: 'Logistics Prep - Deliverable Batch A39 Cargo', assigner: 'Dave Miller', assignee: 'Elena Rostova', dept: 'logistics', deadline: '2026-07-26', priority: 'high', status: 'overdue' }
    ];

    for (const t of defaultTasks) {
        await db.run(
            `INSERT INTO tasks (name, assigner, assignee, dept, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.name, t.assigner, t.assignee, t.dept, t.deadline, t.priority, t.status]
        );
    }
    console.log('Seeded database production tasks.');

    // Seed default leave requests
    await db.run(
        `INSERT INTO leaves (employee, type, duration, dates, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Alex Mercer', 'Annual', '3 Days', 'Aug 02 - Aug 05', 'Family vacation', 'pending']
    );
    await db.run(
        `INSERT INTO leaves (employee, type, duration, dates, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Elena Rostova', 'Sick', '1 Day', 'Jul 29', 'Medical checkup', 'pending']
    );

    // Seed default complaints
    console.log('Skipped seeding mock database complaints (empty state setup).');

    // Seed Permissions
    const seededPerms = [
        { key: 'finance:view_p_and_l', cat: 'Financials', desc: 'Ability to view P&L Statements and monthly balance charts' },
        { key: 'finance:view_cashflow', cat: 'Financials', desc: 'Ability to inspect cashflow logs, accounts ledger, and forecasts' },
        { key: 'finance:approve_budgets', cat: 'Financials', desc: 'Ability to approve budget shifts, vendor payments, and write-offs' },
        
        { key: 'tasks:create_and_assign', cat: 'Tasks', desc: 'Ability to assign new work tasks, set assignees, and build checklists' },
        { key: 'tasks:edit_deadlines', cat: 'Tasks', desc: 'Ability to override deadlines, task priorities, and SLA schedules' },
        { key: 'tasks:approve_completed', cat: 'Tasks', desc: 'Ability to mark team assignments as complete and close open tickets' },
        { key: 'tasks:update_own_status', cat: 'Tasks', desc: 'Ability to update personal task progress (Todo -> In Progress -> Done)' },
        
        { key: 'attendance:view_all_logs', cat: 'HR', desc: 'Ability to check operator shift logs, present ratios, and punch records' },
        { key: 'leaves:approve_requests', cat: 'HR', desc: 'Ability to authorize employee leaves and auto-deduct leave balances' },
        { key: 'employees:onboard_and_offboard', cat: 'HR', desc: 'Ability to add or delete directory staff records and adjust base profiles' },
        
        { key: 'dept:view_analytics', cat: 'Operations', desc: 'Ability to inspect detailed department OEE metrics and line dashboards' },
        { key: 'dept:override_lead_actions', cat: 'Operations', desc: 'Ability to override operations schedules, shift assignments, and batch runs' }
    ];

    for (const p of seededPerms) {
        await db.run(
            `INSERT OR IGNORE INTO permissions (permission_key, category, description) VALUES (?, ?, ?)`,
            [p.key, p.cat, p.desc]
        );
    }
    console.log('Seeded database permission keys.');

    // Seed Custom System Roles
    const customRoles = [
        { name: 'CEO', color: '#ff5a5f', sys: 1 },
        { name: 'HR Manager', color: '#22c55e', sys: 1 },
        { name: 'Production Head', color: '#f59e0b', sys: 1 },
        { name: 'Procurement Manager', color: '#3b82f6', sys: 1 },
        { name: 'Finance Manager', color: '#10b981', sys: 1 },
        { name: 'Sales Manager', color: '#f59e0b', sys: 1 },
        { name: 'Design Manager', color: '#0ea5e9', sys: 1 },
        { name: 'Marketing Manager', color: '#8b5cf6', sys: 1 },
        { name: 'Employee', color: '#64748b', sys: 1 }
    ];

    for (const r of customRoles) {
        await db.run(
            `INSERT OR IGNORE INTO roles (role_name, color_code, is_system_default) VALUES (?, ?, ?)`,
            [r.name, r.color, r.sys]
        );
    }
    console.log('Seeded database roles.');

    // Map all permissions to CEO role
    const ceoRole = await db.get("SELECT id FROM roles WHERE role_name = 'CEO'");
    if (ceoRole) {
        const allPerms = await db.all("SELECT id FROM permissions");
        for (const p of allPerms) {
            await db.run(`INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [ceoRole.id, p.id]);
        }
    }

    // Map some permissions to HR Manager and Production Head
    const hrRole = await db.get("SELECT id FROM roles WHERE role_name = 'HR Manager'");
    if (hrRole) {
        const hrPerms = await db.all("SELECT id FROM permissions WHERE category = 'HR'");
        for (const p of hrPerms) {
            await db.run(`INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [hrRole.id, p.id]);
        }
    }

    const prodRole = await db.get("SELECT id FROM roles WHERE role_name = 'Production Head'");
    if (prodRole) {
        const prodPerms = await db.all("SELECT id FROM permissions WHERE category IN ('Tasks', 'Operations')");
        for (const p of prodPerms) {
            await db.run(`INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [prodRole.id, p.id]);
        }
    }

    // Seed user_roles maps
    const uCeo = await db.get("SELECT id FROM users WHERE email = 'executive@workhub.com'");
    if (uCeo && ceoRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uCeo.id, ceoRole.id]);
    }
    const uProd = await db.get("SELECT id FROM users WHERE email = 'productionhead@workhub.com'");
    if (uProd && prodRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uProd.id, prodRole.id]);
    }

    const hrHeadRole = await db.get("SELECT id FROM roles WHERE role_name = 'HR Manager'");
    const uHr = await db.get("SELECT id FROM users WHERE email = 'hrhead@workhub.com'");
    if (uHr && hrHeadRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uHr.id, hrHeadRole.id]);
    }

    const pmRole = await db.get("SELECT id FROM roles WHERE role_name = 'Procurement Manager'");
    const uPm = await db.get("SELECT id FROM users WHERE email = 'procurementhead@workhub.com'");
    if (uPm && pmRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uPm.id, pmRole.id]);
    }

    const fmRole = await db.get("SELECT id FROM roles WHERE role_name = 'Finance Manager'");
    const uFm = await db.get("SELECT id FROM users WHERE email = 'accountshead@workhub.com'");
    if (uFm && fmRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uFm.id, fmRole.id]);
    }

    const smRole = await db.get("SELECT id FROM roles WHERE role_name = 'Sales Manager'");
    const uSm = await db.get("SELECT id FROM users WHERE email = 'saleshead@workhub.com'");
    if (uSm && smRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uSm.id, smRole.id]);
    }

    const dmRole = await db.get("SELECT id FROM roles WHERE role_name = 'Design Manager'");
    const uDm = await db.get("SELECT id FROM users WHERE email = 'designhead@workhub.com'");
    if (uDm && dmRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uDm.id, dmRole.id]);
    }

    const mmRole = await db.get("SELECT id FROM roles WHERE role_name = 'Marketing Manager'");
    const uMm = await db.get("SELECT id FROM users WHERE email = 'marketinghead@workhub.com'");
    if (uMm && mmRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uMm.id, mmRole.id]);
    }

    const empRole = await db.get("SELECT id FROM roles WHERE role_name = 'Employee'");
    const uEmp = await db.get("SELECT id FROM users WHERE email = 'employee@workhub.com'");
    if (uEmp && empRole) {
        await db.run(`INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [uEmp.id, empRole.id]);
    }

        console.log('Production Database Initialization Complete.');
    } else {
        console.log('Database already initialized. Skipping default seeding.');
    }
}

module.exports = { getDb, initDb };
