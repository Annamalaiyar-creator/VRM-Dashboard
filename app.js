// app.js - Dashboard State & Controller

// 1. Initial Mock Database State
const state = {
    activeRole: 'employee',
    checkedIn: true,
    checkInTime: '09:00 AM',
    hoursLogged: 38.5,
    attendanceRate: 98.4,
    currentUser: {
        name: 'Sarah Jenkins',
        role: 'UI/UX Designer',
        dept: 'design',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        annualLeave: 18,
        sickLeave: 4
    },
    tasks: [
        { id: 1, name: 'Redesign Project Workspace UI', assigner: 'Marcus Aurelius', assignee: 'Sarah Jenkins', dept: 'design', deadline: '2026-07-27', priority: 'high', status: 'inprogress' },
        { id: 2, name: 'Draft Figma User Journey Flow', assigner: 'Marcus Aurelius', assignee: 'Sarah Jenkins', dept: 'design', deadline: '2026-07-29', priority: 'medium', status: 'todo' },
        { id: 3, name: 'Prepare Design Critique Presentation', assigner: 'Marcus Aurelius', assignee: 'Sarah Jenkins', dept: 'design', deadline: '2026-07-31', priority: 'low', status: 'completed' },
        { id: 4, name: 'Implement API Payment Webhook', assigner: 'Sarah Jenkins', assignee: 'Alex Mercer', dept: 'dev', deadline: '2026-07-28', priority: 'high', status: 'inprogress' },
        { id: 5, name: 'Setup PostgreSQL Replication Sync', assigner: 'Sarah Jenkins', assignee: 'Alex Mercer', dept: 'dev', deadline: '2026-07-30', priority: 'medium', status: 'todo' },
        { id: 6, name: 'Run Q3 Adwords Optimization Plan', assigner: 'Dave Miller', assignee: 'Elena Rostova', dept: 'marketing', deadline: '2026-07-26', priority: 'high', status: 'overdue' },
        { id: 7, name: 'Draft Leave Approval Guidelines V2', assigner: 'MD Executive', assignee: 'HR Lead', dept: 'hr-dept', deadline: '2026-07-28', priority: 'medium', status: 'completed' }
    ],
    leaveRequests: [
        { id: 1, employee: 'Alex Mercer', type: 'Annual', duration: '3 Days', dates: 'Aug 02 - Aug 05', reason: 'Family vacation' },
        { id: 2, employee: 'Elena Rostova', type: 'Sick', duration: '1 Day', dates: 'Jul 29', reason: 'Medical checkup' }
    ],
    employees: [
        { name: 'Sarah Jenkins', dept: 'design', role: 'UI/UX Lead', status: 'Active', hours: '40h' },
        { name: 'Alex Mercer', dept: 'dev', role: 'Staff Developer', status: 'Active', hours: '42h' },
        { name: 'Elena Rostova', dept: 'marketing', role: 'Marketing Specialist', status: 'On Leave', hours: '24h' },
        { name: 'Dave Miller', dept: 'hr-dept', role: 'HR Coordinator', status: 'Active', hours: '38h' }
    ],
    alerts: [
        { id: 1, type: 'danger', message: 'Task "Run Q3 Adwords Optimization Plan" is Overdue!', time: '12h ago' },
        { id: 2, type: 'warning', message: 'API Payment Webhook deadline is in less than 24 hours.', time: '2h ago' }
    ]
};

// 2. DOM Elements Selection
const roleSelector = document.getElementById('roleSelector');
const deptSelector = document.getElementById('deptSelector');
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const checkinBtn = document.getElementById('checkinBtn');
const widgetCheckinIndicator = document.getElementById('widgetCheckinIndicator');
const widgetCheckinText = document.getElementById('widgetCheckinText');
const tasksTableBody = document.getElementById('tasksTableBody');
const tasksTableTitle = document.getElementById('tasksTableTitle');
const alertsFeed = document.getElementById('alertsFeed');

// Role Elements
const userName = document.getElementById('userName');
const userRoleBadge = document.getElementById('userRoleBadge');
const userAvatar = document.getElementById('userAvatar');

