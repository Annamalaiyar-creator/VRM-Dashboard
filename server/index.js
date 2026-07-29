// server/index.js - Express Server Entry Point
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'workhub-super-secret-token-key-2026';

app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDb().catch(err => {
    console.error('Failed to initialize database:', err);
});

// Middleware: Authenticate User
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// 1. Auth Endpoint: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                annualLeave: user.annual_leave,
                sickLeave: user.sick_leave
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Tasks API
app.get('/api/tasks', authenticateToken, async (req, res) => {
    const { dept, assignee } = req.query;
    try {
        const db = await getDb();
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];
        
        if (dept && dept !== 'all') {
            query += ' AND dept = ?';
            params.push(dept);
        }
        if (assignee) {
            query += ' AND assignee = ?';
            params.push(assignee);
        }
        
        const tasks = await db.all(query, params);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { name, assignee, deadline, priority, dept } = req.body;
    try {
        const db = await getDb();
        
        // Assert role capability (e.g. only teamleads or execs delegate)
        if (req.user.role !== 'teamlead' && req.user.role !== 'executive') {
            return res.status(403).json({ error: 'Permissions denied to delegate tasks' });
        }
        
        const result = await db.run(
            `INSERT INTO tasks (name, assigner, assignee, dept, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, 'todo')`,
            [name, req.user.name, assignee, dept, deadline, priority]
        );
        
        const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const db = await getDb();
        await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Task status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Leave Requests API
app.get('/api/leaves', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const leaves = await db.all('SELECT * FROM leaves');
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leaves', authenticateToken, async (req, res) => {
    const { type, duration, dates, reason } = req.body;
    try {
        const db = await getDb();
        await db.run(
            `INSERT INTO leaves (employee, type, duration, dates, reason, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
            [req.user.name, type, duration, dates, reason]
        );
        res.status(201).json({ message: 'Leave request created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/leaves/:id/approve', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ error: 'HR access required' });
        }
        const db = await getDb();
        const leave = await db.get('SELECT * FROM leaves WHERE id = ?', [id]);
        if (!leave) return res.status(404).json({ error: 'Leave request not found' });
        
        await db.run("UPDATE leaves SET status = 'approved' WHERE id = ?", [id]);
        
        // Deduct balances if name matches one of the user accounts
        const emp = await db.get('SELECT * FROM users WHERE name = ?', [leave.employee]);
        if (emp) {
            const leaveColumn = leave.type === 'Annual' ? 'annual_leave' : 'sick_leave';
            await db.run(`UPDATE users SET ${leaveColumn} = MAX(0, ${leaveColumn} - 1) WHERE id = ?`, [emp.id]);
        }
        
        res.json({ message: 'Leave request approved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/leaves/:id/reject', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ error: 'HR access required' });
        }
        const db = await getDb();
        await db.run("UPDATE leaves SET status = 'rejected' WHERE id = ?", [id]);
        res.json({ message: 'Leave request rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Employee Directory (HR View)
app.get('/api/users/directory', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const employees = await db.all('SELECT name, department, role, annual_leave, sick_leave FROM users');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Attendance & Logged Hours API
app.get('/api/attendance/status', authenticateToken, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const db = await getDb();
        const log = await db.get(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [req.user.id, today]
        );
        res.json({ status: log ? (log.check_out_time ? 'checkedout' : 'checkedin') : 'checkedout', log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
        const db = await getDb();
        await db.run(
            `INSERT INTO attendance (user_id, check_in_time, date) VALUES (?, ?, ?)`,
            [req.user.id, now, today]
        );
        res.json({ message: 'Checked in successfully', time: now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
        const db = await getDb();
        await db.run(
            `UPDATE attendance SET check_out_time = ? WHERE user_id = ? AND date = ?`,
            [now, req.user.id, today]
        );
        res.json({ message: 'Checked out successfully', time: now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Complaints API
app.get('/api/complaints', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const complaints = await db.all('SELECT * FROM complaints ORDER BY complaint_no DESC');
        const mapped = complaints.map(c => ({
            complaintNo: c.complaint_no,
            complaintDate: c.complaint_date,
            raisedBy: c.raised_by,
            assignedTo: c.assigned_to,
            invoiceNo: c.invoice_no,
            customerName: c.customer_name,
            customerContact: c.customer_contact,
            complaintType: c.complaint_type,
            severity: c.severity,
            description: c.description,
            status: c.status,
            slaTarget: c.sla_target,
            slaDueDate: c.sla_due_date,
            ageing: c.ageing ? parseInt(c.ageing) : 0,
            slaStatus: c.sla_status,
            customerResponse: c.customer_response,
            firstResponseDate: c.first_response_date,
            rootCauseCategory: c.root_cause_category,
            rootCauseDetails: c.root_cause_details,
            correctiveAction: c.corrective_action,
            resolutionDetails: c.resolution_details,
            resolvedDate: c.resolved_date,
            closedDate: c.closed_date,
            closureCategory: c.closure_category
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complaints', authenticateToken, async (req, res) => {
    const c = req.body;
    try {
        const db = await getDb();
        await db.run(
            `INSERT INTO complaints (
                complaint_no, complaint_date, raised_by, assigned_to, invoice_no, customer_name,
                customer_contact, complaint_type, severity, description, status, sla_target,
                sla_due_date, ageing, sla_status, customer_response, first_response_date,
                root_cause_category, root_cause_details, corrective_action, resolution_details,
                resolved_date, closed_date, closure_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                c.complaintNo || null,
                c.complaintDate || null,
                c.raisedBy || null,
                c.assignedTo || null,
                c.invoiceNo || null,
                c.customerName || null,
                c.customerContact || null,
                c.complaintType || null,
                c.severity || null,
                c.description || null,
                c.status || null,
                c.slaTarget || null,
                c.slaDueDate || null,
                c.ageing ? String(c.ageing) : '0',
                c.slaStatus || null,
                c.customerResponse || null,
                c.firstResponseDate || null,
                c.rootCauseCategory || null,
                c.rootCauseDetails || null,
                c.correctiveAction || null,
                c.resolutionDetails || null,
                c.resolvedDate || null,
                c.closedDate || null,
                c.closureCategory || null
            ]
        );
        res.status(201).json({ message: 'Complaint created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/complaints/:complaintNo', authenticateToken, async (req, res) => {
    const { complaintNo } = req.params;
    const c = req.body;
    try {
        const db = await getDb();
        
        // Fetch existing first to merge partial updates
        const existing = await db.get('SELECT * FROM complaints WHERE complaint_no = ?', [complaintNo]);
        if (!existing) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        // Helper to get value from request body, fallback to existing database value
        const getVal = (key, dbKey) => {
            const val = c[key] !== undefined ? c[key] : existing[dbKey];
            return val === undefined ? null : val;
        };

        await db.run(
            `UPDATE complaints SET 
                complaint_date = ?, raised_by = ?, assigned_to = ?, invoice_no = ?, customer_name = ?,
                customer_contact = ?, complaint_type = ?, severity = ?, description = ?, status = ?,
                sla_target = ?, sla_due_date = ?, ageing = ?, sla_status = ?, customer_response = ?,
                first_response_date = ?, root_cause_category = ?, root_cause_details = ?,
                corrective_action = ?, resolution_details = ?, resolved_date = ?, closed_date = ?,
                closure_category = ?
             WHERE complaint_no = ?`,
            [
                getVal('complaintDate', 'complaint_date'), 
                getVal('raisedBy', 'raised_by'), 
                getVal('assignedTo', 'assigned_to'), 
                getVal('invoiceNo', 'invoice_no'), 
                getVal('customerName', 'customer_name'),
                getVal('customerContact', 'customer_contact'), 
                getVal('complaintType', 'complaint_type'), 
                getVal('severity', 'severity'), 
                getVal('description', 'description'), 
                getVal('status', 'status'),
                getVal('slaTarget', 'sla_target'), 
                getVal('slaDueDate', 'sla_due_date'), 
                getVal('ageing', 'ageing') ? String(getVal('ageing', 'ageing')) : '0', 
                getVal('slaStatus', 'sla_status'), 
                getVal('customerResponse', 'customer_response'),
                getVal('firstResponseDate', 'first_response_date'), 
                getVal('rootCauseCategory', 'root_cause_category'), 
                getVal('rootCauseDetails', 'root_cause_details'),
                getVal('correctiveAction', 'corrective_action'), 
                getVal('resolutionDetails', 'resolution_details'), 
                getVal('resolvedDate', 'resolved_date'), 
                getVal('closedDate', 'closed_date'), 
                getVal('closureCategory', 'closure_category'), 
                complaintNo
            ]
        );
        res.json({ message: 'Complaint updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. CEO Role & Permission Management API (Restricted to Executive/CEO)
app.get('/api/settings/roles', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    try {
        const db = await getDb();
        const roles = await db.all('SELECT * FROM roles');
        const rolePerms = await db.all('SELECT * FROM role_permissions');
        
        // Group permission mappings by role_id
        const roleMap = roles.map(r => {
            const mappedIds = rolePerms.filter(rp => rp.role_id === r.id).map(rp => rp.permission_id);
            return {
                ...r,
                permissionIds: mappedIds
            };
        });
        res.json(roleMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings/permissions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    try {
        const db = await getDb();
        const permissions = await db.all('SELECT * FROM permissions');
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings/roles', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    const { role_name, color_code, permissionIds } = req.body;
    try {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO roles (role_name, color_code, is_system_default) VALUES (?, ?, 0)',
            [role_name, color_code || '#64748b']
        );
        const newRoleId = result.lastID;
        
        if (permissionIds && permissionIds.length > 0) {
            for (const pid of permissionIds) {
                await db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [newRoleId, pid]);
            }
        }
        res.status(201).json({ id: newRoleId, role_name, color_code, permissionIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings/roles/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    const { id } = req.params;
    const { role_name, color_code, permissionIds } = req.body;
    try {
        const db = await getDb();
        await db.run('UPDATE roles SET role_name = ?, color_code = ? WHERE id = ?', [role_name, color_code, id]);
        
        // Refresh permission mappings
        await db.run('DELETE FROM role_permissions WHERE role_id = ?', [id]);
        if (permissionIds && permissionIds.length > 0) {
            for (const pid of permissionIds) {
                await db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [id, pid]);
            }
        }
        res.json({ id, role_name, color_code, permissionIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings/user-roles', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    try {
        const db = await getDb();
        const userRoles = await db.all('SELECT * FROM user_roles');
        res.json(userRoles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings/user-roles', authenticateToken, async (req, res) => {
    if (req.user.role !== 'executive') {
        return res.status(403).json({ error: 'Access Forbidden: Role settings require CEO credentials.' });
    }
    const { user_id, roleIds } = req.body;
    try {
        const db = await getDb();
        await db.run('DELETE FROM user_roles WHERE user_id = ?', [user_id]);
        if (roleIds && roleIds.length > 0) {
            for (const rid of roleIds) {
                await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user_id, rid]);
            }
        }
        res.json({ message: 'User roles updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`WorkHub Server running on http://localhost:${PORT}`);
});