// Metrics
const metricPendingTasks = document.getElementById('metricPendingTasks');
const metricCompletedTasks = document.getElementById('metricCompletedTasks');
const metricAttendance = document.getElementById('metricAttendance');
const metricHours = document.getElementById('metricHours');

// Modals
const btnSubmitWork = document.getElementById('btnSubmitWork');
const btnRequestLeave = document.getElementById('btnRequestLeave');
const submitWorkModal = document.getElementById('submitWorkModal');
const requestLeaveModal = document.getElementById('requestLeaveModal');
const submitTaskSelect = document.getElementById('submitTaskSelect');

// Leave Requests & Directory (HR View)
const leaveRequestsTableBody = document.getElementById('leaveRequestsTableBody');
const directoryTableBody = document.getElementById('directoryTableBody');

// Forms
const taskDelegationForm = document.getElementById('taskDelegationForm');
const submitWorkForm = document.getElementById('submitWorkForm');
const requestLeaveForm = document.getElementById('requestLeaveForm');

// 3. System Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleIcon.textContent = '☀️';

    // Set default values for dates
    document.getElementById('dateSelector').value = new Date().toISOString().split('T')[0];
    document.getElementById('delegatedDeadline').value = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    document.getElementById('leaveStart').value = new Date().toISOString().split('T')[0];
    document.getElementById('leaveEnd').value = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    updateView();
}

// 4. Update view based on Selected Role and Department
function updateView() {
    const role = roleSelector.value;
    const dept = deptSelector.value;
    state.activeRole = role;

    // Apply role attribute to body for CSS selector hiding/showing
    document.body.setAttribute('data-role', role);

    // Update Profile Header based on Role
    updateProfileInfo(role);

    // Render Metrics
    renderMetrics(role, dept);

    // Render Announcement Banner content contextually
    renderAnnouncements(role);

    // Render Table Content
    renderTasksTable(role, dept);

    // Render HR Specific tables
    if (role === 'hr') {
        renderHRTables();
    }

    // Render Timeline SVG Chart
    renderTimelineChart();

    // Render Alerts
    renderAlerts();

    // Populate Submit Work Task Dropdown
    populateSubmitTaskSelect();
}

function updateProfileInfo(role) {
    if (role === 'employee') {
        state.currentUser = {
            name: 'Sarah Jenkins',
            role: 'UI/UX Designer',
            dept: 'design',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            annualLeave: 18,
            sickLeave: 4
        };
    } else if (role === 'teamlead') {
        state.currentUser = {
            name: 'Marcus Aurelius',
            role: 'Design Team Lead',
            dept: 'design',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
            annualLeave: 12,
            sickLeave: 6
        };
    } else if (role === 'hr') {
        state.currentUser = {
            name: 'Dave Miller',
            role: 'HR Specialist',
            dept: 'hr-dept',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            annualLeave: 22,
            sickLeave: 8
        };
    } else if (role === 'executive') {
        state.currentUser = {
            name: 'Velmurugan Rathinam',
            role: 'Managing Director',
            dept: 'all',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
            annualLeave: 30,
            sickLeave: 10
        };
    }

    userName.textContent = state.currentUser.name;
    userRoleBadge.textContent = state.currentUser.role;
    userAvatar.src = state.currentUser.avatar;

    // Update leave progress labels
    document.getElementById('annualLeaveCount').textContent = `${state.currentUser.annualLeave} / 25 Days Remaining`;
    document.getElementById('annualLeaveFill').style.width = `${(state.currentUser.annualLeave / 25) * 100}%`;

    document.getElementById('sickLeaveCount').textContent = `${state.currentUser.sickLeave} / 10 Days Remaining`;
    document.getElementById('sickLeaveFill').style.width = `${(state.currentUser.sickLeave / 10) * 100}%`;
}

function renderMetrics(role, dept) {
    let filteredTasks = state.tasks;
    if (dept !== 'all') {
        filteredTasks = state.tasks.filter(t => t.dept === dept);
    }

    if (role === 'employee') {
        // Show personal metrics
        const myTasks = filteredTasks.filter(t => t.assignee === state.currentUser.name);
        const pending = myTasks.filter(t => t.status !== 'completed').length;
        const completed = myTasks.filter(t => t.status === 'completed').length;

        metricPendingTasks.textContent = pending;
        metricCompletedTasks.textContent = completed;
        metricAttendance.textContent = `${state.attendanceRate}%`;
        metricHours.textContent = `${state.hoursLogged}h`;
    } else {
        // Show team/executive aggregate metrics
        const pending = filteredTasks.filter(t => t.status !== 'completed').length;
        const completed = filteredTasks.filter(t => t.status === 'completed').length;

        metricPendingTasks.textContent = pending;
        metricCompletedTasks.textContent = completed;
        metricAttendance.textContent = '95.8%';
        metricHours.textContent = `${filteredTasks.length * 15}h`; // Aggregate calc
    }
}

function renderAnnouncements(role) {
    const annTitle = document.getElementById('announcementTitle');
    const annDesc = document.getElementById('announcementDesc');
    const banner = document.getElementById('announcementBanner');

    if (role === 'employee') {
        banner.style.display = 'flex';
        annTitle.textContent = 'Figma Workspace Guidelines Released';
        annDesc.textContent = 'Designers, please review the workspace structure guidelines under the shared Drive folder before submitting deliverables.';
    } else if (role === 'teamlead') {
        banner.style.display = 'flex';
        annTitle.textContent = 'Weekly Lead Sync Scheduled';
        annDesc.textContent = 'The lead sync is moved to Thursday 2:00 PM EST. Please update your department task pipelines before the sync.';
    } else {
        banner.style.display = 'flex';
        annTitle.textContent = 'Q3 General Meeting Notice';
        annDesc.textContent = 'Our general all-hands meeting is scheduled for next Monday at 10 AM. Slides are shared in the central operations drive.';
    }
}

function renderTasksTable(role, dept) {
    tasksTableBody.innerHTML = '';
    let filteredTasks = state.tasks;

    if (dept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.dept === dept);
    }

    // Adjust table headers and row listings based on selected view role
    if (role === 'employee') {
        tasksTableTitle.textContent = 'My Assigned Tasks';
        filteredTasks = filteredTasks.filter(t => t.assignee === state.currentUser.name);
    } else {
        tasksTableTitle.textContent = 'Company Work Tracker';
    }

    if (filteredTasks.length === 0) {
        tasksTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No tasks match active criteria.</td></tr>`;
        return;
    }

    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Status Badge Selector
        const statusOptions = ['todo', 'inprogress', 'completed', 'overdue'];
        let selectHtml = `<select class="task-status-selector" data-id="${task.id}" ${role === 'hr' || role === 'executive' ? 'disabled' : ''}>`;
        statusOptions.forEach(opt => {
            const label = opt === 'inprogress' ? 'In Progress' : opt === 'todo' ? 'To Do' : opt.charAt(0).toUpperCase() + opt.slice(1);
            selectHtml += `<option value="${opt}" ${task.status === opt ? 'selected' : ''}>${label}</option>`;
        });
        selectHtml += `</select>`;

        row.innerHTML = `
            <td style="font-weight: 600;">${task.name}</td>
            <td>${role === 'employee' ? task.assigner : task.assignee}</td>
            <td>${task.deadline}</td>
            <td><span class="badge ${task.priority}">${task.priority}</span></td>
            <td>${selectHtml}</td>
        `;
        tasksTableBody.appendChild(row);
    });

    // Add task change listener
    document.querySelectorAll('.task-status-selector').forEach(selector => {
        selector.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            const newStatus = e.target.value;
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
                updateView();
            }
        });
    });
}

function renderHRTables() {
    // 1. Leave Requests
    leaveRequestsTableBody.innerHTML = '';
    if (state.leaveRequests.length === 0) {
        leaveRequestsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No pending leave requests.</td></tr>`;
    } else {
        state.leaveRequests.forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${req.employee}</td>
                <td>${req.type}</td>
                <td>${req.duration}</td>
                <td>${req.dates}</td>
                <td style="font-style: italic;">"${req.reason}"</td>
                <td>
                    <button class="btn btn-primary" onclick="approveLeave(${req.id})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Approve</button>
                    <button class="btn btn-secondary" onclick="rejectLeave(${req.id})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Reject</button>
                </td>
            `;
            leaveRequestsTableBody.appendChild(row);
        });
    }

    // 2. Directory List
    directoryTableBody.innerHTML = '';
    state.employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 600;">${emp.name}</td>
            <td><span style="text-transform: capitalize;">${emp.dept}</span></td>
            <td>${emp.role}</td>
            <td><span class="badge ${emp.status === 'Active' ? 'completed' : 'todo'}">${emp.status}</span></td>
            <td style="font-family: 'JetBrains Mono', monospace;">${emp.hours}</td>
        `;
        directoryTableBody.appendChild(row);
    });
}

function renderAlerts() {
    alertsFeed.innerHTML = '';
    state.alerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-item ${alert.type}`;
        item.innerHTML = `
            <div class="alert-info">
                <h5>${alert.message}</h5>
                <p>${alert.time}</p>
            </div>
        `;
        alertsFeed.appendChild(item);
    });
}

function populateSubmitTaskSelect() {
    submitTaskSelect.innerHTML = '';
    const myTasks = state.tasks.filter(t => t.assignee === 'Sarah Jenkins' && t.status !== 'completed');
    myTasks.forEach(task => {
        const opt = document.createElement('option');
        opt.value = task.id;
        opt.textContent = task.name;
        submitTaskSelect.appendChild(opt);
    });
}

// 5. Render Timeline SVG Chart
function renderTimelineChart() {
    const chart = document.getElementById('timelineChart');
    chart.innerHTML = '';

    // Mock trend coordinates
    const points = [
        { x: 50, y: 180, val: 65, day: 'Mon' },
        { x: 140, y: 140, val: 78, day: 'Tue' },
        { x: 230, y: 160, val: 70, day: 'Wed' },
        { x: 320, y: 90, val: 92, day: 'Thu' },
        { x: 410, y: 110, val: 85, day: 'Fri' },
        { x: 500, y: 60, val: 98, day: 'Sat' }
    ];

    // Build SVG Elements
    // Grid Lines
    const gridLines = [50, 100, 150, 200];
    gridLines.forEach(y => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '40');
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', '550');
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', 'var(--border-primary)');
        line.setAttribute('stroke-dasharray', '4,4');
        chart.appendChild(line);
    });

    // Create Path Curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--accent-primary)');
    path.setAttribute('stroke-width', '3');
    chart.appendChild(path);

    // Create fill path
    let dFill = `${d} L ${points[points.length-1].x} 210 L ${points[0].x} 210 Z`;
    const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fillPath.setAttribute('d', dFill);
    fillPath.setAttribute('fill', 'url(#chartGradient)');
    fillPath.setAttribute('opacity', '0.15');
    chart.appendChild(fillPath);

    // Gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-primary)" />
            <stop offset="100%" stop-color="var(--bg-card)" />
        </linearGradient>
    `;
    chart.appendChild(defs);

    // Draw coordinate dots & values
    points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x.toString());
        circle.setAttribute('cy', p.y.toString());
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'var(--bg-card)');
        circle.setAttribute('stroke', 'var(--accent-primary)');
        circle.setAttribute('stroke-width', '2');
        chart.appendChild(circle);

        // Value text
        const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textVal.setAttribute('x', p.x.toString());
        textVal.setAttribute('y', (p.y - 12).toString());
        textVal.setAttribute('fill', 'var(--text-primary)');
        textVal.setAttribute('font-size', '10px');
        textVal.setAttribute('font-family', 'JetBrains Mono');
        textVal.setAttribute('text-anchor', 'middle');
        textVal.textContent = `${p.val}%`;
        chart.appendChild(textVal);

        // Day label text
        const textDay = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textDay.setAttribute('x', p.x.toString());
        textDay.setAttribute('y', '225');
        textDay.setAttribute('fill', 'var(--text-secondary)');
        textDay.setAttribute('font-size', '11px');
        textDay.setAttribute('text-anchor', 'middle');
        textDay.textContent = p.day;
        chart.appendChild(textDay);
    });
}

// 6. Action Handlers & Event Listeners
function setupEventListeners() {
    roleSelector.addEventListener('change', updateView);
    deptSelector.addEventListener('change', updateView);

    // Theme Switcher
    themeToggle.addEventListener('click', () => {
        const curTheme = document.documentElement.getAttribute('data-theme');
        if (curTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleIcon.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleIcon.textContent = '☀️';
        }
    });

    // Check-In Status Action Trigger
    checkinBtn.addEventListener('click', () => {
        state.checkedIn = !state.checkedIn;
        if (state.checkedIn) {
            state.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            widgetCheckinText.textContent = `Checked In today at ${state.checkInTime}`;
            widgetCheckinIndicator.className = 'checkin-status active';
            checkinBtn.textContent = 'Check Out';
            state.hoursLogged += 0.5;
        } else {
            widgetCheckinText.textContent = 'Checked Out (Off Duty)';
            widgetCheckinIndicator.className = 'checkin-status inactive';
            checkinBtn.textContent = 'Check In';
        }
        updateView();
    });

    // Modal Triggers
    btnSubmitWork.addEventListener('click', () => openModal('submitWorkModal'));
    btnRequestLeave.addEventListener('click', () => openModal('requestLeaveModal'));

    // Forms Submissions
    taskDelegationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('delegatedTaskName').value;
        const assignee = document.getElementById('delegatedAssignee').value;
        const deadline = document.getElementById('delegatedDeadline').value;
        const priority = document.getElementById('delegatedPriority').value;

        // Map department based on assignee
        let dept = 'design';
        if (assignee.includes('Mercer')) dept = 'dev';
        if (assignee.includes('Rostova')) dept = 'marketing';

        const newTask = {
            id: state.tasks.length + 1,
            name,
            assigner: state.currentUser.name,
            assignee,
            dept,
            deadline,
            priority,
            status: 'todo'
        };

        state.tasks.push(newTask);
        taskDelegationForm.reset();
        updateView();
        alert(`Successfully assigned "${name}" to ${assignee}.`);
    });

    submitWorkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = parseInt(submitTaskSelect.value);
        const link = document.getElementById('submitLink').value;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            closeModal('submitWorkModal');
            submitWorkForm.reset();
            updateView();
            alert(`Task "${task.name}" marked as completed. Delivery Link: ${link}`);
        }
    });

    requestLeaveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('leaveType').value;
        const start = document.getElementById('leaveStart').value;
        const end = document.getElementById('leaveEnd').value;
        const reason = document.getElementById('leaveReason').value;

        const newRequest = {
            id: state.leaveRequests.length + 1,
            employee: state.currentUser.name,
            type,
            duration: 'Custom',
            dates: `${start} - ${end}`,
            reason
        };

        state.leaveRequests.push(newRequest);
        closeModal('requestLeaveModal');
        requestLeaveForm.reset();
        updateView();
        alert('Absence/Leave Request submitted to HR for approval.');
    });
}

// Global modal open/close helpers
window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// HR specific approval action hooks
window.approveLeave = function(reqId) {
    const reqIndex = state.leaveRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1) {
        const req = state.leaveRequests[reqIndex];
        // Deduct leaves
        if (req.employee === state.currentUser.name) {
            if (req.type === 'Annual') state.currentUser.annualLeave -= 1;
            else if (req.type === 'Sick') state.currentUser.sickLeave -= 1;
        }
        state.leaveRequests.splice(reqIndex, 1);
        updateView();
        alert(`Approved leave request for ${req.employee}.`);
    }
};

window.rejectLeave = function(reqId) {
    const reqIndex = state.leaveRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1) {
        const req = state.leaveRequests[reqIndex];
        state.leaveRequests.splice(reqIndex, 1);
        updateView();
        alert(`Rejected leave request for ${req.employee}.`);
    }
};
