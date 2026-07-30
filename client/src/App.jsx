import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  CircleDollarSign,
  Factory,
  ShoppingCart,
  Calendar,
  Users,
  ClipboardList,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert,
  Shield,
  Lock,
  Flame,
  Star,
  CheckCircle,
  CheckSquare,
  MapPin,
  Building2,
  TrendingUp,
  AlertTriangle,
  Info,
  DollarSign,
  Settings,
  ArrowUpRight,
  Activity,
  Clock,
  SlidersHorizontal,
  Database,
  Zap,
  Heart,
  MoreVertical,
  Save,
  Send,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : 'https://vrm-dashboard-72t8.onrender.com/api';
const CEO_EMAIL    = 'executive@workhub.com';
const CEO_PASSWORD = 'password';

/* ══════════════════════════════════════════════════
   MOCK DATA — VRM Structures India Pvt. Ltd.
══════════════════════════════════════════════════ */
const MOCK = {
  kpi: {
    revenue:      { val: '₹78.4Cr', raw: 78.4, prev: 69.2, target: 85,   pct: 92.2,  trend: 'up'   },
    netProfit:    { val: '23.7%',   raw: 23.7,  prev: 21.4, target: 25,   pct: 94.8,  trend: 'up'   },
    otd:          { val: '87.3%',   raw: 87.3,  prev: 91.2, target: 95,   pct: 91.9,  trend: 'down' },
    oee:          { val: '82.4%',   raw: 82.4,  prev: 79.8, target: 90,   pct: 91.6,  trend: 'up'   },
    poValue:      { val: '₹42.1Cr', raw: 42.1,  prev: 38.6, target: null, pct: null,  trend: 'up'   },
    criticalCount:{ val: 7,         raw: 7,     prev: 4,    target: 0,    pct: null,  trend: 'down' },
  },
  departments: [
    { id: 'purchase',    name: 'Purchase & Procurement', icon: '🛒', target: 90, achieved: 78, head: 'Ramesh Gupta',   hc: 12 },
    { id: 'production',  name: 'Production & Assembly',  icon: '🏭', target: 95, achieved: 88, head: 'Jawahir',        hc: 85 },
    { id: 'quality',     name: 'Quality Assurance',      icon: '🔬', target: 98, achieved: 94, head: 'Dr. Meena Roy',  hc: 18 },
    { id: 'dispatch',    name: 'Dispatch & Logistics',   icon: '🚛', target: 90, achieved: 72, head: 'Suresh Pillai',  hc: 22 },
    { id: 'data',        name: 'Data Management',        icon: '💾', target: 85, achieved: 91, head: 'Anita Sharma',   hc: 8  },
    { id: 'marketing',   name: 'Sales & Marketing',      icon: '📣', target: 80, achieved: 68, head: 'Kavya Nair',     hc: 31 },
  ],
  delayedOrders: [
    { id: 'VRM-2025-0142', customer: 'Tata Projects Ltd',     delayDays: 12, reason: 'Material Shortage',  status: 'Critical', value: '₹18.4L', product: 'Mini Rail 60mm' },
    { id: 'VRM-2025-0138', customer: 'L&T Construction',      delayDays: 8,  reason: 'Machine Breakdown',  status: 'High',     value: '₹24.1L', product: 'Steel Channel 100' },
    { id: 'VRM-2025-0127', customer: 'NHAI Infra Pvt Ltd',    delayDays: 6,  reason: 'Labour Shortage',    status: 'High',     value: '₹11.2L', product: 'Angle 50x50mm' },
    { id: 'VRM-2025-0119', customer: 'Shapoorji Pallonji',    delayDays: 4,  reason: 'Power Outage',       status: 'Medium',   value: '₹9.8L',  product: 'Flat Bar 100mm' },
    { id: 'VRM-2025-0114', customer: 'DLF Construction Ltd',  delayDays: 3,  reason: 'Quality Rejection',  status: 'Medium',   value: '₹7.6L',  product: 'Purlins Z-200' },
    { id: 'VRM-2025-0108', customer: 'Adani Ports & SEZ',     delayDays: 2,  reason: 'Transport Delay',    status: 'Low',      value: '₹4.2L',  product: 'MS Plate 10mm' },
    { id: 'VRM-2025-0102', customer: 'Godrej Properties',     delayDays: 1,  reason: 'Documentation',      status: 'Low',      value: '₹3.1L',  product: 'Pipe 50 NB' },
  ],
  revenue: {
    months: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
    revenue: [61,66,71,78,74,82,88,85,91,95,89,78],
    profit:  [12,14,15,18,16,20,22,21,23,24,22,19],
    expense: [49,52,56,60,58,62,66,64,68,71,67,59],
  },
  expenses: [
    { label: 'Raw Material Purchase', val: '43', pct: 66.2, color: 'url(#coralGradient)' },
    { label: 'Employee Cost',         val: '8.7', pct: 13.4, color: '#FEF5E7' },
    { label: 'Manufacturing O/H',     val: '6.4', pct: 9.9, color: '#FFE4E1' },
    { label: 'Admin & Overheads',     val: '4.1', pct: 6.3, color: '#E6E6FA' },
    { label: 'Selling & Marketing',   val: '2.7', pct: 4.2, color: '#F0F3FF' },
  ],
  alerts: [
    { id: 1, priority: 'Critical', icon: '🚨', title: '16 production orders delayed beyond SLA',           dept: 'Production',  time: '2 min ago' },
    { id: 2, priority: 'Critical', icon: '🚨', title: 'Critical material shortage — Mini Rail 60mm (0 stock)', dept: 'Purchase', time: '15 min ago' },
    { id: 3, priority: 'Critical', icon: '🚨', title: '14 Purchase Orders overdue beyond payment terms',   dept: 'Finance',     time: '1 hour ago' },
    { id: 4, priority: 'High',     icon: '⚠️', title: 'Machine CNC-02 breakdown on Line 3 — Est. 6hr downtime', dept: 'Production', time: '2 hours ago' },
    { id: 5, priority: 'High',     icon: '⚠️', title: 'OTD dropped 3.9% vs last month — Dispatch target at risk', dept: 'Dispatch', time: '3 hours ago' },
    { id: 6, priority: 'Medium',   icon: '📋', title: '7 high-value PO approvals pending CEO sign-off',   dept: 'Purchase',    time: 'Today 9:00 AM' },
    { id: 7, priority: 'Medium',   icon: '👥', title: '11 employee leave requests pending HR approval',    dept: 'HR',          time: 'Today 8:30 AM' },
  ],
  approvals: [
    { id: 1, type: 'PO Approval',        title: 'PO #VRM-PO-24087 — SAIL Steel',       amount: '₹18.4L', desc: 'Purchase of 200MT HR Coils — Delivery 15 Aug 2025. Vendor: SAIL Ltd. Payment: 30 days credit.', dept: 'Purchase', urgency: 'high' },
    { id: 2, type: 'PO Approval',        title: 'PO #VRM-PO-24091 — Atlas Copco',      amount: '₹6.2L',  desc: 'Pneumatic compressor spares for Line 2 maintenance. Required before Aug 10 for scheduled PM.', dept: 'Production', urgency: 'high' },
    { id: 3, type: 'Deadline Override',  title: 'Order VRM-2025-0138 — L&T Extension', amount: null,      desc: 'L&T Construction requesting 5-day extension on steel channel order due to site access delay.', dept: 'Dispatch', urgency: 'medium' },
    { id: 4, type: 'Budget Approval',    title: 'Marketing Campaign Q3 FY26',          amount: '₹3.8L',  desc: 'LinkedIn + trade magazine campaign for structural steel products targeting infra sector. ROI est: 8x.', dept: 'Marketing', urgency: 'low' },
  ],
  machines: [
    { name: 'Cutting Line 1',    avail: 96.2, perf: 88.4, qual: 99.1, oee: 84.2, status: 'Running' },
    { name: 'Cutting Line 2',    avail: 91.8, perf: 84.0, qual: 98.7, oee: 76.2, status: 'Running' },
    { name: 'CNC Press L3',      avail: 0,    perf: 0,    qual: 0,    oee: 0,    status: 'Breakdown' },
    { name: 'Roll Form L4',      avail: 97.4, perf: 91.2, qual: 99.4, oee: 88.1, status: 'Running' },
    { name: 'Welding Station',   avail: 88.6, perf: 79.3, qual: 97.8, oee: 68.9, status: 'Slow' },
    { name: 'Galvanizing Line',  avail: 94.1, perf: 86.7, qual: 98.9, oee: 80.9, status: 'Running' },
  ],
  production: {
    products: ['Mini Rail 60mm','Steel Channel 100','Angle 50x50','Flat Bar 100','Purlins Z-200','MS Plate 10mm'],
    plan:     [1200, 800, 650, 540, 480, 320],
    actual:   [1080, 760, 610, 510, 398, 310],
  },
  vendors: [
    { name: 'SAIL Ltd',             material: 'HR Coils / Billets',    score: 4.8, poValue: '₹12.4Cr', onTime: '94%', status: 'Active' },
    { name: 'Tata Steel Ltd',       material: 'CR Sheets / Plates',    score: 4.7, poValue: '₹9.8Cr',  onTime: '91%', status: 'Active' },
    { name: 'JSW Steel',            material: 'Galvanized Coils',      score: 4.5, poValue: '₹7.2Cr',  onTime: '88%', status: 'Active' },
    { name: 'Vedanta Resources',    material: 'Zinc / Alloys',         score: 3.9, poValue: '₹4.1Cr',  onTime: '78%', status: 'Review' },
    { name: 'Atlas Copco India',    material: 'Machine Spares',        score: 4.6, poValue: '₹2.8Cr',  onTime: '92%', status: 'Active' },
    { name: 'Bharat Petroleum',     material: 'Diesel / Lubricants',   score: 4.2, poValue: '₹1.9Cr',  onTime: '96%', status: 'Active' },
  ],
  inventory: [
    { code: 'RM-001', name: 'HR Coil 2.5mm',       category: 'Raw Material', qty: 48.2, unit: 'MT',  reorder: 50,  status: 'Low' },
    { code: 'RM-002', name: 'Mini Rail 60mm Stock', category: 'Raw Material', qty: 0,    unit: 'MT',  reorder: 20,  status: 'Critical' },
    { code: 'RM-003', name: 'CR Sheet 1.6mm',       category: 'Raw Material', qty: 124,  unit: 'MT',  reorder: 40,  status: 'OK' },
    { code: 'FG-001', name: 'Steel Channel 100',    category: 'Finished Goods', qty: 312, unit: 'Nos', reorder: 100, status: 'OK' },
    { code: 'FG-002', name: 'Angle 50x50mm',        category: 'Finished Goods', qty: 68,  unit: 'MT',  reorder: 80,  status: 'Low' },
    { code: 'SP-001', name: 'CNC Tooling Set',      category: 'Spare Parts',  qty: 2,    unit: 'Set', reorder: 3,   status: 'Low' },
    { code: 'SP-002', name: 'Welding Electrodes',   category: 'Spare Parts',  qty: 840,  unit: 'Kg',  reorder: 200, status: 'OK' },
  ],
  employees: [
    { dept: 'Production',  hc: 85, present: 78, onLeave: 4, absent: 3, attendance: 91.8 },
    { dept: 'Purchase',    hc: 12, present: 11, onLeave: 1, absent: 0, attendance: 100  },
    { dept: 'Quality',     hc: 18, present: 16, onLeave: 2, absent: 0, attendance: 88.9 },
    { dept: 'Dispatch',    hc: 22, present: 19, onLeave: 2, absent: 1, attendance: 86.4 },
    { dept: 'Marketing',   hc: 31, present: 28, onLeave: 2, absent: 1, attendance: 90.3 },
    { dept: 'Finance',     hc: 14, present: 14, onLeave: 0, absent: 0, attendance: 100  },
    { dept: 'HR & Admin',  hc: 10, present: 9,  onLeave: 1, absent: 0, attendance: 90.0 },
    { dept: 'Data Mgmt',   hc: 8,  present: 8,  onLeave: 0, absent: 0, attendance: 100  },
  ],
};

/* ════════════════════════════════════════════
   SVG CHART COMPONENTS
════════════════════════════════════════════ */

/* Mini Sparkline */
function Sparkline({ data, color = '#1E3A8A', w = 80, h = 32 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const toX = (i) => (i / (data.length - 1)) * w;
  const toY = (v) => h - ((v - min) / Math.max(max - min, 0.001)) * h;
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block', marginTop: 4 }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function ProfitLossChart() {
  const W = 500, H = 220, pL = 36, pR = 12, pT = 20, pB = 30;
  const maxVal = 100;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const profit = [35, 42, 38, 48, 52, 64, 58, 44];
  const loss   = [18, 22, 14, 20, 24, 30, 26, 16];
  
  const step   = (W - pL - pR) / months.length;
  const barW   = step * 0.24;
  const toX    = (i) => pL + i * step + step / 2;
  const toY    = (v) => H - pB - ((v / maxVal) * (H - pT - pB));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      <defs>
        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5E3A" stopOpacity="1"/>
          <stop offset="100%" stopColor="#ff7e5f" stopOpacity="0.85"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={pL} y1={toY(v)} x2={W - pR} y2={toY(v)} stroke="#f3f4f6" strokeWidth="1"/>
          <text x={pL - 8} y={toY(v) + 3} fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="Montserrat">{v > 0 ? `${v}k` : '0'}</text>
        </g>
      ))}
      {/* Profit bars */}
      {profit.map((v, i) => (
        <rect key={`p${i}`} x={toX(i) - barW - 1} y={toY(v)} width={barW} height={H - pB - toY(v)}
          fill="url(#profitGrad)" rx="2"/>
      ))}
      {/* Loss bars */}
      {loss.map((v, i) => (
        <rect key={`l${i}`} x={toX(i) + 1} y={toY(v)} width={barW} height={H - pB - toY(v)}
          fill="#111827" rx="2"/>
      ))}
      {/* X Labels */}
      {months.map((m, i) => (
        <text key={i} x={toX(i)} y={H - 8} fill="#9ca3af" fontSize="9" textAnchor="middle" fontFamily="Montserrat" fontWeight="500">{m}</text>
      ))}
    </svg>
  );
}

/* Revenue / Expense Bar Chart + Profit Line */
function RevenueChart({ data }) {
  const W = 640, H = 230, pL = 52, pR = 20, pT = 20, pB = 36;
  const maxRev = 110;
  const months = data.months;
  const step   = (W - pL - pR) / months.length;
  const barW   = step * 0.32;
  const toX    = (i) => pL + i * step + step / 2;
  const toRevY = (v) => H - pB - ((v / maxRev) * (H - pT - pB));
  const profitPath = data.profit.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toRevY(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={pL} y1={toRevY(v)} x2={W - pR} y2={toRevY(v)} stroke="#e2e8f0" strokeDasharray="4 4"/>
          <text x={pL - 6} y={toRevY(v) + 4} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="Montserrat">{v}</text>
        </g>
      ))}
      {/* Revenue bars */}
      {data.revenue.map((v, i) => (
        <rect key={`r${i}`} x={toX(i) - barW - 1} y={toRevY(v)} width={barW} height={H - pB - toRevY(v)}
          fill="url(#revGrad)" rx="3"/>
      ))}
      {/* Expense bars */}
      {data.expense.map((v, i) => (
        <rect key={`e${i}`} x={toX(i) + 1} y={toRevY(v)} width={barW} height={H - pB - toRevY(v)}
          fill="url(#expGrad)" rx="3"/>
      ))}
      {/* Profit line */}
      <path d={profitPath} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.profit.map((v, i) => (
        <circle key={`p${i}`} cx={toX(i)} cy={toRevY(v)} r="3.5" fill="white" stroke="#22C55E" strokeWidth="2"/>
      ))}
      {/* X Labels */}
      {months.map((m, i) => (
        <text key={i} x={toX(i)} y={H - 4} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="Montserrat">{m}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.pct, 0);
  const W = 240, cx = 120, cy = 120, r = 80, sw = 42;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;
  
  const slices = data.map((d, i) => {
    const start = cumPct;
    cumPct += d.pct / total;
    
    // Calculate gap for flat segment cuts (strokeLinecap="butt")
    const gap = 2.5; // gap in degrees
    const gapLen = (gap / 360) * circ;
    const dashLen = (d.pct / total) * circ - gapLen;
    
    return { 
      ...d, 
      start,
      dashLen: Math.max(2, dashLen),
      dashOffset: circ - start * circ,
      isDominant: i === 0
    };
  });

  // Start rotation at 70 degrees clockwise from top to match the reference image orientation exactly
  const startRotation = 70;

  return (
    <svg viewBox={`0 0 ${W} ${W}`} width={W} height={W} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#e84f35" />
        </linearGradient>
      </defs>
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.dashLen} ${circ - s.dashLen}`}
          strokeDashoffset={s.dashOffset}
          transform={`rotate(${-90 + startRotation} ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}
      {slices.map((s, i) => {
        // Calculate mid-angle in radians (shifted by startRotation)
        const startAngle = -Math.PI / 2 + (startRotation * Math.PI / 180) + (s.start * 2 * Math.PI);
        const sliceAngle = (s.pct / total) * 2 * Math.PI;
        const centerAngle = startAngle + sliceAngle / 2;
        const tx = cx + r * Math.cos(centerAngle);
        const ty = cy + r * Math.sin(centerAngle);
        
        // Format text with comma instead of dot
        const formattedVal = s.val.toString().replace('.', ',');

        if (s.isDominant) {
          return (
            <g key={i}>
              <rect x={tx - 16} y={ty - 11} width={32} height={22} rx="6" fill="#000000" />
              <text x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff" fontFamily="Inter, sans-serif">{formattedVal}</text>
            </g>
          );
        } else {
          return (
            <text key={i} x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#374151" fontFamily="Inter, sans-serif">{formattedVal}</text>
          );
        }
      })}
    </svg>
  );
}

/* Horizontal Production Plan vs Actual */
function ProductionChart({ data }) {
  const W = 500, H = 220, pL = 120, pR = 20, barH = 14, gap = 16;
  const maxVal = Math.max(...data.plan);
  const toW = (v) => ((v / maxVal) * (W - pL - pR));
  const yBase = (i) => 10 + i * (barH * 2 + gap);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {data.products.map((p, i) => (
        <g key={i}>
          <text x={pL - 6} y={yBase(i) + barH} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="Montserrat" fontWeight="600">{p}</text>
          {/* Plan bar */}
          <rect x={pL} y={yBase(i)} width={toW(data.plan[i])} height={barH} rx="3" fill="#e2e8f0"/>
          <text x={pL + toW(data.plan[i]) + 4} y={yBase(i) + barH - 2} fill="#94a3b8" fontSize="9" fontFamily="Montserrat">{data.plan[i]}</text>
          {/* Actual bar */}
          <rect x={pL} y={yBase(i) + barH + 2} width={toW(data.actual[i])} height={barH} rx="3"
            fill={data.actual[i] / data.plan[i] >= 0.9 ? '#22C55E' : data.actual[i] / data.plan[i] >= 0.75 ? '#F59E0B' : '#EF4444'}/>
          <text x={pL + toW(data.actual[i]) + 4} y={yBase(i) + barH * 2 + 2} fill="#64748b" fontSize="9" fontFamily="Montserrat">{data.actual[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════════
   UTILITY HELPERS
════════════════════════════════════════════ */
const getKpiColor = (pct) =>
  pct === null ? 'navy' : pct >= 90 ? 'green' : pct >= 70 ? 'amber' : 'red';

const getDeptColor = (ach, tgt) => {
  const r = (ach / tgt) * 100;
  return r >= 90 ? 'green' : r >= 70 ? 'amber' : 'red';
};

const statusBadgeClass = (s) => ({
  Critical: 'badge-critical', High: 'badge-critical',
  Medium: 'badge-attention', Low: 'badge-navy', Active: 'badge-on-target',
  Review: 'badge-attention', Breakdown: 'badge-critical',
  Slow: 'badge-attention', Running: 'badge-on-target',
  OK: 'badge-on-target',
}[s] || 'badge-navy');

const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const nowDate = () => new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/* ════════════════════════════════════════════
   DRILL-DOWN MODAL
════════════════════════════════════════════ */
function DrillModal({ open, onClose, title, subtitle, children }) {
  return (
    <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box wide">
        <div className="modal-header">
          <div className="modal-title-row">
            <div>
              <div className="modal-title">{title}</div>
              {subtitle && <div className="modal-sub">{subtitle}</div>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   APPROVAL DRAWER
════════════════════════════════════════════ */
function ApprovalsTab() {
  const [confirmModal, setConfirmModal] = React.useState(null); // { type: 'approve' | 'reject', item }

  return (
    <>
      <div className="card card-table-container">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe red"></div>
            <div>
              <div className="card-title">⚡ Pending CEO Approvals</div>
              <div className="card-sub">{MOCK.approvals.length} items awaiting your action</div>
            </div>
          </div>
        </div>
        
        <div className="card-body-flush" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {MOCK.approvals.map(a => (
              <div className="approval-item" key={a.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <span className={`badge ${a.urgency === 'high' ? 'badge-critical' : a.urgency === 'medium' ? 'badge-attention' : 'badge-navy'}`}>{a.type}</span>
                    {a.amount && <span style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-h)' }}>{a.amount}</span>}
                  </div>
                  <div className="approval-item-title" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-h)', marginTop: '8px' }}>{a.title}</div>
                  <div className="approval-item-desc" style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '4px', lineHeight: 1.4 }}>{a.desc}</div>
                </div>
                <div className="approval-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-success btn-sm" 
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 600 }} 
                    onClick={() => setConfirmModal({ type: 'approve', item: a })}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 600 }} 
                    onClick={() => setConfirmModal({ type: 'reject', item: a })}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="table-pagination-footer">
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Go to page: <input type="text" value="1" readOnly style={{ width: '28px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
            <span>Show rows: <strong>10</strong></span>
            <span>1-{MOCK.approvals.length} of {MOCK.approvals.length}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="table-icon-btn" style={{ padding: '4px' }}>&lt;</button>
              <button className="table-icon-btn" style={{ padding: '4px' }}>&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <>
          <div 
            onClick={() => setConfirmModal(null)} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 9999 }} 
          />
          <div 
            style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: '380px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              boxShadow: 'var(--shadow-navy)', 
              zIndex: 10000, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              textAlign: 'center' 
            }}
          >
            <div style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{confirmModal.type === 'approve' ? '✅' : '❌'}</div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.35rem' }}>
                Confirm {confirmModal.type === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.45, padding: '0 0.5rem' }}>
                Are you sure you want to {confirmModal.type === 'approve' ? 'approve' : 'reject'} the request for <strong>{confirmModal.item.title}</strong>?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ flex: 1, padding: '10px', fontSize: '0.78rem', fontWeight: 600 }} 
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${confirmModal.type === 'approve' ? 'btn-success' : 'btn-danger'} btn-sm`} 
                style={{ flex: 1, padding: '10px', fontSize: '0.78rem', fontWeight: 600 }} 
                onClick={() => {
                  alert(`${confirmModal.type === 'approve' ? 'Approved' : 'Rejected'}: ${confirmModal.item.title}`);
                  setConfirmModal(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
/* ════════════════════════════════════════════
   CEO-ONLY ROLE & PERMISSION MANAGEMENT SYSTEM
   (Discord-Style RBAC Panel)
   Restricted to user.role === 'executive'
════════════════════════════════════════════ */
function RolesTab({ directory = [], currentUserRole, token }) {
  const authHeader = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

  const [roles, setRoles] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);
  const [userRoles, setUserRoles] = React.useState([]);
  
  const [selectedRoleId, setSelectedRoleId] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('#64748b');
  const [editPermIds, setEditPermIds] = React.useState([]);
  const [hasChanges, setHasChanges] = React.useState(false);
  
  const [activeAccordion, setActiveAccordion] = React.useState('Financials');
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 1. Fetch Roles, Permissions & User Mappings
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes, urRes] = await Promise.all([
        fetch(`${API}/settings/roles`, { headers: authHeader() }),
        fetch(`${API}/settings/permissions`, { headers: authHeader() }),
        fetch(`${API}/settings/user-roles`, { headers: authHeader() })
      ]);

      if (rRes.status === 403 || pRes.status === 403) {
        throw new Error('403 Forbidden: CEO Access Required.');
      }
      
      const rData = await rRes.json();
      const pData = await pRes.json();
      const urData = await urRes.json();
      
      setRoles(rData);
      setPermissions(pData);
      setUserRoles(urData);
      
      if (rData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rData[0].id);
        setEditName(rData[0].role_name);
        setEditColor(rData[0].color_code);
        setEditPermIds(rData[0].permissionIds || []);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentUserRole === 'executive') {
      fetchData();
    }
  }, [currentUserRole]);

  // Handle selected role switch
  const selectRole = (role) => {
    setSelectedRoleId(role.id);
    setEditName(role.role_name);
    setEditColor(role.color_code);
    setEditPermIds(role.permissionIds || []);
    setHasChanges(false);
  };

  const handleNameChange = (val) => {
    setEditName(val);
    setHasChanges(true);
  };

  const handleColorChange = (hex) => {
    setEditColor(hex);
    setHasChanges(true);
  };

  const togglePermission = (permId) => {
    let updated;
    if (editPermIds.includes(permId)) {
      updated = editPermIds.filter(id => id !== permId);
    } else {
      updated = [...editPermIds, permId];
    }
    setEditPermIds(updated);
    setHasChanges(true);
  };

  // Reset modifications
  const handleReset = () => {
    const current = roles.find(r => r.id === selectedRoleId);
    if (current) {
      setEditName(current.role_name);
      setEditColor(current.color_code);
      setEditPermIds(current.permissionIds || []);
      setHasChanges(false);
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`${API}/settings/roles/${selectedRoleId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({
          role_name: editName,
          color_code: editColor,
          permissionIds: editPermIds
        })
      });
      if (!res.ok) throw new Error('Failed to update role');
      const updated = await res.json();
      
      // Update local state
      setRoles(roles.map(r => r.id === selectedRoleId ? { ...r, role_name: editName, color_code: editColor, permissionIds: editPermIds } : r));
      setHasChanges(false);
      alert('Role permissions saved successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Create new role
  const handleCreateNewRole = async () => {
    const newName = prompt('Enter name for the new role:');
    if (!newName) return;
    try {
      const res = await fetch(`${API}/settings/roles`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          role_name: newName,
          color_code: '#8b5cf6',
          permissionIds: []
        })
      });
      if (!res.ok) throw new Error('Failed to create role');
      const newRole = await res.json();
      
      setRoles([...roles, newRole]);
      selectRole(newRole);
      alert(`Role "${newName}" created successfully.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Assign user roles
  const handleUserRoleToggle = async (userId, roleId, isAssigned) => {
    const userRoleMappings = userRoles.filter(ur => ur.user_id === userId);
    let updatedRoleIds = userRoleMappings.map(ur => ur.role_id);
    
    if (isAssigned) {
      updatedRoleIds = [...updatedRoleIds, roleId];
    } else {
      updatedRoleIds = updatedRoleIds.filter(id => id !== roleId);
    }
    
    try {
      const res = await fetch(`${API}/settings/user-roles`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          user_id: userId,
          roleIds: updatedRoleIds
        })
      });
      if (!res.ok) throw new Error('Failed to update user assignments');
      
      // Refresh local userRoles state
      const freshUr = await fetch(`${API}/settings/user-roles`, { headers: authHeader() }).then(r => r.json());
      setUserRoles(freshUr);
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Render 403 Forbidden Access Denied for other roles
  if (currentUserRole !== 'executive') {
    return (
      <div className="card" style={{ padding: '5rem 3rem', textAlign: 'center', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        <div style={{ background: '#fee2e2', color: '#ef4444', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
          <Lock size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>403 Access Forbidden</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Security Warning: This console contains cryptographic keys and system authorization maps. Access is restricted exclusively to the **Chief Executive Officer (CEO)**.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>Loading security schema...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--red)' }}>Error: {error}</div>;

  // Group permissions
  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <>
      <div style={{ display: 'flex', gap: '1.5rem', minHeight: '560px', alignItems: 'stretch' }}>
        
        {/* LEFT PANEL: ROLE SELECTOR */}
        <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '1rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Roles</span>
            <button 
              onClick={handleCreateNewRole}
              style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              + Create
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {roles.map(r => {
              const membersCount = userRoles.filter(ur => ur.role_id === r.id).length;
              const isActive = r.id === selectedRoleId;
              return (
                <div 
                  key={r.id} 
                  onClick={() => selectRole(r)}
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    background: isActive ? 'var(--bg-app)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color_code }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 700, color: isActive ? 'var(--text-h)' : 'var(--text-body)' }}>{r.role_name}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {membersCount} {membersCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setShowAssignModal(true)}
            className="btn btn-secondary btn-sm btn-block" 
            style={{ marginTop: '1rem', padding: '10px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Users size={16} /> Manage User Roles
          </button>
        </div>

        {/* RIGHT PANEL: ROLE CONFIGURATOR */}
        {selectedRole ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Header Settings */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Role Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => handleNameChange(e.target.value)} 
                  style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', width: '100%', border: 'none', borderBottom: '1px solid transparent', padding: '2px 0', background: 'transparent' }} 
                  placeholder="Enter role name..."
                />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Role Color</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#ff5a5f', '#22c55e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#64748b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => handleColorChange(c)}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: c, 
                        border: editColor === c ? '2px solid var(--text-h)' : '1px solid rgba(0,0,0,0.1)', 
                        cursor: 'pointer',
                        transform: editColor === c ? 'scale(1.15)' : 'none',
                        transition: 'transform 0.1s'
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible Accordions & Permissions */}
            <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto', paddingBottom: hasChanges ? '80px' : '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.keys(groupedPerms).map(catName => {
                  const isOpen = activeAccordion === catName;
                  return (
                    <div key={catName} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => setActiveAccordion(isOpen ? '' : catName)}
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          background: 'var(--bg-app)', 
                          border: 'none', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: 'var(--text-h)'
                        }}
                      >
                        <span>{catName} Permissions</span>
                        <span>{isOpen ? '▲' : '▼'}</span>
                      </button>
                      
                      {isOpen && (
                        <div style={{ padding: '12px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {groupedPerms[catName].map(p => {
                            const isToggled = editPermIds.includes(p.id);
                            return (
                              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-h)' }}>{p.permission_key}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>{p.description}</div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => togglePermission(p.id)}
                                  style={{
                                    width: '38px',
                                    height: '20px',
                                    borderRadius: '99px',
                                    background: isToggled ? '#22c55e' : '#cbd5e1',
                                    position: 'relative',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s',
                                    flexShrink: 0
                                  }}
                                >
                                  <span 
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      left: isToggled ? '20px' : '2px',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      background: '#fff',
                                      transition: 'left 0.15s',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STICKY BOTTOM SAVE CHANGES BAR */}
            {hasChanges && (
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '12px', 
                  left: '12px', 
                  right: '12px', 
                  background: '#1e293b', 
                  borderRadius: '10px', 
                  padding: '12px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  zIndex: 10
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>Careful — you have unsaved changes!</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleReset}
                    style={{ background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSaveChanges}
                    style={{ background: '#22c55e', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="card" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-sub)' }}>
            Select a role from the left panel to configure its security keys.
          </div>
        )}
      </div>

      {/* USER ASSIGNMENT MODAL */}
      {showAssignModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(15, 23, 42, 0.65)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 11000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            style={{ 
              width: '520px', 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              boxShadow: 'var(--shadow-navy)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              maxHeight: '80vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} /> User Role Assignment
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Search employee names..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}
            />

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {directory
                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(u => {
                  const mappings = userRoles.filter(ur => ur.user_id === u.id);
                  return (
                    <div 
                      key={u.id} 
                      style={{ 
                        padding: '12px', 
                        borderRadius: '10px', 
                        border: '1px solid var(--border)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'var(--bg-app)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-h)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.role} · {u.department || u.dept || 'N/A'}</div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', maxWidth: '240px' }}>
                        {roles.map(r => {
                          const isAssigned = mappings.some(m => m.role_id === r.id);
                          return (
                            <label 
                              key={r.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.68rem', 
                                fontWeight: 700,
                                background: isAssigned ? r.color_code + '15' : 'transparent',
                                border: `1px solid ${isAssigned ? r.color_code : 'var(--border)'}`,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: isAssigned ? r.color_code : 'var(--text-muted)'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isAssigned} 
                                onChange={e => handleUserRoleToggle(u.id, r.id, e.target.checked)}
                                style={{ margin: 0, width: '12px', height: '12px' }}
                              />
                              {r.role_name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <button 
              onClick={() => setShowAssignModal(false)}
              className="btn btn-primary btn-block"
              style={{ padding: '12px', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Done Managing Roles
            </button>
          </div>
        </div>
      )}
    </>
  );
}
/* ════════════════════════════════════════════
   SYSTEM SETTINGS PAGE COMPONENT
════════════════════════════════════════════ */
function SettingsTab({ currentUserRole, directory, token, activeSubTab, setActiveSubTab }) {
  const [orgName, setOrgName] = React.useState('VRM Structures India Pvt. Ltd.');
  const [currency, setCurrency] = React.useState('INR (₹)');
  const [timezone, setTimezone] = React.useState('Asia/Kolkata (GMT+5:30)');
  const [mfaEnabled, setMfaEnabled] = React.useState(false);
  const [sessionLimit, setSessionLimit] = React.useState('30d');
  const [notifEmail, setNotifEmail] = React.useState(true);
  const [notifSlack, setNotifSlack] = React.useState(false);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', minHeight: '520px' }}>
      
      {/* Right panel config container */}
      {activeSubTab === 'roles' ? (
        <RolesTab directory={directory} currentUserRole={currentUserRole} token={token} />
      ) : (
        <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeSubTab === 'general' && (
          <>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.25rem' }}>General Settings</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Manage organization metadata, corporate naming, and global UI preferences.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Organization Name</label>
                <input 
                  type="text" 
                  value={orgName} 
                  onChange={e => setOrgName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-body)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Reporting Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-body)' }}
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - United States Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>System Timezone</label>
                <input 
                  type="text" 
                  value={timezone} 
                  disabled
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', background: '#f8fafc', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-h)' }}>Notification Subscriptions</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-body)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} />
                  Enable Email Reports
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-body)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifSlack} onChange={e => setNotifSlack(e.target.checked)} />
                  Enable Slack Webhooks
                </label>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>Reset</button>
              <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={() => alert('General settings updated successfully.')}>Save Changes</button>
            </div>
          </>
        )}

        {activeSubTab === 'security' && (
          <>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.25rem' }}>Security Policies</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Adjust system authentication rules, MFA prompts, and user session expiry caps.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-h)' }}>Two-Factor Authentication (MFA)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>Enforce TOTP validation on employee sign-in attempts.</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '99px',
                    background: mfaEnabled ? '#22c55e' : '#cbd5e1',
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: mfaEnabled ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.15s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Remember-Me Expiry Cap</label>
                <select 
                  value={sessionLimit} 
                  onChange={e => setSessionLimit(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-body)' }}
                >
                  <option value="7d">7 Days Session Expiry</option>
                  <option value="30d">30 Days Session Expiry</option>
                  <option value="90d">90 Days Session Expiry</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={() => alert('Security credentials updated successfully.')}>Save Changes</button>
            </div>
          </>
        )}

        {activeSubTab === 'database' && (
          <>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.25rem' }}>Database & Engine Status</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Monitor SQLite connection pools and data pipeline orchestration health.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Engine Type</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>SQLite 3.x (Local)</div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>DB Connection Status</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--green)', marginTop: '4px' }}>● Connected</div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Total Active Users Seeded</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>6 Operator Profiles</div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Storage Size</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>~164 KB</div>
              </div>
            </div>

            {currentUserRole === 'executive' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-h)', marginBottom: '8px' }}>Database Maintenance Options</div>
                <button 
                  className="btn btn-danger btn-sm"
                  style={{ padding: '10px 16px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    const confirmSeed = confirm("Are you sure you want to trigger database re-seeding? This resets user roles, tables, and test tasks to default values.");
                    if (confirmSeed) {
                      alert("Database re-seeded successfully!");
                    }
                  }}
                >
                  <ShieldAlert size={16} /> Re-Seed Production Database
                </button>
              </div>
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TAB PANELS
════════════════════════════════════════════ */

/* ── Tab 0: Employee Dashboard ── */
function EmployeeDashboardTab({ user }) {
  const [clockedIn, setClockedIn] = React.useState(true);
  const [punchTime, setPunchTime] = React.useState('08:30 AM');
  const [tasks, setTasks] = React.useState([
    { id: 101, task: 'Follow up on Tata Projects order payment clearance', deadline: 'Today 5:00 PM', status: 'In Progress' },
    { id: 102, task: 'Schedule introduction call with new Delhi distributor', deadline: 'Tomorrow 10:00 AM', status: 'Pending' },
    { id: 103, task: 'Prepare draft sales contract for JSW structural steel order', deadline: 'Today 6:00 PM', status: 'Pending' }
  ]);
  const [leaveType, setLeaveType] = React.useState('Annual');
  const [leaveDays, setLeaveDays] = React.useState('1');
  
  const toggleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
      setPunchTime(null);
    } else {
      setClockedIn(true);
      const now = new Date();
      setPunchTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    alert(`Leave request for ${leaveDays} day(s) of ${leaveType} Leave submitted successfully to HR!`);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
  };

  return (
    <>


      <div className="finexy-grid-3">
        {/* Column 1: Shift & Attendance Clock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.75rem' }}>Attendance Punch</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: clockedIn ? 'var(--green)' : 'var(--text-muted)', marginTop: '2px' }}>
                  {clockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
                </div>
              </div>
              {clockedIn && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Shift Entry</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-h)', marginTop: '2px' }}>{punchTime}</div>
                </div>
              )}
            </div>

            <button 
              onClick={toggleClock}
              className={`btn ${clockedIn ? 'btn-danger' : 'btn-primary'} btn-block`}
              style={{ padding: '12px', fontWeight: 600 }}
            >
              {clockedIn ? 'Punch Out & End Shift' : 'Punch In & Begin Shift'}
            </button>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.75rem' }}>Personal Leave Balances</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Annual Leave</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>{user?.annualLeave || 18}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>Days Left</div>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-app)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Sick Leave</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>{user?.sickLeave || 4}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>Days Left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Assigned Operator Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.75rem' }}>My Assigned Tasks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => toggleTask(t.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: t.status === 'Completed' ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={t.status === 'Completed'} 
                    readOnly 
                    style={{ marginTop: '3px', pointerEvents: 'none' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 600, 
                      color: t.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-h)',
                      textDecoration: t.status === 'Completed' ? 'line-through' : 'none'
                    }}>
                      {t.task}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                      Deadline: {t.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Request Leave Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.75rem' }}>Apply for Leave</div>
            <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Leave Category</label>
                <select 
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-body)' }}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Duration (Days)</label>
                <input 
                  type="number"
                  min="1"
                  max="10"
                  value={leaveDays}
                  onChange={e => setLeaveDays(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-body)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Reason / Notes</label>
                <textarea 
                  rows="3"
                  placeholder="Provide details about leave reason..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-body)', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ padding: '10px', fontSize: '0.78rem', fontWeight: 600 }}>
                Submit Leave Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab 0.1: Complaint Entry Form ── */
function ComplaintEntryTab({ subTab, setSubTab, user }) {
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedComplaint, setSelectedComplaint] = React.useState(null);
  const [salesConfirm, setSalesConfirm] = React.useState({ show: false, status: 'Open' });
  const [salesEditComplaint, setSalesEditComplaint] = React.useState(null);
  const [prodEditComplaint, setProdEditComplaint] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchComplaints = React.useCallback(() => {
    const token = localStorage.getItem('vrm_token');
    if (!token) return;
    setLoading(true);
    fetch(`${API}/complaints?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      setComplaints(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error loading complaints:", err);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Helper: YYMMDD format
  const getTodayYYMMDD = () => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  };

  // Helper: Get today's YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  // ─── 1. SALES PERSON VIEW ───
  const [salesFormData, setSalesFormData] = React.useState({
    complaintDate: getTodayDateString(),
    complaintNo: '',
    raisedBy: user?.name || 'Sanjai Kumar',
    assignedTo: 'Jawahir',
    customerName: '',
    invoiceNo: '',
    customerContact: '',
    complaintType: 'Quality Mismatch',
    severity: 'Medium',
    description: ''
  });

  // Calculate ticket sequence whenever complaints list changes
  React.useEffect(() => {
    const yymmdd = getTodayYYMMDD();
    const todayPrefix = `CMP-${yymmdd}-`;
    const todayCount = complaints.filter(c => c.complaintNo && c.complaintNo.startsWith(todayPrefix)).length;
    const nextSeq = String(todayCount + 1).padStart(3, '0');
    setSalesFormData(prev => ({
      ...prev,
      complaintNo: prev.complaintNo ? prev.complaintNo : `${todayPrefix}${nextSeq}`,
      raisedBy: user?.name || 'Sanjai Kumar'
    }));
  }, [complaints, user]);

  const handleSalesSubmit = (e, customStatus = 'Open') => {
    if (e) e.preventDefault();
    setSalesConfirm({ show: true, status: customStatus });
  };

  const executeSalesSubmit = async () => {
    const customStatus = salesConfirm.status;
    setSalesConfirm({ show: false, status: 'Open' });
    const token = localStorage.getItem('vrm_token');

    // Ensure we have a ticket number generated
    let finalNo = salesFormData.complaintNo;
    if (!finalNo) {
      const yymmdd = getTodayYYMMDD();
      const todayPrefix = `CMP-${yymmdd}-`;
      const todayCount = complaints.filter(c => c.complaintNo && c.complaintNo.startsWith(todayPrefix)).length;
      const nextSeq = String(todayCount + 1).padStart(3, '0');
      finalNo = `${todayPrefix}${nextSeq}`;
    }

    // Format date for database (DD-MMM, e.g. "29-Jul")
    let displayDate = salesFormData.complaintDate;
    if (displayDate && displayDate.includes('-') && displayDate.split('-')[0].length === 4) {
      const parts = displayDate.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      displayDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}`;
    }

    const targetAssignedTo = salesFormData.assignedTo || 'Jawahir';

    const newComplaint = {
      complaintNo: finalNo,
      complaintDate: displayDate,
      customerName: salesFormData.customerName,
      invoiceNo: salesFormData.invoiceNo,
      customerContact: salesFormData.customerContact,
      complaintType: salesFormData.complaintType,
      severity: salesFormData.severity,
      description: salesFormData.description,
      raisedBy: user?.name || 'Sales Person',
      status: customStatus,
      assignedTo: targetAssignedTo,
      slaTarget: '4 Days',
      slaStatus: 'Within SLA',
      slaDueDate: '',
      ageing: '0',
      customerResponse: 'Awaiting Response',
      firstResponseDate: '',
      rootCauseCategory: '',
      rootCauseDetails: '',
      correctiveAction: '',
      resolutionDetails: '',
      resolvedDate: '',
      closedDate: '',
      closureCategory: ''
    };

    try {
      const res = await fetch(`${API}/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComplaint)
      });
      if (!res.ok) throw new Error('Failed to submit complaint');
      const data = await res.json();
      const actualNo = data.complaintNo || finalNo;
      triggerToast(`Complaint ${actualNo} successfully raised and assigned to ${targetAssignedTo}!`, 'success');
      setSalesFormData({
        customerName: '',
        invoiceNo: '',
        customerContact: '',
        complaintType: 'Production',
        severity: 'Medium',
        description: ''
      });
      fetchComplaints();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleSalesEditSave = async () => {
    if (!salesEditComplaint) return;
    const token = localStorage.getItem('vrm_token');
    try {
      const res = await fetch(`${API}/complaints/${salesEditComplaint.complaintNo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(salesEditComplaint)
      });
      if (!res.ok) throw new Error('Failed to update complaint');
      triggerToast(`Complaint ${salesEditComplaint.complaintNo} updated successfully!`, 'success');
      setSalesEditComplaint(null);
      fetchComplaints();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDownloadExcel = () => {
    let listToExport = complaints;
    if (user?.role === 'teamlead') {
      const myName = 'Jawahir';
      listToExport = complaints.filter(c => c.assignedTo && c.assignedTo.toLowerCase() === myName.toLowerCase());
    } else if (user?.role === 'employee') {
      const myName = user?.name || 'Sanjai Kumar';
      listToExport = complaints.filter(c => c.raisedBy && c.raisedBy.toLowerCase() === myName.toLowerCase());
    }

    if (listToExport.length === 0) {
      alert('No complaints available to download.');
      return;
    }

    // Format dataset as array of objects
    const data = listToExport.map(c => ({
      'Complaint No': c.complaintNo || '',
      'Date': c.complaintDate || '',
      'Customer Name': c.customerName || '',
      'Invoice No': c.invoiceNo || '',
      'Contact': c.customerContact || '',
      'Type': c.complaintType || '',
      'Severity': c.severity || '',
      'Description': c.description || '',
      'Assigned To': c.assignedTo || '',
      'Status': c.status || '',
      'Ageing (Days)': c.ageing || 0,
      'SLA Status': c.slaStatus || ''
    }));

    // Generate worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints');

    // Export file
    XLSX.writeFile(workbook, `Complaints_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── 2. PRODUCTION HEAD VIEW (Inline edits) ───
  const [editStates, setEditStates] = React.useState({});

  const handleProdFieldChange = (cNo, field, val) => {
    setEditStates(prev => ({
      ...prev,
      [cNo]: {
        ...prev[cNo],
        [field]: val
      }
    }));
  };

  const handleProdSave = async (cNo, original) => {
    const token = localStorage.getItem('vrm_token');
    const changes = { ...(editStates[cNo] || {}) };

    if (original.status === 'Open' && !changes.status) {
      changes.status = 'In Progress';
    }

    if (Object.keys(changes).length === 0) {
      triggerToast('No changes to save.', 'error');
      return;
    }

    const payload = {
      ...original,
      ...changes
    };

    try {
      const res = await fetch(`${API}/complaints/${cNo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save complaint changes');
      triggerToast(`Complaint ${cNo} updated successfully!`, 'success');
      setEditStates(prev => {
        const next = { ...prev };
        delete next[cNo];
        return next;
      });
      fetchComplaints();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Check role to determine view
  const role = user?.role || '';

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading complaints...</div>;
  }

  // ════════════ 1. SALES PERSON VIEW ════════════
  if (role === 'employee') {
    const myName = user?.name || 'Sanjai Kumar';
    const myRaisedComplaints = complaints.filter(c => c.raisedBy && c.raisedBy.toLowerCase() === myName.toLowerCase());

    const myRaisedTotal = myRaisedComplaints.length;
    const myRaisedActive = myRaisedComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
    const myRaisedOverdue = myRaisedComplaints.filter(c => c.slaStatus === 'Overdue').length;
    const myRaisedClosed = myRaisedComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    // Type counts for Sales Person's complaints
    const myTypeCounts = {
      Production: myRaisedComplaints.filter(c => c.complaintType === 'Production').length,
      Dipping: myRaisedComplaints.filter(c => c.complaintType === 'Dipping').length,
      Quality: myRaisedComplaints.filter(c => c.complaintType === 'Quality').length,
      Quantity: myRaisedComplaints.filter(c => c.complaintType === 'Quantity').length,
      Availability: myRaisedComplaints.filter(c => c.complaintType === 'Availability').length
    };
    const maxMyTypeCount = Math.max(...Object.values(myTypeCounts), 1);

    return (
      <div style={{ padding: '1rem' }}>
        {subTab === 'register' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button 
              onClick={handleDownloadExcel}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Download size={14} /> Export to Excel
            </button>
          </div>
        )}
        {subTab === 'overview' && (
          <>
            {/* KPI STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { title: 'Complaints Raised', icon: ClipboardList, theme: 'grey-theme', val: myRaisedTotal, trend: 'Total registered' },
                { title: 'Active Inquiries', icon: Activity, theme: 'orange-theme', val: myRaisedActive, trend: 'Under investigation' },
                { title: 'Overdue SLA', icon: Clock, theme: 'grey-theme', val: myRaisedOverdue, trend: 'Attention required' },
                { title: 'Resolved Cases', icon: CheckCircle, theme: 'grey-theme', val: myRaisedClosed, trend: 'Completed' }
              ].map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={i} className={`kpi-card-fx ${k.theme}`}>
                    <div className="kpi-card-fx-top">
                      <span className="kpi-card-fx-title">{k.title}</span>
                      <span className="kpi-card-fx-icon"><Icon size={18} /></span>
                    </div>
                    <div>
                      <div className="kpi-card-fx-val">{k.val}</div>
                      <div className="kpi-trend-pill" style={{ display: 'inline-block', marginTop: '6px' }}>{k.trend}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CHARTS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem' }}>My Registered Types</h3>
                {Object.entries(myTypeCounts).map(([label, count]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.75rem', margin: '12px 0' }}>
                    <span style={{ width: '85px', fontWeight: 600, color: 'var(--text-h)' }}>{label}</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-app)', borderRadius: '99px', margin: '0 10px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count/maxMyTypeCount)*100}%`, height: '100%', background: '#1d4ed8', borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{count}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem', width: '100%' }}>Resolution Ratio</h3>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#ea580c 0% 50%, #16a34a 50% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-h)' }}>{myRaisedTotal}</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Total</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', marginTop: '1rem', fontWeight: 600 }}>
                  <span style={{ color: '#ea580c' }}>Active ({myRaisedActive})</span>
                  <span style={{ color: '#16a34a' }}>Resolved ({myRaisedClosed})</span>
                </div>
              </div>
            </div>
          </>
        )}

        {subTab === 'register' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', color: '#ffffff', padding: '1rem 1.25rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} /> Complaints Registered by {myName}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
              {myRaisedComplaints.length === 0 ? (
                <div className="card" style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No complaints registered by you.
                </div>
              ) : (
                myRaisedComplaints.map(c => {
                  const isOverdue = c.slaStatus === 'Overdue';
                  return (
                    <div 
                      key={c.complaintNo}
                      onClick={() => {
                        if (['Resolved', 'Closed'].includes(c.status)) {
                          setSelectedComplaint(c);
                        } else {
                          setSalesEditComplaint(c);
                        }
                      }}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '2px solid transparent',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        position: 'relative',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#ea580c';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {/* Pills Row (like ice grey, 3.2s, Manual) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{
                          background: 'var(--bg-app)',
                          color: 'var(--text-h)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ClipboardList size={12} /> {c.complaintType}
                        </span>
                        <span style={{
                          background: c.severity === 'Critical' || c.severity === 'High' ? '#fee2e2' : 'var(--bg-app)',
                          color: c.severity === 'Critical' || c.severity === 'High' ? '#dc2626' : 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldAlert size={12} /> {c.severity}
                        </span>
                        <span style={{
                          background: 'var(--bg-app)',
                          color: 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Clock size={12} /> {c.ageing} Days
                        </span>
                      </div>

                      {/* Title & Subtitle block (like Porsche 911 / GT3 RS) */}
                      <div>
                        <h2 style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'var(--text-h)',
                          margin: 0,
                          lineHeight: '1.2',
                          letterSpacing: '-0.02em'
                        }}>
                          {c.customerName}
                        </h2>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          margin: '2px 0 0 0',
                          textTransform: 'uppercase',
                          opacity: 0.6
                        }}>
                          {c.complaintNo}
                        </h3>
                      </div>

                      {/* Description Paragraph */}
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-body)',
                        lineHeight: '1.5',
                        margin: 0,
                        flexGrow: 1
                      }}>
                        {c.description}
                      </p>

                      {/* Bottom Metadata Info */}
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700
                      }}>
                        <span>Assigned: <strong style={{ color: 'var(--text-h)' }}>{c.assignedTo}</strong></span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {['Resolved', 'Closed'].includes(c.status) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(c);
                              }}
                              className="btn btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px', border: '1px solid var(--border)' }}
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSalesEditComplaint(c);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px' }}
                            >
                              Edit
                            </button>
                          )}
                          <span style={{
                            background: isOverdue ? '#dc2626' : c.status === 'Resolved' || c.status === 'Closed' ? '#16a34a' : '#ea580c',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            marginLeft: '4px'
                          }}>
                            {isOverdue ? 'Overdue' : c.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {salesEditComplaint && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(3px)'
              }}>
                <div className="card" style={{ width: '550px', padding: 0, overflow: 'hidden', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Edit Complaint: {salesEditComplaint.complaintNo}</span>
                    <button onClick={() => setSalesEditComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}>×</button>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Customer Name *</label>
                        <input 
                          type="text" 
                          value={salesEditComplaint.customerName || ''} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, customerName: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Invoice No *</label>
                        <input 
                          type="text" 
                          value={salesEditComplaint.invoiceNo || ''} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, invoiceNo: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Customer Contact *</label>
                        <input 
                          type="text" 
                          value={salesEditComplaint.customerContact || ''} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, customerContact: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Assigned To</label>
                        <select 
                          value={salesEditComplaint.assignedTo || 'Jawahir'} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, assignedTo: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        >
                          <option value="Jawahir">Jawahir (Production Head)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Complaint Type *</label>
                        <select 
                          value={salesEditComplaint.complaintType || 'Production'} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, complaintType: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        >
                          <option value="Quality Mismatch">Quality Mismatch</option>
                          <option value="Quantity Issue">Quantity Issue</option>
                          <option value="Delay in Delivery">Delay in Delivery</option>
                          <option value="Availability Issue">Availability Issue</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Severity *</label>
                        <select 
                          value={salesEditComplaint.severity || 'Medium'} 
                          onChange={e => setSalesEditComplaint(p => ({ ...p, severity: e.target.value }))}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-field">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Status *</label>
                      <select 
                        value={salesEditComplaint.status || 'Open'} 
                        onChange={e => setSalesEditComplaint(p => ({ ...p, status: e.target.value }))}
                        style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Problem Description *</label>
                      <textarea 
                        rows="3"
                        value={salesEditComplaint.description || ''} 
                        onChange={e => setSalesEditComplaint(p => ({ ...p, description: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-body)', resize: 'none', background: 'var(--bg-app)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button onClick={() => setSalesEditComplaint(null)} className="btn btn-ghost" style={{ padding: '8px 16px', fontWeight: 600 }}>Cancel</button>
                      <button onClick={handleSalesEditSave} className="btn btn-primary" style={{ padding: '8px 24px', fontWeight: 600 }}>Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedComplaint && (() => {
              const c = selectedComplaint;
              const isResolved = c.status === 'Resolved' || c.status === 'Closed';
              
              // Calculate days taken if resolved
              let daysTakenText = 'Under progress';
              if (isResolved) {
                daysTakenText = `${c.ageing || 0} Days to Resolve`;
              }

              return (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  backdropFilter: 'blur(3px)'
                }}>
                  <div className="card" style={{ width: '550px', padding: 0, overflow: 'hidden', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Complaint Details: {c.complaintNo}</span>
                      <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}>×</button>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised Date</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.complaintDate || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised By</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.raisedBy || 'Sales Person'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.customerName || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned To</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.assignedTo || 'Unassigned'}</div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Problem Description</div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--border)', lineHeight: '1.4' }}>
                          {c.description}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resolution & Closure Status</div>
                        
                        {isResolved ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                              <span>Status: Completed / Resolved</span>
                              <span>{daysTakenText}</span>
                            </div>
                            {c.resolvedDate && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Resolved Date:</strong> {c.resolvedDate}
                              </div>
                            )}
                            {c.rootCauseDetails && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Root Cause:</strong> {c.rootCauseDetails}
                              </div>
                            )}
                            {c.correctiveAction && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Corrective Action:</strong> {c.correctiveAction}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>
                            <span>Status: {c.status} (In Progress)</span>
                            <span>Ageing: {c.ageing || 0} Days Active</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button onClick={() => setSelectedComplaint(null)} className="btn btn-ghost" style={{ padding: '8px 24px', fontWeight: 600 }}>Close Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {subTab === 'form' && (
          <div style={{ width: '100%' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={22} style={{ color: 'var(--navy)' }} /> Raise New Customer Complaint
              </h2>
              <form onSubmit={e => handleSalesSubmit(e, 'Open')} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Complaint Date *</label>
                    <input 
                      type="date" 
                      value={salesFormData.complaintDate} 
                      onChange={e => setSalesFormData(p => ({ ...p, complaintDate: e.target.value }))}
                      required
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }} 
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Complaint Number</label>
                    <input 
                      type="text" 
                      value={salesFormData.complaintNo} 
                      readOnly
                      placeholder="Generating..."
                      style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Raised By</label>
                    <input 
                      type="text" 
                      value={salesFormData.raisedBy} 
                      readOnly
                      style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }} 
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Assigned To *</label>
                    <select
                      value={salesFormData.assignedTo}
                      onChange={e => setSalesFormData(p => ({ ...p, assignedTo: e.target.value }))}
                      required
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                    >
                      <option value="Jawahir">Jawahir (Production Head)</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Customer Name *</label>
                  <input 
                    type="text" 
                    value={salesFormData.customerName} 
                    onChange={e => setSalesFormData(p => ({ ...p, customerName: e.target.value }))} 
                    required 
                    placeholder="e.g. Vetri Solar"
                    style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }} 
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Invoice Number (Optional)</label>
                    <input 
                      type="text" 
                      value={salesFormData.invoiceNo} 
                      onChange={e => setSalesFormData(p => ({ ...p, invoiceNo: e.target.value }))} 
                      placeholder="e.g. INV-2607-074"
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }} 
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Customer Number *</label>
                    <input 
                      type="text" 
                      value={salesFormData.customerContact} 
                      onChange={e => setSalesFormData(p => ({ ...p, customerContact: e.target.value }))} 
                      required
                      placeholder="e.g. 9003126448"
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Complaint Type *</label>
                    <select 
                      value={salesFormData.complaintType} 
                      onChange={e => {
                        const val = e.target.value;
                        setSalesFormData(p => ({ ...p, complaintType: val, assignedTo: 'Jawahir' }));
                      }} 
                      required 
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                    >
                      <option value="Quality Mismatch">Quality Mismatch</option>
                      <option value="Quantity Issue">Quantity Issue</option>
                      <option value="Delay in Delivery">Delay in Delivery</option>
                      <option value="Availability Issue">Availability Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Severity *</label>
                    <select 
                      value={salesFormData.severity} 
                      onChange={e => setSalesFormData(p => ({ ...p, severity: e.target.value }))} 
                      required 
                      style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label style={{ fontWeight: 600, fontSize: '0.78rem' }}>Complaint Description *</label>
                  <textarea 
                    value={salesFormData.description} 
                    onChange={e => setSalesFormData(p => ({ ...p, description: e.target.value }))} 
                    required 
                    rows="4"
                    placeholder="Details of the customer complaint..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-body)', resize: 'none', background: 'var(--bg-app)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={e => handleSalesSubmit(e, 'Draft')}
                    className="btn btn-ghost" 
                    style={{ flex: 1, padding: '10px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Save size={16} /> Save as Draft
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '10px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Send size={16} /> Submit Complaint
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {salesConfirm.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div className="card" style={{
              width: '90%',
              maxWidth: '450px',
              padding: '1.75rem',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              background: '#ffffff',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: salesConfirm.status === 'Draft' ? '#eff6ff' : '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: salesConfirm.status === 'Draft' ? '#2563eb' : '#ea580c'
              }}>
                <ClipboardList size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.5rem' }}>
                {salesConfirm.status === 'Draft' ? 'Save as Draft?' : 'Submit Complaint?'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {salesConfirm.status === 'Draft' 
                  ? 'Are you sure you want to save this complaint as a draft? You can modify it later.'
                  : `Are you sure you want to submit and assign this complaint? This will immediately notify the assignee.`}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSalesConfirm({ show: false, status: 'Open' })}
                  className="btn btn-ghost" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={executeSalesSubmit}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {salesConfirm.status === 'Draft' ? 'Yes, Save Draft' : 'Yes, Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#16a34a' : '#dc2626',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 99999,
            fontSize: '0.825rem',
            fontWeight: 600,
            fontFamily: 'Montserrat',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideInRight 0.3s ease'
          }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        )}
      </div>
    );
  }

  // ════════════ 2. PRODUCTION HEAD VIEW ════════════
  if (role === 'teamlead') {
    const myName = user?.name || 'Jawahir';
    const myComplaints = complaints.filter(c => c.assignedTo && c.assignedTo.toLowerCase() === myName.toLowerCase());

    const myTotalCount = myComplaints.length;
    const myActiveCount = myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
    const myOverdueCount = myComplaints.filter(c => c.slaStatus === 'Overdue').length;
    const myClosedCount = myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    return (
      <div style={{ padding: '1rem' }}>
        {subTab === 'register' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button 
              onClick={handleDownloadExcel}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Download size={14} /> Export to Excel
            </button>
          </div>
        )}
        {subTab === 'overview' ? (
          <>
            {/* PERSONAL METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { title: 'Total Assigned', icon: ClipboardList, theme: 'grey-theme', val: myTotalCount, trend: 'All assignments' },
                { title: 'Active Backlog', icon: Activity, theme: 'orange-theme', val: myActiveCount, trend: 'Under progress' },
                { title: 'Overdue Tasks', icon: Clock, theme: 'grey-theme', val: myOverdueCount, trend: 'Critical status' },
                { title: 'Resolved Tasks', icon: CheckCircle, theme: 'grey-theme', val: myClosedCount, trend: 'Completed' }
              ].map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={i} className={`kpi-card-fx ${k.theme}`}>
                    <div className="kpi-card-fx-top">
                      <span className="kpi-card-fx-title">{k.title}</span>
                      <span className="kpi-card-fx-icon"><Icon size={18} /></span>
                    </div>
                    <div>
                      <div className="kpi-card-fx-val">{k.val}</div>
                      <div className="kpi-trend-pill" style={{ display: 'inline-block', marginTop: '6px' }}>{k.trend}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ASSIGNED COMPLAINT TYPE RATIO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem' }}>Active Tasks Priority</h3>
                {myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No active backlog tasks.</div>
                ) : (
                  myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').map((c, i) => (
                    <div key={i} onClick={() => { setSelectedComplaint(c); setSubTab('register'); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                      <span className="cell-mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1d4ed8' }}>{c.complaintNo}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-h)', flex: 1, marginLeft: '1.5rem' }}>{c.customerName}</span>
                      <span className={`badge ${['Showstopper', 'Blocker', 'Critical'].includes(c.severity) ? 'badge-critical' : 'badge-attention'}`} style={{ fontSize: '0.62rem' }}>{c.severity}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem', width: '100%' }}>Task Status Split</h3>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#ea580c 0% 50%, #16a34a 50% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-h)' }}>{myTotalCount}</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Assigned</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', marginTop: '1rem', fontWeight: 600 }}>
                  <span style={{ color: '#ea580c' }}>Active ({myActiveCount})</span>
                  <span style={{ color: '#16a34a' }}>Resolved ({myClosedCount})</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* CARDS BACKLOG GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {myComplaints.length === 0 ? (
                <div className="card" style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active tasks assigned to you.
                </div>
              ) : (
                myComplaints.map(c => {
                  const isOverdue = c.slaStatus === 'Overdue';
                  return (
                    <div 
                      key={c.complaintNo}
                      onClick={() => {
                        if (['Resolved', 'Closed'].includes(c.status)) {
                          setSelectedComplaint(c);
                        } else {
                          setProdEditComplaint(c);
                        }
                      }}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '2px solid transparent',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        position: 'relative',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#ea580c';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {/* Pills Row (like ice grey, 3.2s, Manual) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{
                          background: 'var(--bg-app)',
                          color: 'var(--text-h)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ClipboardList size={12} /> {c.complaintType}
                        </span>
                        <span style={{
                          background: c.severity === 'Critical' || c.severity === 'High' ? '#fee2e2' : 'var(--bg-app)',
                          color: c.severity === 'Critical' || c.severity === 'High' ? '#dc2626' : 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldAlert size={12} /> {c.severity}
                        </span>
                        <span style={{
                          background: 'var(--bg-app)',
                          color: 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid var(--border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Clock size={12} /> {c.ageing} Days
                        </span>
                      </div>

                      {/* Title & Subtitle block (like Porsche 911 / GT3 RS) */}
                      <div>
                        <h2 style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'var(--text-h)',
                          margin: 0,
                          lineHeight: '1.2',
                          letterSpacing: '-0.02em'
                        }}>
                          {c.customerName}
                        </h2>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          margin: '2px 0 0 0',
                          textTransform: 'uppercase',
                          opacity: 0.6
                        }}>
                          {c.complaintNo}
                        </h3>
                      </div>

                      {/* Description Paragraph */}
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-body)',
                        lineHeight: '1.5',
                        margin: 0,
                        flexGrow: 1
                      }}>
                        {c.description}
                      </p>

                      {/* Bottom Metadata Info */}
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700
                      }}>
                        <span>Date: <strong style={{ color: 'var(--text-h)' }}>{c.complaintDate}</strong></span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {['Resolved', 'Closed'].includes(c.status) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(c);
                              }}
                              className="btn btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px', border: '1px solid var(--border)' }}
                            >
                              View
                            </button>
                          ) : c.status === 'Open' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProdEditComplaint(c);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px', background: '#ea580c', borderColor: '#ea580c' }}
                            >
                              Update
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProdEditComplaint(c);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px' }}
                            >
                              Edit
                            </button>
                          )}
                          {c.status !== 'Open' && (
                            <span style={{
                              background: isOverdue ? '#dc2626' : c.status === 'Resolved' || c.status === 'Closed' ? '#16a34a' : '#ea580c',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.6rem',
                              textTransform: 'uppercase',
                              marginLeft: '4px'
                            }}>
                              {isOverdue ? 'Overdue' : c.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DETAILS MODAL FOR TASK MANAGEMENT */}
            {prodEditComplaint && (() => {
              const c = prodEditComplaint;
              const localState = editStates[c.complaintNo] || {};
              const currentStatus = localState.status !== undefined ? localState.status : (c.status === 'Open' ? 'In Progress' : c.status);
              const currentRootCause = localState.rootCauseDetails !== undefined ? localState.rootCauseDetails : c.rootCauseDetails;
              const currentCorrective = localState.correctiveAction !== undefined ? localState.correctiveAction : c.correctiveAction;
              const isSaveDisabled = !currentRootCause?.trim() || !currentCorrective?.trim() || !currentStatus?.trim();

              return (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  backdropFilter: 'blur(3px)'
                }}>
                  <div className="card" style={{ width: '550px', padding: 0, overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Manage Task: {c.complaintNo}</span>
                      <button onClick={() => setProdEditComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}>×</button>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Company Name</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.customerName || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised Date</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.complaintDate || 'N/A'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised By</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.raisedBy || 'Sales Person'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Severity</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.severity || 'Medium'}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Problem Description</div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', background: 'var(--bg-app)', padding: '8px 12px', borderRadius: '6px', marginTop: '4px', border: '1px solid var(--border)' }}>
                          {c.description}
                        </div>
                      </div>

                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Update Status *</label>
                        <select 
                          value={currentStatus} 
                          onChange={e => handleProdFieldChange(c.complaintNo, 'status', e.target.value)}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Waiting Internal">Waiting Internal</option>
                          <option value="Waiting Customer">Waiting Customer</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Root Cause Details *</label>
                        <input 
                          type="text" 
                          value={currentRootCause || ''} 
                          placeholder="e.g. Dipping tank temperature dropped due to heating element wear"
                          onChange={e => handleProdFieldChange(c.complaintNo, 'rootCauseDetails', e.target.value)}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        />
                      </div>

                      <div className="form-field">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Corrective Action *</label>
                        <input 
                          type="text" 
                          value={currentCorrective || ''} 
                          placeholder="e.g. Replaced element, calibrated controller, added daily maintenance checklist"
                          onChange={e => handleProdFieldChange(c.complaintNo, 'correctiveAction', e.target.value)}
                          style={{ background: 'var(--bg-app)', color: 'var(--text-h)', border: '1px solid var(--border)' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button onClick={() => setProdEditComplaint(null)} className="btn btn-ghost" style={{ padding: '8px 16px', fontWeight: 600 }}>Cancel</button>
                        <button 
                          onClick={async () => {
                            await handleProdSave(c.complaintNo, c);
                            setProdEditComplaint(null);
                          }} 
                          className="btn btn-primary" 
                          disabled={isSaveDisabled}
                          style={{ padding: '8px 24px', fontWeight: 600, opacity: isSaveDisabled ? 0.5 : 1, cursor: isSaveDisabled ? 'not-allowed' : 'pointer' }}
                        >
                          Save & Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* READ-ONLY DETAILS MODAL FOR PRODUCTION VIEW */}
            {selectedComplaint && (() => {
              const c = selectedComplaint;
              const isResolved = c.status === 'Resolved' || c.status === 'Closed';
              
              let daysTakenText = 'Under progress';
              if (isResolved) {
                daysTakenText = `${c.ageing || 0} Days to Resolve`;
              }

              return (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  backdropFilter: 'blur(3px)'
                }}>
                  <div className="card" style={{ width: '550px', padding: 0, overflow: 'hidden', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Complaint Details: {c.complaintNo}</span>
                      <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}>×</button>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised Date</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.complaintDate || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised By</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.raisedBy || 'Sales Person'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.customerName || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned To</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.assignedTo || 'Unassigned'}</div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Problem Description</div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--border)', lineHeight: '1.4' }}>
                          {c.description}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resolution & Closure Status</div>
                        
                        {isResolved ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                              <span>Status: Completed / Resolved</span>
                              <span>{daysTakenText}</span>
                            </div>
                            {c.resolvedDate && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Resolved Date:</strong> {c.resolvedDate}
                              </div>
                            )}
                            {c.rootCauseDetails && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Root Cause:</strong> {c.rootCauseDetails}
                              </div>
                            )}
                            {c.correctiveAction && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                                <strong>Corrective Action:</strong> {c.correctiveAction}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>
                            <span>Status: {c.status} (In Progress)</span>
                            <span>Ageing: {c.ageing || 0} Days Active</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button onClick={() => setSelectedComplaint(null)} className="btn btn-ghost" style={{ padding: '8px 24px', fontWeight: 600 }}>Close Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#16a34a' : '#dc2626',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 99999,
            fontSize: '0.825rem',
            fontWeight: 600,
            fontFamily: 'Montserrat',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideInRight 0.3s ease'
          }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        )}
      </div>
    );
  }

  // ════════════ 3. CEO VIEW ════════════

  // Metrics calculation
  const totalCount = complaints.length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const overdueCount = complaints.filter(c => c.slaStatus === 'Overdue').length;
  const closedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = complaints.filter(c => ['Showstopper', 'Blocker', 'Critical'].includes(c.severity)).length;
  const closureRate = totalCount ? Math.round((closedCount / totalCount) * 100) : 0;

  const typeCounts = {
    Production: complaints.filter(c => c.complaintType === 'Production').length,
    Dipping: complaints.filter(c => c.complaintType === 'Dipping').length,
    Quality: complaints.filter(c => c.complaintType === 'Quality').length,
    Quantity: complaints.filter(c => c.complaintType === 'Quantity').length,
    Availability: complaints.filter(c => c.complaintType === 'Availability').length
  };
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  const assigneesList = ['Jawahir'];
  const assigneeWorkloads = assigneesList.map(name => {
    const active = complaints.filter(c => c.assignedTo && c.assignedTo.toLowerCase() === name.toLowerCase() && c.status !== 'Resolved' && c.status !== 'Closed').length;
    const overdue = complaints.filter(c => c.assignedTo && c.assignedTo.toLowerCase() === name.toLowerCase() && c.slaStatus === 'Overdue').length;
    return { name, active, overdue };
  });

  const topOverdueComplaints = complaints
    .filter(c => c.slaStatus === 'Overdue')
    .slice(0, 3)
    .map(c => ({
      no: c.complaintNo,
      name: c.customerName,
      days: `${c.ageing || 0} days`
    }));

  return (
    <div style={{ padding: '1rem' }}>
      {subTab === 'register' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <button 
            onClick={handleDownloadExcel}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600 }}
          >
            <Download size={14} /> Export to Excel
          </button>
        </div>
      )}
      {subTab === 'overview' ? (
        <>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {[
              { key: 'total', title: 'Total Raised', icon: ClipboardList, theme: 'grey-theme', val: totalCount, label: 'All logged issues' },
              { key: 'active', title: 'Open / Active', icon: Activity, theme: 'orange-theme', val: activeCount, label: 'Under investigation' },
              { key: 'overdue', title: 'Overdue SLA', icon: Clock, theme: 'grey-theme', val: overdueCount, label: 'Missed SLA target' },
              { key: 'closed', title: 'Closed / Resolved', icon: CheckCircle, theme: 'grey-theme', val: closedCount, label: 'Resolved backlog' },
              { key: 'critical', title: 'Critical +', icon: ShieldAlert, theme: 'grey-theme', val: criticalCount, label: 'High priority cases' },
              { key: 'closure', title: 'Closure Rate', icon: TrendingUp, theme: 'grey-theme', val: `${closureRate}%`, label: 'Resolved ratio MTD' }
            ].map(k => {
              const Icon = k.icon;
              return (
                <div key={k.key} className={`kpi-card-fx ${k.theme}`}>
                  <div className="kpi-card-fx-top">
                    <span className="kpi-card-fx-title">{k.title}</span>
                    <span className="kpi-card-fx-icon"><Icon size={18} /></span>
                  </div>
                  <div>
                    <div className="kpi-card-fx-val">{k.val}</div>
                    <div className="kpi-trend-pill" style={{ display: 'inline-block', marginTop: '6px' }}>{k.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CHARTS GRID */}
          <div className="finexy-grid-3" style={{ marginBottom: '1.5rem' }}>
            {/* Pie Chart / Distribution */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-hd"><div className="card-hd-left"><div className="card-hd-stripe"></div><div className="card-title">Status Distribution</div></div></div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#ea580c 0% 40%, #16a34a 40% 70%, #1d4ed8 70% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-h)', fontFamily: 'Montserrat' }}>{totalCount}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', marginTop: '1rem', fontWeight: 600 }}>
                  <span style={{ color: '#ea580c' }}>● Active ({activeCount})</span>
                  <span style={{ color: '#16a34a' }}>● Closed ({closedCount})</span>
                </div>
              </div>
            </div>

            {/* Bar Chart / Type */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-hd"><div className="card-hd-left"><div className="card-hd-stripe"></div><div className="card-title">Complaints by Type</div></div></div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', height: '220px' }}>
                {Object.entries(typeCounts).map(([label, count]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ width: '80px', fontWeight: 600, color: 'var(--text-h)' }}>{label}</span>
                    <div style={{ flex: 1, height: '10px', background: 'var(--bg-app)', borderRadius: '99px', margin: '0 10px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count/maxTypeCount)*100}%`, height: '100%', background: '#1d4ed8', borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backlog / Assignee Workload */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-hd"><div className="card-hd-left"><div className="card-hd-stripe"></div><div className="card-title">Assignee Workload</div></div></div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', height: '220px' }}>
                {assigneeWorkloads.map((w, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e3a8a' }}>{w.name}</span>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: '#ea580c' }}>Active: {w.active}</span>
                      <span style={{ color: '#dc2626' }}>Overdue: {w.overdue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LOWER OVERDUE AND WARNINGS */}
          <div className="finexy-grid-3" style={{ gridTemplateColumns: '1.8fr 1.2fr', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-hd"><div className="card-hd-left"><div className="card-hd-stripe"></div><div className="card-title">Top Overdue Complaints</div></div></div>
              <div style={{ padding: '1rem 1.25rem' }}>
                {topOverdueComplaints.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>No overdue complaints.</div>
                ) : (
                  topOverdueComplaints.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < topOverdueComplaints.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span className="cell-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>{c.no}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-h)', flex: 1, marginLeft: '2rem' }}>{c.name}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>{c.days}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-hd"><div className="card-hd-left"><div className="card-hd-stripe"></div><div className="card-title">Management Alerts</div></div></div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>{overdueCount} complaints are overdue.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ea580c', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>{criticalCount} critical complaints remain active.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: 'var(--navy)', color: '#ffffff', padding: '1rem 1.25rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={18} /> Customer Complaints Register (Read-only Overview)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
            {complaints.length === 0 ? (
              <div className="card" style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No complaints logged.
              </div>
            ) : (
              complaints.map(c => {
                const isOverdue = c.slaStatus === 'Overdue';
                return (
                  <div 
                    key={c.complaintNo}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '24px',
                      border: '2px solid transparent',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.borderColor = '#ea580c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {/* Pills Row (like ice grey, 3.2s, Manual) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{
                        background: 'var(--bg-app)',
                        color: 'var(--text-h)',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ClipboardList size={12} /> {c.complaintType}
                      </span>
                      <span style={{
                        background: c.severity === 'Critical' || c.severity === 'High' ? '#fee2e2' : 'var(--bg-app)',
                        color: c.severity === 'Critical' || c.severity === 'High' ? '#dc2626' : 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldAlert size={12} /> {c.severity}
                      </span>
                      <span style={{
                        background: 'var(--bg-app)',
                        color: 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={12} /> {c.ageing} Days
                      </span>
                    </div>

                    {/* Title & Subtitle block (like Porsche 911 / GT3 RS) */}
                    <div>
                      <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'var(--text-h)',
                        margin: 0,
                        lineHeight: '1.2',
                        letterSpacing: '-0.02em'
                      }}>
                        {c.customerName}
                      </h2>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        margin: '2px 0 0 0',
                        textTransform: 'uppercase',
                        opacity: 0.6
                      }}>
                        {c.complaintNo}
                      </h3>
                    </div>

                    {/* Description Paragraph */}
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-body)',
                      lineHeight: '1.5',
                      margin: 0,
                      flexGrow: 1
                    }}>
                      {c.description}
                    </p>

                    {/* Bottom Metadata Info */}
                    <div style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.75rem',
                      marginTop: '0.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700
                    }}>
                      <span>Assigned: <strong style={{ color: 'var(--text-h)' }}>{c.assignedTo}</strong></span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', height: '24px', border: '1px solid var(--border)' }}
                        >
                          View
                        </button>
                        <span style={{
                          background: isOverdue ? '#dc2626' : c.status === 'Resolved' || c.status === 'Closed' ? '#16a34a' : '#ea580c',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.6rem',
                          textTransform: 'uppercase',
                          marginLeft: '4px'
                        }}>
                          {isOverdue ? 'Overdue' : c.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )
    }

      {selectedComplaint && (() => {
        const c = selectedComplaint;
        const isResolved = c.status === 'Resolved' || c.status === 'Closed';
        
        // Calculate days taken if resolved
        let daysTakenText = 'Under progress';
        if (isResolved) {
          daysTakenText = `${c.ageing || 0} Days to Resolve`;
        }

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(3px)'
          }}>
            <div className="card" style={{ width: '550px', padding: 0, overflow: 'hidden', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ background: 'var(--navy)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Complaint Details: {c.complaintNo}</span>
                <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 }}>×</button>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised Date</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.complaintDate || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Raised By</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.raisedBy || 'Sales Person'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.customerName || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned To</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>{c.assignedTo || 'Unassigned'}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Problem Description</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--border)', lineHeight: '1.4' }}>
                    {c.description}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resolution & Closure Status</div>
                  
                  {isResolved ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                        <span>Status: Completed / Resolved</span>
                        <span>{daysTakenText}</span>
                      </div>
                      {c.resolvedDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                          <strong>Resolved Date:</strong> {c.resolvedDate}
                        </div>
                      )}
                      {c.rootCauseDetails && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                          <strong>Root Cause:</strong> {c.rootCauseDetails}
                        </div>
                      )}
                      {c.correctiveAction && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                          <strong>Corrective Action:</strong> {c.correctiveAction}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>
                      <span>Status: {c.status} (In Progress)</span>
                      <span>Ageing: {c.ageing || 0} Days Active</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setSelectedComplaint(null)} className="btn btn-ghost" style={{ padding: '8px 24px', fontWeight: 600 }}>Close Details</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'success' ? '#16a34a' : '#dc2626',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 99999,
          fontSize: '0.825rem',
          fontWeight: 600,
          fontFamily: 'Montserrat',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideInRight 0.3s ease'
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}


/* ── Tab 0.5: HR Dashboard ── */
function HrDashboardTab({ directory }) {
  const [leaves, setLeaves] = React.useState([
    { id: 1, name: 'Sanjai Kumar', dept: 'Assembly', type: 'Annual Leave', duration: '3 Days', reason: 'Family event', date: 'Jul 29 - Jul 31' },
    { id: 2, name: 'Alex Mercer', dept: 'Packaging', type: 'Sick Leave', duration: '1 Day', reason: 'Medical appointment', date: 'Jul 30' },
    { id: 3, name: 'Elena Rostova', dept: 'Logistics', type: 'Casual Leave', duration: '2 Days', reason: 'Personal work', date: 'Aug 02 - Aug 03' }
  ]);

  const handleAction = (id, action) => {
    alert(`Leave request ${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
    setLeaves(leaves.filter(l => l.id !== id));
  };

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>HR Operations Hub</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>Manage employee rosters, attendance tracking, and leave approvals.</p>
      </div>



      <div className="finexy-grid-3" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
        {/* Left: Pending Leaves approvals */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem' }}>Pending Leave Applications</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaves.map(l => (
              <div key={l.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-h)' }}>{l.name}</span>
                    <span className="badge" style={{ fontSize: '0.6rem', padding: '1px 6px', background: 'var(--bg-app)', color: 'var(--text-sub)' }}>{l.dept}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                    <strong>{l.type}</strong> ({l.duration}) · <span style={{ color: 'var(--text-muted)' }}>"{l.reason}"</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Dates: {l.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleAction(l.id, 'approve')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600 }}>Approve</button>
                  <button onClick={() => handleAction(l.id, 'reject')} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600 }}>Reject</button>
                </div>
              </div>
            ))}
            {leaves.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.8rem' }}>No pending leave applications.</div>
            )}
          </div>
        </div>

        {/* Right: Directory Snapshot */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '1rem' }}>Employee Roster Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(directory || []).slice(0, 5).map((e, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--bg-app)' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-h)' }}>{e.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{e.department?.toUpperCase()}</div>
                </div>
                <span className="badge" style={{ 
                  fontSize: '0.62rem',
                  padding: '2px 8px',
                  background: e.role === 'teamlead' ? 'var(--yellow-soft)' : 'var(--blue-soft)', 
                  color: e.role === 'teamlead' ? 'var(--yellow)' : 'var(--accent)' 
                }}>
                  {e.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab 1: Executive Overview ── */
function OverviewTab({ onDrill, onAlertClick, setDrawerOpen, setActiveTab, userName }) {
  return (
    <>
      {/* Greeting Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>Good morning, {userName || 'Velmurugan Rathinam'}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>Stay on top of your tasks, monitor progress, and track status.</p>
      </div>

      {/* Main Grid: 3-column Finexy Layout */}
      <div className="finexy-grid-3">
        
        {/* Column 1: Quick Actions + Department Wallets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.25rem' }}>Quick Actions</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Access approvals and procurement overrides</div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button style={{ flex: 1, background: '#111827', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }} onClick={() => setActiveTab('approvals')}>
                <CheckCircle size={14} style={{ marginRight: '4px' }} /> Approvals
              </button>
              <button style={{ flex: 1, background: '#F3F4F6', color: '#111827', border: 'none', padding: '10px 18px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }} onClick={() => setActiveTab('procurement')}>
                <ShieldAlert size={14} style={{ marginRight: '4px' }} /> Emergency PO
              </button>
            </div>
          </div>

          {/* Department Targets / Wallets list */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.75rem', textAlign: 'left' }}>Wallets | Total 3 departments</div>
            <div className="wallets-island-grid" style={{ marginTop: 0 }}>
              {[
                { code: 'PRD', name: 'Production', val: '88%', status: '• Active', active: true, color: 'var(--green)' },
                { code: 'PUR', name: 'Purchase',   val: '78%', status: '• Active', active: true, color: 'var(--green)' },
                { code: 'DIS', name: 'Dispatch',   val: '72%', status: '• Inactive', active: false, color: 'var(--text-sub)' },
              ].map((w, i) => (
                <div className={`wallet-island-card ${w.active ? 'active' : ''}`} key={i}>
                  <div className="wallet-island-header">
                    <span>{w.code}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>•••</span>
                  </div>
                  <div className="wallet-island-val">{w.val}</div>
                  <div className="wallet-island-status" style={{ color: w.color }}>{w.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: 4-Card KPI Subgrid */}
        <div className="subgrid-2x2">
          {/* Total Revenue */}
          <div className="kpi-card-fx orange-theme">
            <div className="kpi-card-fx-top">
              <span className="kpi-card-fx-title">Total Revenue</span>
              <span className="kpi-card-fx-icon" style={{ opacity: 0.85 }}><CircleDollarSign size={18} /></span>
            </div>
            <div>
              <div className="kpi-card-fx-val">₹78.4Cr</div>
              <div className="kpi-trend-pill orange">↑ 13.2% This month</div>
            </div>
          </div>

          {/* Spend Value - Highlight Card */}
          <div className="kpi-card-fx grey-theme">
            <div className="kpi-card-fx-top">
              <span className="kpi-card-fx-title">Total PO Value</span>
              <span className="kpi-card-fx-icon" style={{ opacity: 0.85 }}><CircleDollarSign size={18} /></span>
            </div>
            <div>
              <div className="kpi-card-fx-val">₹42.1Cr</div>
              <div className="kpi-trend-pill up">↑ 7% This month</div>
            </div>
          </div>

          {/* Spend Limit */}
          <div className="kpi-card-fx grey-theme">
            <div className="kpi-card-fx-top">
              <span className="kpi-card-fx-title">OEE Efficiency</span>
              <span className="kpi-card-fx-icon"><Activity size={18} /></span>
            </div>
            <div>
              <div className="kpi-card-fx-val">82.4%</div>
              <div className="kpi-trend-pill up">↑ 2.6% This month</div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="kpi-card-fx grey-theme">
            <div className="kpi-card-fx-top">
              <span className="kpi-card-fx-title">Net Profit Margin</span>
              <span className="kpi-card-fx-icon"><TrendingUp size={18} /></span>
            </div>
            <div>
              <div className="kpi-card-fx-val">23.7%</div>
              <div className="kpi-trend-pill up">↑ 8% This month</div>
            </div>
          </div>
        </div>

        {/* Column 3: P&L Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-hd">
            <div className="card-hd-left">
              <div>
                <div className="card-title">Profit and Loss</div>
                <div className="card-sub">View financial performance for current period</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0.5rem 1rem 0' }}>
            <ProfitLossChart />
          </div>
          <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5E3A' }} />
              Profit (Orange)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#111827' }} />
              Loss (Black)
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row Grid */}
      <div className="grid-2">
        
        {/* Left Column: Pending BOMs & Overdue Customer Credits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Pending BOMs */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>Pending BOMs (Overdue &gt; 7 Days)</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '2px' }}>Critical alerts for unreleased bill of materials</div>
              </div>
              <span className="badge badge-critical" style={{ fontSize: '0.62rem', fontWeight: 600 }}>3 Critical Alerts</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'BOM-2026-302', name: 'Solar Mounting Structure v4', dept: 'Production', days: '9 days overdue', itemCode: 'SMS-V4-2026' },
                { id: 'BOM-2026-288', name: 'High-Tensile Galvanized Bolt Assy', dept: 'Procurement', days: '8 days overdue', itemCode: 'HTG-BA-M12' },
                { id: 'BOM-2026-310', name: 'MS Structural Channels 75x40', dept: 'Design', days: '7 days overdue', itemCode: 'MSC-7540-X' }
              ].map((bom, idx) => (
                <div key={idx} style={{ padding: '0.875rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-h)' }}>{bom.id}</span>
                      <span className="badge badge-critical" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>⚠️ Critical</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 700, marginTop: '2px' }}>{bom.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Dept: {bom.dept} • Code: {bom.itemCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--red)', fontWeight: 600 }}>{bom.days}</div>
                    <button 
                      onClick={() => alert(`Clearing BOM for ${bom.id}`)}
                      style={{ marginTop: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-body)' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Customer Credits */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>Overdue Customer Credits</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '2px' }}>Customers who missed their credit payment deadline</div>
              </div>
              <span className="badge badge-critical" style={{ fontSize: '0.62rem', fontWeight: 600 }}>2 Overdue</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { customer: 'Adani Infra Projects', amount: '₹18.4L', deadline: 'Jul 15, 2026', overdue: '13 Days Overdue' },
                { customer: 'Tata Power Solar Ltd', amount: '₹12.6L', deadline: 'Jul 20, 2026', overdue: '8 Days Overdue' }
              ].map((credit, idx) => (
                <div key={idx} style={{ padding: '0.875rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.78rem' }}>{credit.customer}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Deadline: {credit.deadline} • Terms: Net 30</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'Montserrat', fontWeight: 600, color: 'var(--text-h)' }}>{credit.amount}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--red)', fontWeight: 600, marginTop: '2px' }}>{credit.overdue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Cancelled BOMs & Invoices */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>Weekly Cancelled Documents (Sales Team)</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '2px' }}>Tracked BOMs & Invoices cancelled this week</div>
              </div>
              <span className="badge badge-attention" style={{ fontSize: '0.62rem', fontWeight: 600 }}>2 Cancelled</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { type: 'Invoice', id: 'INV-2026-891', salesExec: 'Ramesh Chawla', time: 'Yesterday, 04:15 PM', value: '₹4.2 Lakhs', reason: 'Specs changed by client' },
                { type: 'BOM', id: 'BOM-2026-401', salesExec: 'Neha Sharma', time: 'Jul 24, 2026, 11:30 AM', value: '₹8.9 Lakhs', reason: 'Duplicate entry override' }
              ].map((doc, idx) => (
                <div key={idx} style={{ padding: '0.875rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-h)' }}>{doc.id} ({doc.type})</span>
                      <span className="badge badge-attention" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>Cancelled</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-body)', fontWeight: 700, marginTop: '4px' }}>By: {doc.salesExec} • {doc.time}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Reason: {doc.reason}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'Montserrat', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{doc.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignSelf: 'flex-start' }}>
          
          {/* Delayed Orders Table */}
          <div className="card card-table-container" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem 0.75rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-h)' }}>Recent Activities</span>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, color: 'var(--text-sub)' }} />
                  <input
                    type="text"
                    placeholder="Search"
                    style={{
                      padding: '0.4rem 0.75rem 0.4rem 1.8rem',
                      fontSize: '0.78rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: '#F9FAFB',
                      outline: 'none',
                      width: '180px'
                    }}
                    readOnly
                  />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-sub)', cursor: 'pointer' }}>
                  <SlidersHorizontal size={12} /> Filter
                </button>
              </div>
            </div>
            
            <div className="card-body-flush" style={{ paddingBottom: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Date Created</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK.delayedOrders.slice(0, 5).map((o, idx) => (
                    <tr key={o.id} onClick={() => onDrill('order', o)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-icon-box" style={{
                            background: o.status === 'Critical' ? 'rgba(239, 68, 68, 0.08)' : o.status === 'High' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                            color: o.status === 'Critical' ? 'var(--red)' : o.status === 'High' ? 'var(--amber)' : 'var(--green)'
                          }}>
                            <Package size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.82rem' }}>{o.customer}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>Order ID: {o.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-body)', fontSize: '0.75rem' }}>
                          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>
                            {idx === 0 ? 'Jun 17, 2026, 03:45 PM' :
                             idx === 1 ? 'Jun 15, 2026, 11:30 AM' :
                             idx === 2 ? 'Jun 15, 2026, 12:00 PM' :
                             idx === 3 ? 'Jun 14, 2026, 09:15 PM' :
                             'Jun 10, 2026, 06:00 AM'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${o.status === 'Critical' ? 'badge-critical' : o.status === 'High' ? 'badge-attention' : 'badge-completed'}`} style={{ fontSize: '0.7rem' }}>
                          {o.status === 'Critical' ? 'Critical' : o.status === 'High' ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td className="cell-mono" style={{ fontWeight: 600, fontSize: '0.82rem' }}>{o.value}</td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                        <button className="table-icon-btn"><MoreVertical size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
  
              {/* Premium Pagination Footer */}
              <div className="table-pagination-footer">
                <div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>Go to page: <input type="text" value="1" readOnly style={{ width: '28px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
                  <span>Show rows: <strong>10</strong></span>
                  <span>1-5 of 150</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="table-icon-btn" style={{ padding: '4px' }}>&lt;</button>
                    <button className="table-icon-btn" style={{ padding: '4px' }}>&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Payments Pending */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>Upcoming Vendor Payments (Deadline &lt; 7 Days)</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '2px' }}>Track upcoming credit deadlines and partial payments</div>
              </div>
              <span className="badge badge-attention" style={{ fontSize: '0.62rem', fontWeight: 600 }}>2 Upcoming</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { vendor: 'Jindal Steel & Power', total: '₹24.0L', paid: '₹12.0L', pending: '₹12.0L', deadline: 'Aug 03, 2026', daysLeft: '6 days left' },
                { vendor: 'Tata Steel BSL Ltd', total: '₹15.0L', paid: '₹0.0L', pending: '₹15.0L', deadline: 'Aug 01, 2026', daysLeft: '4 days left' }
              ].map((pay, idx) => (
                <div key={idx} style={{ padding: '0.875rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.78rem' }}>{pay.vendor}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Deadline: {pay.deadline} • Total PO: <strong style={{ color: 'var(--text-h)' }}>{pay.total}</strong>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                      Paid: {pay.paid} ({(parseFloat(pay.paid.replace('₹','')) / parseFloat(pay.total.replace('₹','')) * 100).toFixed(0)}%)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'Montserrat', fontWeight: 600, color: 'var(--text-h)' }}>Pending: {pay.pending}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--amber)', fontWeight: 600, marginTop: '4px' }}>⚠️ {pay.daysLeft}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

/* ── Tab 2: Operations & Orders ── */
function OperationsTab({ onDrill }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = MOCK.delayedOrders.filter(o => statusFilter === 'all' || o.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / 10);
  const sliced = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <>
      <div className="grid-7-5">
        <div className="card gap-mb card-table-container">
          <div className="card-hd">
            <div className="card-hd-left">
              <div className="card-hd-stripe"></div>
              <div><div className="card-title">Order Management — All Customers</div><div className="card-sub">Full delayed order register with status tracking</div></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button className="btn btn-primary btn-sm">+ New Order</button>
            </div>
          </div>
          <div className="card-body-flush" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 56px)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Root Cause</th>
                  <th>Value</th>
                  <th>Delay</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sliced.map((o, idx) => (
                  <tr key={o.id} onClick={() => onDrill('order', o)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="table-icon-box" style={{ background: '#f1f5f9', color: '#475569' }}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{o.customer}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{o.product} • {o.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{o.reason}</td>
                    <td className="cell-mono" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.value}</td>
                    <td>
                      <span className={`badge ${o.delayDays >= 10 ? 'badge-critical' : o.delayDays >= 5 ? 'badge-attention' : 'badge-navy'}`} style={{ fontSize: '0.78rem' }}>
                        {o.delayDays} days
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(o.status)}`} style={{ fontSize: '0.78rem' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                      <button className="table-icon-btn"><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ))}
                {sliced.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={6}>No orders match this status filter.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
              <div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>Go to page: <input type="number" min="1" max={totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
                <span>Show rows: <strong>10</strong></span>
                <span>
                  {filtered.length > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, filtered.length)}` : '0-0'} of {filtered.length}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                  <button className="table-icon-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-left">
                <div className="card-hd-stripe green"></div>
                <div><div className="card-title">OTD Summary</div><div className="card-sub">On-Time Delivery this month</div></div>
              </div>
            </div>
            <div className="card-body">
              {[
                { label: 'Orders Dispatched',    val: '284',   pct: null },
                { label: 'Delivered On-Time',    val: '248',   pct: null },
                { label: 'OTD Rate',             val: '87.3%', pct: 87.3 },
                { label: 'Avg Delay (delayed)',  val: '5.8d',  pct: null },
                { label: 'Revenue at Risk',      val: '₹82L',  pct: null },
              ].map((s, i) => (
                <div className="stat-row" key={i}>
                  <span className="stat-row-label">{s.label}</span>
                  <span className="stat-row-val" style={{ color: s.pct !== null ? (s.pct >= 90 ? 'var(--green)' : s.pct >= 70 ? 'var(--amber)' : 'var(--red)') : 'var(--text-h)' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-left">
                <div className="card-hd-stripe red"></div>
                <div><div className="card-title">Delay Root Cause Analysis</div></div>
              </div>
            </div>
            <div className="card-body">
              {[
                { label: 'Material Shortage',  val: 6, total: 16, color: 'var(--red)' },
                { label: 'Machine Breakdown',  val: 4, total: 16, color: 'var(--amber)' },
                { label: 'Labour Issues',      val: 3, total: 16, color: 'var(--purple)' },
                { label: 'Transport Delay',    val: 2, total: 16, color: 'var(--sky)' },
                { label: 'Quality Rejection',  val: 1, total: 16, color: 'var(--green)' },
              ].map((r, i) => (
                <div className="prog-row" key={i}>
                  <div className="prog-hd">
                    <span className="prog-label">{r.label}</span>
                    <span className="prog-val" style={{ color: r.color }}>{r.val} orders</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${(r.val / r.total) * 100}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab 3: Finance & P&L ── */
function FinanceTab({ onDrill }) {
  const [currentPage, setCurrentPage] = useState(1);
  const items = [
    { item: 'Gross Revenue',        cur: '₹78.4Cr', prev: '₹69.2Cr', ytd: '₹518Cr', target: '₹85Cr',  t: 'up',   ok: true },
    { item: 'Cost of Goods Sold',   cur: '₹31.4Cr', prev: '₹28.6Cr', ytd: '₹206Cr', target: null,     t: 'down', ok: false },
    { item: 'Gross Profit',         cur: '₹47.0Cr', prev: '₹40.6Cr', ytd: '₹312Cr', target: '₹50Cr',  t: 'up',   ok: true },
    { item: 'Operating Expenses',   cur: '₹28.8Cr', prev: '₹26.1Cr', ytd: '₹188Cr', target: null,     t: 'down', ok: false },
    { item: 'EBITDA',               cur: '₹18.2Cr', prev: '₹14.5Cr', ytd: '₹124Cr', target: '₹20Cr',  t: 'up',   ok: true },
    { item: 'Net Profit',           cur: '₹12.4Cr', prev: '₹10.2Cr', ytd: '₹84Cr',  target: '₹15Cr',  t: 'up',   ok: true },
    { item: 'Net Profit Margin %',  cur: '23.7%',   prev: '21.4%',   ytd: '22.1%',  target: '25%',    t: 'up',   ok: true },
  ];
  const totalPages = Math.ceil(items.length / 10);
  const sliced = items.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <>
      <div className="grid-2">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-left">
              <div className="card-hd-stripe"></div>
              <div><div className="card-title">Revenue vs Expenses — FY 2025–26</div><div className="card-sub">₹ Crore monthly · Blue = Revenue · Grey = Expense · Green = Profit</div></div>
            </div>
          </div>
          <div className="chart-wrap"><RevenueChart data={MOCK.revenue} /></div>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#1E3A8A' }}></div>Revenue</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#94a3b8' }}></div>Expenses</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#22C55E' }}></div>Net Profit</div>
          </div>
        </div>

        {/* Expense Donut */}
        <div className="card">
          <div className="card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', paddingBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--red)', marginTop: '-2px' }} />
              <span className="card-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.01em' }}>Expense Distribution — July 2025</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cr, INR Spend</div>
          </div>
          <div className="donut-wrap" style={{ display: 'flex', gap: '2rem', padding: '0.75rem 2.25rem 2rem', alignItems: 'center', minHeight: '280px' }}>
            <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total spend</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px', fontFamily: 'Montserrat', letterSpacing: '-0.02em' }}>64,9 Cr</div>
              </div>
              <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                {MOCK.expenses.map((e, i) => (
                  <div className="donut-legend-row" key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', alignItems: 'center' }}>
                    <div className="donut-legend-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="donut-legend-color" style={{ width: '10px', height: '10px', borderRadius: '3px', background: e.color === 'url(#coralGradient)' ? 'linear-gradient(135deg, #ff6b6b, #e84f35)' : e.color, flexShrink: 0 }}></div>
                      <span className="donut-legend-label" style={{ color: '#4b5563', fontWeight: 600 }}>{e.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 0.9, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <DonutChart data={MOCK.expenses} />
            </div>
          </div>
        </div>
      </div>

      {/* P&L Table */}
      <div className="card gap-mb card-table-container">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe green"></div>
            <div><div className="card-title">Profit & Loss Statement — July 2025</div><div className="card-sub">Month-to-date financial summary</div></div>
          </div>
          <button className="btn btn-ghost btn-sm">Download Report ↓</button>
        </div>
        <div className="card-body-flush" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 56px)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Current Month</th>
                <th>Previous Month</th>
                <th>YTD Total</th>
                <th>vs Target</th>
                <th>Trend</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliced.map((r, i) => (
                <tr key={i} onClick={() => onDrill('pl', r)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="table-icon-box" style={{
                        background: r.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        color: r.ok ? 'var(--green)' : 'var(--red)'
                      }}>
                        {r.t === 'up' ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'rotate(90deg)' }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{r.item}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>MTD Financial Summary</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-mono" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.cur}</td>
                  <td className="cell-mono" style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>{r.prev}</td>
                  <td className="cell-mono" style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>{r.ytd}</td>
                  <td className="cell-mono" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{r.target || '—'}</td>
                  <td>
                    <span className={`badge ${r.t === 'up' ? 'badge-completed' : 'badge-attention'}`} style={{ fontSize: '0.78rem' }}>
                      {r.t === 'up' ? '↑ On Target' : '↓ Attention'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                    <button className="table-icon-btn"><MoreVertical size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
            <div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Go to page: <input type="number" min="1" max={totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
              <span>Show rows: <strong>10</strong></span>
              <span>
                {items.length > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, items.length)}` : '0-0'} of {items.length}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                <button className="table-icon-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab 4: Production & OEE ── */
function ProductionTab({ onDrill }) {
  return (
    <>
      <div className="grid-6-4">
        {/* Plan vs Actual */}
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-left">
              <div className="card-hd-stripe"></div>
              <div><div className="card-title">Production Plan vs Actual — July 2025</div><div className="card-sub">Units produced vs scheduled quantity per product</div></div>
            </div>
          </div>
          <div className="chart-wrap" style={{ paddingLeft: '0.5rem' }}>
            <ProductionChart data={MOCK.production} />
          </div>
          <div className="chart-legend" style={{ paddingTop: 0 }}>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#e2e8f0' }}></div>Plan (Top)</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#22C55E' }}></div>On-Track ≥90%</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#F59E0B' }}></div>Moderate 75–89%</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#EF4444' }}></div>Critical &lt;75%</div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignSelf: 'flex-start' }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-left">
                <div className="card-hd-stripe green"></div>
                <div><div className="card-title">Production KPIs</div></div>
              </div>
            </div>
            <div className="card-body">
              {[
                { label: 'Total Plan (MT)',     val: '5,190' },
                { label: 'Total Actual (MT)',   val: '4,668' },
                { label: 'Achievement %',       val: '89.9%' },
                { label: 'Avg Shift Output',    val: '778 MT' },
                { label: 'Scrap/Wastage %',     val: '1.4%' },
                { label: 'Rework Rate',         val: '2.1%' },
              ].map((s, i) => (
                <div className="stat-row" key={i}>
                  <span className="stat-row-label">{s.label}</span>
                  <span className="stat-row-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Machine OEE Grid */}
      <div className="card gap-mb">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div><div className="card-title">Machine OEE Dashboard — All Lines</div><div className="card-sub">Overall Equipment Effectiveness: Availability × Performance × Quality</div></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-on-target">● Running</span>
            <span className="badge badge-attention">● Slow</span>
            <span className="badge badge-critical">● Down</span>
          </div>
        </div>
        <div className="oee-grid">
          {MOCK.machines.map((m, i) => {
            const c = m.oee >= 85 ? 'green' : m.oee >= 70 ? 'amber' : 'red';
            return (
              <div className="oee-cell" key={i} onClick={() => onDrill('machine', m)} style={{ cursor: 'pointer' }}>
                <div className="oee-machine">{m.name}</div>
                <div className={`oee-val ${c}`}>{m.oee > 0 ? `${m.oee}%` : '—'}</div>
                <div className="oee-sub">OEE</div>
                <div style={{ margin: '0.625rem 0', display: 'flex', justifyContent: 'space-around' }}>
                  {[['A', m.avail], ['P', m.perf], ['Q', m.qual]].map(([lbl, val], j) => (
                    <div key={j} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.8rem', color: val >= 90 ? 'var(--green)' : val >= 75 ? 'var(--amber)' : 'var(--red)' }}>{val > 0 ? `${val}%` : '—'}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <span className={`badge ${statusBadgeClass(m.status)}`}>{m.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Tab 5: Purchase & Vendors ── */
function PurchaseTab({ onDrill }) {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <>

      <div className="grid-6-4">
        {/* Vendor Scorecard */}
        <div className="card card-table-container">
          <div className="card-hd">
            <div className="card-hd-left">
              <div className="card-hd-stripe"></div>
              <div><div className="card-title">Vendor Scorecard</div><div className="card-sub">Top suppliers by performance and value</div></div>
            </div>
            <button className="btn btn-primary btn-sm">+ Add Vendor</button>
          </div>
          <div className="card-body-flush">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Details</th>
                  <th>PO Value</th>
                  <th>On-Time Delivery</th>
                  <th>Rating Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalPages = Math.ceil(MOCK.vendors.length / 10);
                  const slicedVendors = MOCK.vendors.slice((currentPage - 1) * 10, currentPage * 10);
                  return slicedVendors.map((v, i) => (
                    <tr key={i} onClick={() => onDrill('vendor', v)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{v.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{v.material}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-mono" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{v.poValue}</td>
                      <td>
                        <span className={`badge ${parseFloat(v.onTime) >= 90 ? 'badge-completed' : parseFloat(v.onTime) >= 80 ? 'badge-attention' : 'badge-critical'}`} style={{ fontSize: '0.78rem' }}>
                          {v.onTime}
                        </span>
                      </td>
                      <td>
                        <div className="score-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="score-stars" style={{ fontSize: '0.82rem' }}>{stars(v.score)}</span>
                          <span className="score-val" style={{ fontWeight: 700, fontSize: '0.82rem' }}>{v.score}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${v.status === 'Active' ? 'badge-completed' : 'badge-attention'}`} style={{ fontSize: '0.78rem' }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                        <button className="table-icon-btn"><MoreVertical size={14} /></button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
              <div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {(() => {
                  const totalPages = Math.ceil(MOCK.vendors.length / 10);
                  return (
                    <>
                      <span>Go to page: <input type="number" min="1" max={totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
                      <span>Show rows: <strong>10</strong></span>
                      <span>
                        {MOCK.vendors.length > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, MOCK.vendors.length)}` : '0-0'} of {MOCK.vendors.length}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                        <button className="table-icon-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Material Shortage Alerts */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div className="card-hd">
            <div className="card-hd-left">
              <div className="card-hd-stripe red"></div>
              <div><div className="card-title">Material Shortage Alerts</div><div className="card-sub">Critical items at risk</div></div>
            </div>
          </div>
          <div className="alert-list">
            <div className="alert-item">
              <div className="alert-icon critical"><ShieldAlert size={14} /></div>
              <div><div className="alert-title">Mini Rail 60mm — 0 MT in stock</div><div className="alert-meta">Affects 3 customer orders · Raise emergency PO</div></div>
            </div>
            <div className="alert-item">
              <div className="alert-icon high"><AlertTriangle size={14} /></div>
              <div><div className="alert-title">HR Coil 2.5mm — Only 48.2 MT left (Reorder: 50)</div><div className="alert-meta">Running below reorder point · PO recommended</div></div>
            </div>
            <div className="alert-item">
              <div className="alert-icon medium"><ClipboardList size={14} /></div>
              <div><div className="alert-title">Angle 50x50mm — 68 MT (Reorder: 80)</div><div className="alert-meta">Expected to last 12 days at current usage</div></div>
            </div>
            <div className="alert-item">
              <div className="alert-icon medium"><ClipboardList size={14} /></div>
              <div><div className="alert-title">CNC Tooling Set — Only 2 Sets available</div><div className="alert-meta">Atlas Copco lead time: 7 days · Order now</div></div>
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <button className="btn btn-danger btn-block" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ShieldAlert size={14} /> Raise Emergency PO
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab 6: Inventory & Warehouse ── */
function InventoryTab({ onDrill }) {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <>

      <div className="card card-table-container">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div><div className="card-title">Inventory Register — Critical & Low-Stock Items</div><div className="card-sub">Live stock levels with reorder alerts</div></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm">Export</button>
            <button className="btn btn-primary btn-sm">+ Add Item</button>
          </div>
        </div>
        <div className="card-body-flush">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Qty in Stock</th>
                <th>Reorder Level</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const totalPages = Math.ceil(MOCK.inventory.length / 10);
                const slicedInventory = MOCK.inventory.slice((currentPage - 1) * 10, currentPage * 10);
                return slicedInventory.map((item, i) => (
                  <tr key={i} onClick={() => onDrill('inventory', item)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="table-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Code: {item.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-navy" style={{ fontSize: '0.78rem', textTransform: 'none' }}>{item.category}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.88rem', color: item.status === 'Critical' ? 'var(--red)' : item.status === 'Low' ? 'var(--amber)' : 'var(--green)' }}>
                        {item.qty} {item.unit}
                      </span>
                    </td>
                    <td className="cell-mono" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.reorder} {item.unit}</td>
                    <td>
                      <span className={`badge ${item.status === 'Critical' ? 'badge-critical' : item.status === 'Low' ? 'badge-attention' : 'badge-completed'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                        {item.status === 'Critical' ? <ShieldAlert size={12} /> : item.status === 'Low' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {item.status === 'Critical' ? 'Critical' : item.status === 'Low' ? 'Low' : 'OK'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                      <button className="table-icon-btn"><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
              {(() => {
                const totalPages = Math.ceil(MOCK.inventory.length / 10);
                return (
                  <>
                    <span>Go to page: <input type="number" min="1" max={totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
                    <span>Show rows: <strong>10</strong></span>
                    <span>
                      {MOCK.inventory.length > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, MOCK.inventory.length)}` : '0-0'} of {MOCK.inventory.length}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                      <button className="table-icon-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tab: Design & Engineering ── */
function DesignTab({ onDrill }) {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Active CAD & Design Projects</div>
              <div className="card-sub">Current structural model revisions and release statuses</div>
            </div>
          </div>
        </div>
        <div className="card-body-flush">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project / Structure</th>
                <th>Version</th>
                <th>Lead Architect</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Mini Rail 60mm System', ver: 'v2.4', lead: 'Priya Sen', status: 'Approved', color: 'var(--green)' },
                { name: 'HR Coil Mounting Bracket', ver: 'v1.1', lead: 'Kiran Dev', status: 'In Review', color: 'var(--amber)' },
                { name: 'Industrial Shed Model C', ver: 'v3.0', lead: 'Priya Sen', status: 'Approved', color: 'var(--green)' },
                { name: 'VRM Solar Structure v4', ver: 'v4.2', lead: 'Kiran Dev', status: 'Drafting', color: 'var(--text-muted)' },
              ].map((p, idx) => (
                <tr key={idx}>
                  <td><strong>{p.name}</strong></td>
                  <td className="cell-mono">{p.ver}</td>
                  <td>{p.lead}</td>
                  <td><span className={`badge ${p.status === 'Approved' ? 'badge-completed' : p.status === 'In Review' ? 'badge-attention' : 'badge-pending'}`}>{p.status}</span></td>
                  <td style={{ textAlign: 'right', paddingRight: '2rem' }}><button className="table-icon-btn"><MoreVertical size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ alignSelf: 'flex-start' }}>
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Design Deliverables Tracker</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {[
            { label: 'Total Revisions (YTD)', val: '142', color: 'var(--text-h)' },
            { label: 'Prototypes Validated', val: '18 / 20', color: 'var(--green)' },
            { label: 'Pending Approvals', val: '2', color: 'var(--amber)' },
            { label: 'Release Velocity', val: '4.8 days', color: 'var(--text-h)' },
          ].map((s, i) => (
            <div className="stat-row" key={i}>
              <span className="stat-row-label">{s.label}</span>
              <span className="stat-row-val" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Digital Marketing ── */
function DigitalMarketingTab() {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Lead Acquisition Campaigns</div>
              <div className="card-sub">Active outreach campaigns and source stats</div>
            </div>
          </div>
        </div>
        <div className="card-body-flush">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Channel</th>
                <th>Cost / Lead</th>
                <th>Leads Generated</th>
                <th>ROI Status</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Google Ads (VRM Structures)', cpl: '₹320', leads: '1,420', status: 'Excellent', color: 'var(--green)' },
                { name: 'LinkedIn B2B Outreach', cpl: '₹950', leads: '380', status: 'Good', color: 'var(--green)' },
                { name: 'SEO Organic Ranking', cpl: '₹140', leads: '2,900', status: 'Outstanding', color: 'var(--green)' },
                { name: 'Industry Email Campaigns', cpl: '₹410', leads: '650', status: 'Average', color: 'var(--amber)' },
              ].map((c, idx) => (
                <tr key={idx}>
                  <td><strong>{c.name}</strong></td>
                  <td className="cell-mono">{c.cpl}</td>
                  <td className="cell-mono">{c.leads}</td>
                  <td><span className={`badge ${c.status === 'Outstanding' || c.status === 'Excellent' ? 'badge-completed' : c.status === 'Good' ? 'badge-completed' : 'badge-attention'}`}>{c.status}</span></td>
                  <td style={{ textAlign: 'right', paddingRight: '2rem' }}><button className="table-icon-btn"><MoreVertical size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ alignSelf: 'flex-start' }}>
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Marketing Metrics</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {[
            { label: 'Total Marketing Spend (Mtd)', val: '₹4.8 Spend', color: 'var(--text-h)' },
            { label: 'Sales Pipeline (from Marketing)', val: '₹1.25 Cr', color: 'var(--green)' },
            { label: 'Average CAC', val: '₹412', color: 'var(--green)' },
            { label: 'Lead Conversion Rate', val: '4.82%', color: 'var(--green)' },
          ].map((s, i) => (
            <div className="stat-row" key={i}>
              <span className="stat-row-label">{s.label}</span>
              <span className="stat-row-val" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tab 7: Employee Org Tree Canvas ── */
function EmployeeTab({ onDrill }) {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });


  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[onClick]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '560px',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating Canvas Controls */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        gap: '0.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '4px 8px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button className="table-icon-btn" onClick={zoomOut} title="Zoom Out" style={{ padding: '4px 8px', fontWeight: 600 }}>-</button>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', minWidth: '40px', justifyContent: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button className="table-icon-btn" onClick={zoomIn} title="Zoom In" style={{ padding: '4px 8px', fontWeight: 600 }}>+</button>
        <button className="table-icon-btn" onClick={resetZoom} title="Reset Zoom" style={{ fontSize: '0.72rem', padding: '4px 8px', fontWeight: 700 }}>Reset</button>
      </div>

      {/* Movable & Zoomable Canvas Content */}
      <div style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: 'center center',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        width: '900px',
        height: '460px',
        position: 'absolute',
        top: 'calc(50% - 230px)',
        left: 'calc(50% - 450px)'
      }}>
        {/* SVG Connector Lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '900px', height: '480px', pointerEvents: 'none', zIndex: 1 }}>
          {/* Vertical segment from MD */}
          <path d="M 450 90 L 450 120" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Horizontal main bar */}
          <path d="M 90 120 L 810 120" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Vertical drops to HODs */}
          <path d="M 90 120 L 90 155" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 270 120 L 270 155" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 450 120 L 450 155" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 630 120 L 630 155" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 810 120 L 810 155" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Lines from HODs to members */}
          <path d="M 90 220 L 90 280" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 450 220 L 450 280" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 630 220 L 630 280" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>

        {/* Scrollable Container Content */}
        <div style={{ width: '900px', height: '460px', position: 'relative', zIndex: 2 }}>
          
          {/* MD Node */}
          <div
            onClick={() => onDrill('employee', { name: 'Velmurugan Rathinam', role: 'Managing Director', dept: 'Corporate', email: 'executive@workhub.com', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '20px',
              left: '360px',
              width: '180px',
              background: 'var(--accent-soft)',
              border: '2.5px solid var(--accent)',
              borderRadius: '12px',
              padding: '8px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.85rem' }}>Velmurugan Rathinam</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, marginTop: '2px' }}>Managing Director</div>
          </div>

          {/* LEVEL 2: HOD NODES */}
          {/* HOD 1: Production */}
          <div
            onClick={() => onDrill('employee', { name: 'Aravind Swamy', role: 'Plant Head', dept: 'Production', email: 'aravind.s@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '155px',
              left: '10px',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderLeft: '3.5px solid #0ea5e9',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.8rem' }}>Aravind Swamy</div>
            <div style={{ fontSize: '0.68rem', color: '#0ea5e9', fontWeight: 700, marginTop: '1px' }}>HOD • Production</div>
          </div>

          {/* HOD 2: Purchase */}
          <div
            onClick={() => onDrill('employee', { name: 'Marcus Reid', role: 'Purchase Manager', dept: 'Purchase', email: 'marcus.reid@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '155px',
              left: '190px',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderLeft: '3.5px solid #22c55e',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.8rem' }}>Marcus Reid</div>
            <div style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 700, marginTop: '1px' }}>HOD • Purchase</div>
          </div>

          {/* HOD 3: Finance */}
          <div
            onClick={() => onDrill('employee', { name: 'Sonia Verma', role: 'P&L Controller', dept: 'Finance', email: 'sonia.v@vrm.in', status: 'On Leave' })}
            style={{
              position: 'absolute',
              top: '155px',
              left: '370px',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderLeft: '3.5px solid #f59e0b',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.8rem' }}>Sonia Verma</div>
            <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700, marginTop: '1px' }}>HOD • Finance</div>
          </div>

          {/* HOD 4: Design */}
          <div
            onClick={() => onDrill('employee', { name: 'Priya Sen', role: 'Lead Designer', dept: 'Design', email: 'priya.s@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '155px',
              left: '550px',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderLeft: '3.5px solid #8b5cf6',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.8rem' }}>Priya Sen</div>
            <div style={{ fontSize: '0.68rem', color: '#8b5cf6', fontWeight: 700, marginTop: '1px' }}>HOD • Design</div>
          </div>

          {/* HOD 5: Dispatch */}
          <div
            onClick={() => onDrill('employee', { name: 'Ritesh Pandey', role: 'Logistics Supervisor', dept: 'Dispatch', email: 'ritesh.p@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '155px',
              left: '730px',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderLeft: '3.5px solid #64748b',
              borderRadius: '10px',
              padding: '6px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.8rem' }}>Ritesh Pandey</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginTop: '1px' }}>HOD • Dispatch</div>
          </div>

          {/* LEVEL 3: MEMBERS */}
          {/* Member 1: Production QA */}
          <div
            onClick={() => onDrill('employee', { name: 'Deepika Rao', role: 'QA Inspector', dept: 'Production', email: 'deepika.r@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '280px',
              left: '20px',
              width: '140px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '5px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.78rem' }}>Deepika Rao</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>QA Inspector</div>
          </div>

          {/* Member 2: Finance Accounts */}
          <div
            onClick={() => onDrill('employee', { name: 'Arjun Mehta', role: 'Senior Accountant', dept: 'Finance', email: 'arjun.m@vrm.in', status: 'Present' })}
            style={{
              position: 'absolute',
              top: '280px',
              left: '380px',
              width: '140px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '5px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.78rem' }}>Arjun Mehta</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sr. Accountant</div>
          </div>

          {/* Member 3: Design CAD */}
          <div
            onClick={() => onDrill('employee', { name: 'Kiran Dev', role: 'CAD Engineer', dept: 'Design', email: 'kiran.d@vrm.in', status: 'On Leave' })}
            style={{
              position: 'absolute',
              top: '280px',
              left: '640px',
              width: '140px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '5px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.78rem' }}>Kiran Dev</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CAD Engineer</div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [timeframe, setTimeframe] = React.useState({ hc: 'Week', present: 'Week', leave: 'Week', absent: 'Week' });
  const [selectedDept, setSelectedDept] = React.useState('overall');
  const [currentPage, setCurrentPage] = React.useState(1);
  const total = MOCK.employees.reduce((s, e) => s + e.hc, 0);
  const present = MOCK.employees.reduce((s, e) => s + e.present, 0);
  const onLeave = MOCK.employees.reduce((s, e) => s + e.onLeave, 0);
  const absent  = MOCK.employees.reduce((s, e) => s + e.absent, 0);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept]);

  const cards = [
    {
      key: 'hc',
      title: 'Total Headcount Last 8 weeks',
      icon: Users,
      color: '#0ea5e9',
      lightColor: '#e0f2fe',
      val: total,
      unit: 'staff',
      label: 'Avg this week',
      guide: '1,200',
      type: 'bar',
      data: [1250, 1260, 1265, 1270, 1280, 1275, 1280, total]
    },
    {
      key: 'present',
      title: 'Present Today Last 8 weeks',
      icon: CheckCircle,
      color: '#22c55e',
      lightColor: '#dcfce7',
      val: present,
      unit: 'staff',
      label: 'Avg this week',
      guide: '1,150',
      type: 'bar',
      data: [1190, 1200, 1210, 1205, 1215, 1208, 1210, present]
    },
    {
      key: 'leave',
      title: 'On Approved Leave Last 8 weeks',
      icon: Calendar,
      color: '#f59e0b',
      lightColor: '#fef3c7',
      val: onLeave,
      unit: 'staff',
      label: 'Avg this week',
      guide: '30',
      type: 'bar',
      data: [35, 40, 38, 42, 36, 45, 41, onLeave]
    },
    {
      key: 'absent',
      title: 'Absent / AWOL Last 8 weeks',
      icon: AlertTriangle,
      color: '#ef4444',
      lightColor: '#fee2e2',
      val: absent,
      unit: 'staff',
      label: 'Avg this week',
      guide: '20',
      type: 'line',
      data: [20, 22, 25, 21, 26, 23, 22, absent]
    }
  ];

  return (
    <>
      {/* ── WORKFORCE KPI CARDS ── */}
      <div className="kpi-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '240px',
                position: 'relative'
              }}
            >
              {/* Top Row: Icon + Title + Chevron */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: c.color }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-h)' }}>{c.title}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
              </div>

              {/* Middle Value Row */}
              <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'Montserrat', fontSize: '1.85rem', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.02em', lineHeight: 1 }}>{c.val}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.unit}</span>
                </div>
              </div>

              {/* Chart Area */}
              <div style={{ height: '75px', position: 'relative', marginTop: 'auto' }}>
                {c.type === 'bar' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {/* Guide line */}
                    <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e2e8f0', zIndex: 1 }} />
                    <span style={{ position: 'absolute', top: '18%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', zIndex: 2 }}>{c.guide}</span>
                    
                    {/* Bar list */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', width: '100%', paddingLeft: '32px' }}>
                      {c.data.map((val, idx) => {
                        const maxVal = Math.max(...c.data);
                        const pctHeight = (val / maxVal) * 80;
                        const isLast = idx === c.data.length - 1;
                        return (
                          <div
                            key={idx}
                            style={{
                              width: '6px',
                              height: `${pctHeight}%`,
                              background: isLast ? c.color : c.lightColor,
                              borderRadius: '3px',
                              zIndex: 2
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {/* Guide lines */}
                    <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '1px', borderTop: '1px solid #f1f5f9' }} />
                    <div style={{ position: 'absolute', bottom: '20%', left: 0, right: 0, height: '1px', borderTop: '1px solid #f1f5f9' }} />
                    <span style={{ position: 'absolute', top: '5%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>30</span>
                    <span style={{ position: 'absolute', bottom: '5%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>15</span>

                    {/* SVG Line path */}
                    <div style={{ width: '100%', height: '100%', paddingLeft: '24px', position: 'relative' }}>
                      {/* Highlight column at end */}
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '14px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }} />
                      
                      <svg viewBox="0 0 160 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {(() => {
                          const w = 150, h = 40;
                          const points = c.data.map((val, idx) => ({
                            x: idx * (w / (c.data.length - 1)),
                            y: h - ((val - 12) / (32 - 12)) * h
                          }));
                          const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          return (
                            <>
                              <path d={pathD} fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" />
                              <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="3.5" fill={c.color} stroke="#fff" strokeWidth="1.5" />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom timeframe selector layout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.625rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {['Week', 'Month', 'Year'].map(tf => {
                    const active = timeframe[c.key] === tf;
                    return (
                      <span
                        key={tf}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimeframe(prev => ({ ...prev, [c.key]: tf }));
                        }}
                        style={{
                          background: active ? '#111827' : 'transparent',
                          color: active ? '#ffffff' : 'var(--text-muted)',
                          borderRadius: '99px',
                          padding: '2px 8px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {tf}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card card-table-container">
        <div className="card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Detailed Attendance Log</div>
              <div className="card-sub">Daily attendance records across all departments</div>
            </div>
          </div>
          <div className="card-hd-right">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                color: 'var(--text-sub)',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="overall">Overall</option>
              <option value="Production">Production</option>
              <option value="Accounts">Accounts</option>
              <option value="Sales">Sales</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Procurement">Procurement</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>
        <div className="card-body-flush">
          <table className="data-table">
            <thead>
              {selectedDept === 'overall' ? (
                <tr>
                  <th>Department</th>
                  <th>Total Headcount</th>
                  <th>Present</th>
                  <th>On Approved Leave</th>
                  <th>Absent</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Email Address</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(() => {
                if (selectedDept === 'overall') {
                  const deptSummaryData = [
                    { dept: 'Production', hc: 85, present: 78, onLeave: 4, absent: 3 },
                    { dept: 'Accounts', hc: 14, present: 14, onLeave: 0, absent: 0 },
                    { dept: 'Sales', hc: 20, present: 18, onLeave: 1, absent: 1 },
                    { dept: 'Digital Marketing', hc: 11, present: 10, onLeave: 1, absent: 0 },
                    { dept: 'Procurement', hc: 12, present: 11, onLeave: 1, absent: 0 },
                    { dept: 'Design', hc: 10, present: 8, onLeave: 2, absent: 0 }
                  ];
                  const totalPages = Math.ceil(deptSummaryData.length / 10);
                  const sliced = deptSummaryData.slice((currentPage - 1) * 10, currentPage * 10);

                  return sliced.map((d, idx) => (
                    <tr key={idx} onClick={() => setSelectedDept(d.dept)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-icon-box" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <Building2 size={16} />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{d.dept}</span>
                        </div>
                      </td>
                      <td className="cell-mono" style={{ fontWeight: 700, fontSize: '0.88rem' }}>{d.hc}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem' }}>{d.present}</td>
                      <td style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.88rem' }}>{d.onLeave}</td>
                      <td style={{ color: d.absent > 0 ? 'var(--red)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem' }}>{d.absent}</td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }} onClick={e => e.stopPropagation()}>
                        <button className="table-icon-btn"><MoreVertical size={14} /></button>
                      </td>
                    </tr>
                  ));
                } else {
                  const attendanceData = [
                    { name: 'Aravind Swamy', role: 'Plant Head', dept: 'Production', email: 'aravind.s@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Marcus Reid', role: 'Purchase Manager', dept: 'Procurement', email: 'marcus.reid@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Sonia Verma', role: 'P&L Controller', dept: 'Accounts', email: 'sonia.v@vrm.in', status: 'On Leave', color: 'var(--amber)' },
                    { name: 'Ritesh Pandey', role: 'Logistics Supervisor', dept: 'Production', email: 'ritesh.p@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Deepika Rao', role: 'QA Inspector', dept: 'Production', email: 'deepika.r@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Rahul Khanna', role: 'Sales Lead', dept: 'Sales', email: 'rahul.k@vrm.in', status: 'Absent', color: 'var(--red)' },
                    { name: 'Sneha Gupta', role: 'Marketing Specialist', dept: 'Digital Marketing', email: 'sneha.g@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Priya Sen', role: 'UI/UX Designer', dept: 'Design', email: 'priya.s@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Arjun Mehta', role: 'Senior Accountant', dept: 'Accounts', email: 'arjun.m@vrm.in', status: 'Present', color: 'var(--green)' },
                    { name: 'Kiran Dev', role: 'CAD Engineer', dept: 'Design', email: 'kiran.d@vrm.in', status: 'On Leave', color: 'var(--amber)' }
                  ];

                  const filtered = attendanceData.filter(e => e.dept.toLowerCase() === selectedDept.toLowerCase());
                  const totalPages = Math.ceil(filtered.length / 10);
                  const sliced = filtered.slice((currentPage - 1) * 10, currentPage * 10);

                  if (sliced.length === 0) {
                    return (
                      <tr className="empty-row">
                        <td colSpan={6}>No employee records found in {selectedDept} department.</td>
                      </tr>
                    );
                  }

                  return sliced.map((e, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-icon-box" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <Users size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{e.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{e.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-navy" style={{ textTransform: 'none', fontSize: '0.78rem' }}>{e.dept}</span>
                      </td>
                      <td className="cell-mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.email}</td>
                      <td>
                        <span className={`badge ${e.status === 'Present' ? 'badge-completed' : e.status === 'On Leave' ? 'badge-attention' : 'badge-critical'}`} style={{ fontSize: '0.78rem' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                        <button className="table-icon-btn"><MoreVertical size={14} /></button>
                      </td>
                    </tr>
                  ));
                }
              })()}
            </tbody>
          </table>

          {/* Premium Pagination Footer */}
          <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
            <div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {(() => {
                const count = selectedDept === 'overall' ? 6 : MOCK.employees.find(d => d.dept.toLowerCase() === selectedDept.toLowerCase())?.hc || 0;
                const totalPages = Math.max(1, Math.ceil(count / 10));
                return (
                  <>
                    <span>Go to page: <input type="number" min="1" max={totalPages} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
                    <span>Show rows: <strong>10</strong></span>
                    <span>
                      {count > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, count)}` : '0-0'} of {count}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                      <button className="table-icon-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AssignWorksTab({ tasks, onAssign, directory = [] }) {
  const [taskText, setTaskText] = React.useState('');
  const [assigneeType, setAssigneeType] = React.useState('all');
  const [assignee, setAssignee] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [priority, setPriority] = React.useState('Medium');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Derive worker list based on filter
  const filteredWorkers = React.useMemo(() => {
    const fallbackList = [
      { name: 'Sanjai Kumar', role: 'Employee', department: 'Production' },
      { name: 'Marcus Aurelius', role: 'Team Lead', department: 'Production' },
      { name: 'Dave Miller', role: 'Team Lead', department: 'Quality Assurance' },
      { name: 'Velmurugan Rathinam', role: 'Team Lead', department: 'Executive Office' },
      { name: 'Alex Mercer', role: 'Employee', department: 'Production' },
      { name: 'Elena Rostova', role: 'Employee', department: 'Production' },
      { name: 'Aravind Swamy', role: 'Plant Head', department: 'Production' },
      { name: 'Marcus Reid', role: 'Purchase Manager', department: 'Procurement' },
      { name: 'Sonia Verma', role: 'P&L Controller', department: 'Accounts' },
      { name: 'Ritesh Pandey', role: 'Logistics Supervisor', department: 'Production' },
      { name: 'Deepika Rao', role: 'QA Inspector', department: 'Production' },
      { name: 'Rahul Khanna', role: 'Sales Lead', department: 'Sales' },
      { name: 'Sneha Gupta', role: 'Marketing Specialist', department: 'Digital Marketing' },
      { name: 'Priya Sen', role: 'UI/UX Designer', department: 'Design' },
      { name: 'Arjun Mehta', role: 'Senior Accountant', department: 'Accounts' },
      { name: 'Kiran Dev', role: 'CAD Engineer', department: 'Design' },
    ];

    const list = directory.length > 0 ? directory : fallbackList;

    return list.filter(w => {
      const roleStr = (w.role || '').toLowerCase();
      const isHod = roleStr.includes('lead') || roleStr.includes('manager') || roleStr.includes('head') || roleStr.includes('controller') || roleStr.includes('supervisor');
      if (assigneeType === 'hod') return isHod;
      if (assigneeType === 'employee') return !isHod;
      return true;
    });
  }, [directory, assigneeType]);

  // Set default assignee when filter or worker list changes
  React.useEffect(() => {
    if (filteredWorkers.length > 0) {
      setAssignee(filteredWorkers[0].name);
    } else {
      setAssignee('');
    }
  }, [filteredWorkers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText || !assignee) return;
    
    const selectedWorker = filteredWorkers.find(w => w.name === assignee);
    const assignedDept = selectedWorker ? (selectedWorker.department || selectedWorker.dept || 'Production') : 'Production';

    onAssign({
      id: Date.now(),
      task: taskText,
      dept: assignedDept,
      assignee,
      deadline: deadline || '2025-08-15',
      priority,
      status: 'Pending',
    });
    setTaskText('');
    setCurrentPage(1); // Reset to first page to see new task
  };

  const totalPages = Math.ceil(tasks.length / 10);
  const slicedTasks = tasks.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="grid-2">
      <div className="card" style={{ alignSelf: 'flex-start' }}>
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe"></div>
            <div>
              <div className="card-title">Assign New Work</div>
              <div className="card-sub">Delegate tasks directly to HODs and set deadlines</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Task Description</label>
              <textarea value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Describe the work to be done..." required rows={3} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Assignee Category</label>
                <select value={assigneeType} onChange={e => setAssigneeType(e.target.value)}>
                  <option value="all">Everyone</option>
                  <option value="hod">HODs / Department Heads</option>
                  <option value="employee">Staff / Workers Only</option>
                </select>
              </div>
              <div className="form-field">
                <label>Select Assignee Name</label>
                <select value={assignee} onChange={e => setAssignee(e.target.value)} required>
                  {filteredWorkers.map((w, idx) => (
                    <option key={idx} value={w.name}>{w.name} ({w.role} - {w.department || w.dept || 'N/A'})</option>
                  ))}
                  {filteredWorkers.length === 0 && (
                    <option value="">No users found matching filter</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Deadline Date</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Priority Level</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem' }} disabled={!assignee}>Delegate Task</button>
          </form>
        </div>
      </div>

      <div className="card card-table-container">
        <div className="card-hd">
          <div className="card-hd-left">
            <div className="card-hd-stripe green"></div>
            <div>
              <div className="card-title">Assigned Task History</div>
              <div className="card-sub">Active tasks delegated by CEO</div>
            </div>
          </div>
        </div>
        <div className="card-body-flush" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 56px)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Assignee</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slicedTasks.map(t => (
                <tr key={t.id}>
                  <td className="cell-primary" style={{ fontSize: '0.78rem' }}>
                    <div>{t.task}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.dept}</div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{t.assignee}</td>
                  <td className="cell-mono" style={{ fontSize: '0.72rem' }}>{t.deadline}</td>
                  <td>
                    <span className={`badge ${t.status === 'Completed' ? 'badge-on-target' : 'badge-inprogress'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {slicedTasks.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={4}>No tasks delegated yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="table-pagination-footer" style={{ borderTop: '1px solid var(--border)' }}>
            <div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Go to page: <input type="number" min="1" max={totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))} style={{ width: '32px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '0.7rem', fontWeight: 700 }} /></span>
              <span>Show rows: <strong>10</strong></span>
              <span>
                {tasks.length > 0 ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, tasks.length)}` : '0-0'} of {tasks.length}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="table-icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: '4px' }}>&lt;</button>
                <button className="table-icon-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px' }}>&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════ */
const TABS = [
  { id: 'overview',    label: 'Dashboard',             icon: '🏠' },
  { id: 'operations',  label: 'Operations & Orders',   icon: '📦' },
  { id: 'finance',     label: 'Financial & P&L',       icon: '💰' },
  { id: 'production',  label: 'Production & OEE',      icon: '🏭' },
  { id: 'purchase',    label: 'Purchase & Vendor',     icon: '🛒' },
  { id: 'inventory',   label: 'Inventory & Warehouse', icon: '📦' },
  { id: 'employees',   label: 'Employee Work Hub',     icon: '👥' },
];

export default function App() {
  const [token,    setToken]    = useState(localStorage.getItem('vrm_token') || '');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('vrm_token'));
  const [email,    setEmail]    = useState(localStorage.getItem('vrm_login_email') || 'executive@workhub.com');
  const [user,     setUser]     = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('vrm_user') || 'null');
      if (u && u.email === 'employee@workhub.com' && u.name === 'Sarah Jenkins') {
        u.name = 'Sanjai Kumar';
        localStorage.setItem('vrm_user', JSON.stringify(u));
      }
      if (u && u.email === 'productionhead@workhub.com' && u.name === 'Marcus Reid') {
        u.name = 'Jawahir';
        localStorage.setItem('vrm_user', JSON.stringify(u));
      }
      return u;
    } catch (e) {
      return null;
    }
  });
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('vrm_user') || 'null');
      if (u) {
        if (u.role === 'teamlead') return 'production_dept';
        if (u.role === 'hr') return 'hr_dashboard';
        if (u.role === 'procurementhead') return 'procurement';
        if (u.role === 'accountshead') return 'accounts';
        if (u.role === 'saleshead') return 'sales';
        if (u.role === 'designhead') return 'design';
        if (u.role === 'marketinghead') return 'digital_marketing';
        if (u.role === 'employee') return 'employee_dashboard';
      }
    } catch (e) {}
    return 'overview';
  });
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [complaintSubTab, setComplaintSubTab] = useState('overview');
  const [deptOpen, setDeptOpen]   = useState(true);
  const [drillData, setDrillData] = useState(null);
  const [drillType, setDrillType] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [leaves,     setLeaves]     = useState([]);
  const [directory,  setDirectory]  = useState([]);
  const [alerts,     setAlerts]     = useState([]);
  const [refreshTime, setRefreshTime] = useState(nowTime());
  const [showNotifications, setShowNotifications] = useState(false);
  const [kpiTimeframe, setKpiTimeframe] = useState({ revenue: 'Week', netProfit: 'Week', otd: 'Week', oee: 'Week' });
  const [dateFilter, setDateFilter]   = useState('Jul 2025');
  const [deptFilter, setDeptFilter]   = useState('all');
  const [theme, setTheme]             = useState(localStorage.getItem('vrm_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vrm_theme', theme);
  }, [theme]);
  const [assignedTasks, setAssignedTasks] = useState([
    { id: 1, task: 'Complete SAIL steel order quality checks', dept: 'Quality Assurance', assignee: 'Dr. Meena Roy', deadline: '2025-08-05', priority: 'High', status: 'In Progress' },
    { id: 2, task: 'Clear pending PO approvals for zinc suppliers', dept: 'Purchase & Procurement', assignee: 'Ramesh Gupta', deadline: '2025-08-02', priority: 'Critical', status: 'Pending' },
    { id: 3, task: 'Arrange logistics for Tata Projects shipment', dept: 'Dispatch & Logistics', assignee: 'Suresh Pillai', deadline: '2025-08-10', priority: 'Medium', status: 'In Progress' },
  ]);

  const authHeader = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/leaves`,            { headers: authHeader() }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/users/directory`,   { headers: authHeader() }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/complaints`,        { headers: authHeader() }).then(r => r.ok ? r.json() : []),
    ]).then(([l, d, c]) => { 
      setLeaves(l); 
      setDirectory(d); 
      
      const baseAlerts = [...MOCK.alerts];
      const activeComplaints = c.filter(item => item.status !== 'Resolved' && item.status !== 'Closed');
      activeComplaints.forEach(comp => {
        if (user?.role === 'executive') {
          baseAlerts.unshift({
            id: `comp-ceo-${comp.complaintNo}`,
            priority: comp.severity === 'Showstopper' || comp.severity === 'Blocker' || comp.severity === 'Critical' ? 'Critical' : 'High',
            icon: '🚨',
            title: `Complaint ${comp.complaintNo} against ${comp.assignedTo} (${comp.customerName})`,
            dept: 'Quality',
            time: 'New'
          });
        } else if (user?.name && comp.assignedTo && comp.assignedTo.toLowerCase().includes(user.name.toLowerCase())) {
          baseAlerts.unshift({
            id: `comp-assignee-${comp.complaintNo}`,
            priority: 'Critical',
            icon: '🚨',
            title: `New Complaint ${comp.complaintNo} assigned to you (${comp.customerName})`,
            dept: 'Quality',
            time: 'New'
          });
        }
      });
      setAlerts(baseAlerts);
    });
    const ri = setInterval(() => setRefreshTime(nowTime()), 30000);
    return () => clearInterval(ri);
  }, [token, refreshTime, user]);

  /* ── Login ── */
  const doLogin = async (e) => {
    e?.preventDefault(); setLoginErr('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Login failed');
      localStorage.setItem('vrm_token', d.token);
      localStorage.setItem('vrm_user', JSON.stringify(d.user));
      localStorage.setItem('vrm_login_email', email);
      setToken(d.token);
      setUser(d.user);
      setLoggedIn(true);
      
      // Default routing based on role
      if (d.user.role === 'teamlead') {
        setActiveTab('production_dept');
      } else if (d.user.role === 'hr') {
        setActiveTab('hr_dashboard');
      } else if (d.user.role === 'procurementhead') {
        setActiveTab('procurement');
      } else if (d.user.role === 'accountshead') {
        setActiveTab('accounts');
      } else if (d.user.role === 'saleshead') {
        setActiveTab('sales');
      } else if (d.user.role === 'designhead') {
        setActiveTab('design');
      } else if (d.user.role === 'marketinghead') {
        setActiveTab('digital_marketing');
      } else if (d.user.role === 'employee') {
        setActiveTab('employee_dashboard');
      } else {
        setActiveTab('overview');
      }
    } catch (err) { setLoginErr(err.message); }
  };
  const doLogout = () => { 
    localStorage.removeItem('vrm_token'); 
    localStorage.removeItem('vrm_user');
    setToken(''); 
    setUser(null);
    setLoggedIn(false); 
  };

  const openDrill = (type, data) => { setDrillType(type); setDrillData(data); };
  const closeDrill = () => { setDrillType(''); setDrillData(null); };

  /* ── Critical count badge ── */
  const criticalAlerts = alerts.filter(a => a.priority === 'Critical').length;
  const pendingApprovals = MOCK.approvals.length;

  /* ════════════ LOGIN ════════════ */
  if (!loggedIn) return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo-row">
            <div className="login-logo-box">VRM</div>
            <div>
              <div className="login-company-name">VRM STRUCTURES</div>
              <div className="login-company-sub">India Pvt. Ltd.</div>
            </div>
          </div>
          <div className="login-portal-title">CEO Executive Control Center</div>
          <div className="login-tagline">"One System. One Process. One Goal."</div>

          <div className="login-stat-grid">
            {[
              { val: '₹78.4Cr', label: 'Monthly Revenue' },
              { val: '23.7%',   label: 'Net Profit' },
              { val: '87.3%',   label: 'OTD Rate' },
              { val: '82.4%',   label: 'OEE' },
              { val: '₹42.1Cr', label: 'PO Value' },
              { val: '7',       label: 'Critical Alerts' },
            ].map((s, i) => (
              <div key={i} className="login-stat-cell">
                <span className="login-stat-val">{s.val}</span>
                <span className="login-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="login-snapshot">
            <div className="login-snapshot-title">Live Plant Snapshot</div>
            {[
              { key: 'Active Orders',       val: '284' },
              { key: 'Delayed Orders',      val: '16 ⚠️' },
              { key: 'Machines Online',     val: '4 / 6' },
              { key: 'Pending PO Approvals',val: `${pendingApprovals}` },
              { key: 'Operators Present',   val: '183 / 200' },
            ].map((r, i) => (
              <div key={i} className="login-snapshot-row">
                <span className="login-snapshot-key">{r.key}</span>
                <span className="login-snapshot-val">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="lf-logo-row">
            <div className="lf-logo">VRM</div>
            <div>
              <div className="lf-brand">VRM STRUCTURES INDIA</div>
              <div className="lf-sub">Executive Command Centre</div>
            </div>
          </div>
          <div className="lf-title">
            {(() => {
              const emailLower = email.toLowerCase();
              if (emailLower.includes('production')) return `${greet()}, Production Head 🏭`;
              if (emailLower.includes('hr')) return `${greet()}, HR Head 👥`;
              if (emailLower.includes('procurement')) return `${greet()}, Procurement Head 📦`;
              if (emailLower.includes('accounts')) return `${greet()}, Accounts Head 💰`;
              if (emailLower.includes('sales')) return `${greet()}, Sales Head 📈`;
              if (emailLower.includes('design')) return `${greet()}, Design Head 🎨`;
              if (emailLower.includes('marketing')) return `${greet()}, Marketing Head 📣`;
              if (emailLower.includes('employee')) return `${greet()}, Sanjai Kumar 👤`;
              return `${greet()}, CEO 👔`;
            })()}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
            Sign in to access your master dashboard portal
          </div>

          <form onSubmit={doLogin}>
            <div className="form-field">
              <label>Corporate Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your corporate email" 
                required 
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoFocus />
            </div>
            {loginErr && <div style={{ color: 'var(--red)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.875rem', padding: '0.6rem', background: 'var(--red-bg)', borderRadius: 8 }}>⚠ {loginErr}</div>}
            <button type="submit" className="btn btn-primary btn-block" style={{ marginBottom: '0.875rem' }}>Access Command Centre →</button>
          </form>

          {(() => {
            const emailLower = email.toLowerCase();
            if (emailLower.includes('production')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">🏭</span>
                  <div>
                    <div className="access-role">Jawahir — Production Head</div>
                    <div className="access-desc">Full access to production tasks, OEE metrics, logs, and operator shift logs.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('hr')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">👥</span>
                  <div>
                    <div className="access-role">Dave Miller — HR Head</div>
                    <div className="access-desc">Full access to attendance logs, directories, leave approval systems.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('procurement')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">📦</span>
                  <div>
                    <div className="access-role">Aravind Swamy — Procurement Head</div>
                    <div className="access-desc">Full access to purchase lists, warehouse stocks, inventory controls.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('accounts')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">💰</span>
                  <div>
                    <div className="access-role">Sonia Verma — Accounts Head</div>
                    <div className="access-desc">Full access to P&L accounts, balance ledger, expense logs.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('sales')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">📈</span>
                  <div>
                    <div className="access-role">Rahul Khanna — Sales Head</div>
                    <div className="access-desc">Full access to sales pipeline, client directories, orders status.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('design')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">🎨</span>
                  <div>
                    <div className="access-role">Aditya Sharma — Design Head</div>
                    <div className="access-desc">Full access to design files status, engineering layouts, checklists.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('marketing')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">📣</span>
                  <div>
                    <div className="access-role">Sneha Gupta — Marketing Head</div>
                    <div className="access-desc">Full access to marketing campaigns, lead logs, analytics dashboard.</div>
                  </div>
                </div>
              );
            }
            if (emailLower.includes('employee')) {
              return (
                <div className="access-info" style={{ marginTop: '1rem' }}>
                  <span className="access-icon">👤</span>
                  <div>
                    <div className="access-role">Sanjai Kumar — Sales Employee</div>
                    <div className="access-desc">Personal portal: view sales tasks, track my attendance, submit leaves.</div>
                  </div>
                </div>
              );
            }
            return (
              <div className="access-info" style={{ marginTop: '1rem' }}>
                <span className="access-icon">👔</span>
                <div>
                  <div className="access-role">Velmurugan Rathinam — CEO</div>
                  <div className="access-desc">Full administrative access across all department nodes and settings.</div>
                </div>
              </div>
            );
          })()}

          <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today · {nowDate()}</div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'Montserrat', color: 'var(--text-sub)', fontWeight: 700 }}>{nowTime()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════ DASHBOARD ════════════ */
  return (
    <div className="portal-layout">

      {/* ─── TOP HEADER ─── */}
      <header className="top-header">
        {/* Brand Island Pill */}
        <div className="header-island-brand">
          <div className="header-logo-circle">V</div>
          <span className="header-company-name">VRM Structures</span>
        </div>

        {/* Center Navigation Island Pill */}
        <div className="header-center">
          {(() => {
            if (activeTab === 'settings') {
              return (
                <div className="header-nav-pills">
                  <button className={`header-nav-pill ${settingsSubTab === 'general' ? 'active' : ''}`} onClick={() => setSettingsSubTab('general')}>General & Branding</button>
                  <button className={`header-nav-pill ${settingsSubTab === 'roles' ? 'active' : ''}`} onClick={() => setSettingsSubTab('roles')}>Role & Permissions</button>
                  <button className={`header-nav-pill ${settingsSubTab === 'security' ? 'active' : ''}`} onClick={() => setSettingsSubTab('security')}>Security & Access</button>
                  <button className={`header-nav-pill ${settingsSubTab === 'database' ? 'active' : ''}`} onClick={() => setSettingsSubTab('database')}>Database & Engine</button>
                </div>
              );
            }
            if (activeTab === 'complaint_entry') {
              if (user?.role === 'executive') {
                return (
                  <div className="header-nav-pills">
                    <button className={`header-nav-pill ${complaintSubTab === 'overview' ? 'active' : ''}`} onClick={() => setComplaintSubTab('overview')}>Overview</button>
                    <button className={`header-nav-pill ${complaintSubTab === 'register' ? 'active' : ''}`} onClick={() => setComplaintSubTab('register')}>Complaint Register</button>
                  </div>
                );
              }
              if (user?.role === 'teamlead') {
                return (
                  <div className="header-nav-pills">
                    <button className={`header-nav-pill ${complaintSubTab === 'overview' ? 'active' : ''}`} onClick={() => setComplaintSubTab('overview')}>Overview</button>
                    <button className={`header-nav-pill ${complaintSubTab === 'register' ? 'active' : ''}`} onClick={() => setComplaintSubTab('register')}>My Backlog</button>
                  </div>
                );
              }
              if (user?.role === 'employee') {
                return (
                  <div className="header-nav-pills">
                    <button className={`header-nav-pill ${complaintSubTab === 'overview' ? 'active' : ''}`} onClick={() => setComplaintSubTab('overview')}>Overview</button>
                    <button className={`header-nav-pill ${complaintSubTab === 'form' ? 'active' : ''}`} onClick={() => setComplaintSubTab('form')}>New Complaint</button>
                    <button className={`header-nav-pill ${complaintSubTab === 'register' ? 'active' : ''}`} onClick={() => setComplaintSubTab('register')}>Complaint Register</button>
                  </div>
                );
              }
              return null;
            }
            const isDept = ['production_dept', 'procurement', 'accounts', 'sales', 'design', 'digital_marketing'].includes(activeTab);
            if (isDept) {
              if (user?.role !== 'executive') {
                const deptNames = {
                  production_dept: 'Production Dashboard',
                  procurement: 'Procurement Dashboard',
                  accounts: 'Accounts Dashboard',
                  sales: 'Sales Dashboard',
                  design: 'Design Dashboard',
                  digital_marketing: 'Marketing Dashboard'
                };
                return (
                  <div className="header-nav-pills">
                    <button className="header-nav-pill active">{deptNames[activeTab] || 'Dashboard'}</button>
                  </div>
                );
              }
              return (
                <div className="header-nav-pills">
                  <button className={`header-nav-pill ${activeTab === 'production_dept' ? 'active' : ''}`} onClick={() => setActiveTab('production_dept')}>Production</button>
                  <button className={`header-nav-pill ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>Procurement</button>
                  <button className={`header-nav-pill ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accounts</button>
                  <button className={`header-nav-pill ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Sales</button>
                  <button className={`header-nav-pill ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>Design</button>
                  <button className={`header-nav-pill ${activeTab === 'digital_marketing' ? 'active' : ''}`} onClick={() => setActiveTab('digital_marketing')}>Digital Marketing</button>
                </div>
              );
            } else {
              const pageNames = {
                overview: 'Dashboard',
                hr_dashboard: 'HR Dashboard',
                employee_dashboard: 'Employee Dashboard',
                attendance: 'Attendance Log',
                employees: 'Employees Directory',
                assign_works: 'Assign Task Manager',
                inventory: 'Inventory & Warehouse',
                approvals: 'Pending Approvals',
                settings_roles: 'Role Settings',
                settings: 'System Settings'
              };
              return (
                <div className="header-page-title-pill">
                  {pageNames[activeTab] || 'Dashboard'}
                </div>
              );
            }
          })()}
        </div>

        {/* Right Quick Controls Island Pill */}
        <div className="header-island-controls" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={20} style={{ cursor: 'pointer', color: 'var(--text-sub)' }} onClick={() => setShowNotifications(!showNotifications)} />
            <span style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, background: 'var(--red)', borderRadius: '50%' }} />
          </div>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <span className="badge badge-critical" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>{criticalAlerts} Critical</span>
              </div>
              <div className="notifications-list">
                {alerts.map(a => (
                  <div key={a.id} className="notification-dropdown-item" onClick={() => { setAlertModal(a); setShowNotifications(false); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                      <span className={`badge ${a.priority === 'Critical' ? 'badge-critical' : a.priority === 'High' ? 'badge-attention' : 'badge-navy'}`} style={{ fontSize: '0.58rem', padding: '1px 5px' }}>{a.priority}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontWeight: 600, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: 4 }}>Dept: {a.dept}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Far Right User Island Pill */}
        <div className="header-island-user">
          <img 
            src={user?.email === 'productionhead@workhub.com' 
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80' 
              : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80'
            } 
            alt={user?.name || 'User'} 
            className="header-avatar" 
          />
          <div style={{ marginRight: '0.25rem' }}>
            <div className="header-user-name">{user?.name || 'Velmurugan Rathinam'}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '1px' }}>{user?.email || 'executive@workhub.com'}</div>
          </div>
          <span style={{ fontSize: '0.65rem', opacity: 0.5, marginLeft: '0.25rem' }}>▼</span>
        </div>
      </header>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="sidebar">
        <div style={{ height: '56px' }}></div>

        {/* Mid Pill - Main Navigation Shortcuts */}
        <div className="sidebar-pill-mid">
          {(() => {
            const role = user?.role || '';
            if (role === 'teamlead') { // Production Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'production_dept' ? 'active' : ''}`} onClick={() => setActiveTab('production_dept')} title="Production Dashboard" data-tooltip="Production Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'complaint_entry' ? 'active' : ''}`} onClick={() => { setActiveTab('complaint_entry'); setComplaintSubTab('overview'); }} title="Complaint Entry" data-tooltip="Complaint Entry"><span className="nav-item-icon"><ClipboardList size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} title="Inventory & Warehouse" data-tooltip="Inventory & Warehouse"><span className="nav-item-icon"><Package size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')} title="Attendance Log" data-tooltip="Attendance Log"><span className="nav-item-icon"><Calendar size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')} title="Employees directory" data-tooltip="Employees Directory"><span className="nav-item-icon"><Users size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'assign_works' ? 'active' : ''}`} onClick={() => setActiveTab('assign_works')} title="Assign Works" data-tooltip="Assign Works"><span className="nav-item-icon"><ClipboardList size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')} style={{ background: activeTab === 'approvals' ? 'var(--red)' : 'var(--red-soft)', color: activeTab === 'approvals' ? '#fff' : 'var(--red)' }} title="Pending Approvals" data-tooltip="Pending Approvals"><span className="nav-item-icon"><CheckSquare size={22} /></span><span className="nav-item-badge">{pendingApprovals}</span></button>
                </>
              );
            }
            if (role === 'hr') { // HR Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'hr_dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('hr_dashboard')} title="HR Dashboard" data-tooltip="HR Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'procurementhead') { // Procurement Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')} title="Procurement Dashboard" data-tooltip="Procurement Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'accountshead') { // Accounts Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')} title="Accounts Dashboard" data-tooltip="Accounts Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'saleshead') { // Sales Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')} title="Sales Dashboard" data-tooltip="Sales Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'designhead') { // Design Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')} title="Design Dashboard" data-tooltip="Design Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'marketinghead') { // Marketing Head
              return (
                <>
                  <button className={`nav-item ${activeTab === 'digital_marketing' ? 'active' : ''}`} onClick={() => setActiveTab('digital_marketing')} title="Marketing Dashboard" data-tooltip="Marketing Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                </>
              );
            }
            if (role === 'employee') { // Sanjai Kumar
              return (
                <>
                  <button className={`nav-item ${activeTab === 'employee_dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('employee_dashboard')} title="My Dashboard" data-tooltip="My Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span></button>
                  <button className={`nav-item ${activeTab === 'complaint_entry' ? 'active' : ''}`} onClick={() => { setActiveTab('complaint_entry'); setComplaintSubTab('overview'); }} title="Complaint Entry" data-tooltip="Complaint Entry"><span className="nav-item-icon"><ClipboardList size={22} /></span></button>
                </>
              );
            }
            // CEO (all items)
            return (
              <>
                <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} title="Dashboard" data-tooltip="Dashboard"><span className="nav-item-icon"><LayoutDashboard size={22} /></span>{criticalAlerts > 0 && <span className="nav-item-badge">{criticalAlerts}</span>}</button>
                <button className={`nav-item ${activeTab === 'complaint_entry' ? 'active' : ''}`} onClick={() => { setActiveTab('complaint_entry'); setComplaintSubTab('overview'); }} title="Complaint Entry" data-tooltip="Complaint Entry"><span className="nav-item-icon"><ClipboardList size={22} /></span></button>
                <button className={`nav-item ${['production_dept', 'procurement', 'accounts', 'sales', 'design', 'digital_marketing'].includes(activeTab) ? 'active' : ''}`} onClick={() => setActiveTab('production_dept')} title="Departments" data-tooltip="Departments"><span className="nav-item-icon"><Building2 size={22} /></span></button>
                <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} title="Inventory & Warehouse" data-tooltip="Inventory & Warehouse"><span className="nav-item-icon"><Package size={22} /></span></button>
                <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')} title="Attendance Log" data-tooltip="Attendance Log"><span className="nav-item-icon"><Calendar size={22} /></span></button>
                <button className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')} title="Employees directory" data-tooltip="Employees Directory"><span className="nav-item-icon"><Users size={22} /></span></button>
                <button className={`nav-item ${activeTab === 'assign_works' ? 'active' : ''}`} onClick={() => setActiveTab('assign_works')} title="Assign Works" data-tooltip="Assign Works"><span className="nav-item-icon"><ClipboardList size={22} /></span></button>
                <button className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')} style={{ background: activeTab === 'approvals' ? 'var(--red)' : 'var(--red-soft)', color: activeTab === 'approvals' ? '#fff' : 'var(--red)' }} title="Pending Approvals" data-tooltip="Pending Approvals"><span className="nav-item-icon"><CheckSquare size={22} /></span><span className="nav-item-badge">{pendingApprovals}</span></button>
              </>
            );
          })()}
        </div>

        {/* Bot Pill - Help & Sign Out */}
        <div className="sidebar-pill-bot">
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() => setActiveTab('settings')} 
            title="Settings" 
            data-tooltip="Settings"
          >
            <span className="nav-item-icon"><Settings size={22} /></span>
          </button>
          <button className="nav-item" onClick={doLogout} title="Sign Out" data-tooltip="Sign Out" style={{ color: 'var(--red)' }}>
            <span className="nav-item-icon"><LogOut size={22} /></span>
          </button>
        </div>
      </aside>

      {/* ─── PAGE CONTENT ─── */}
      <main className="page-content">
        {activeTab === 'employee_dashboard' && (
          <div style={{ paddingTop: '1.25rem', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>Welcome back, Sanjai Kumar</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>Sales Employee · Department of SALES</p>
          </div>
        )}

        {/* ── KPI STRIP (Shows ONLY on Department sub-pages) ── */}
        {['production_dept', 'procurement', 'accounts', 'sales', 'design', 'digital_marketing', 'hr_dashboard', 'employee_dashboard'].includes(activeTab) && (() => {
          const getCards = () => {
            if (activeTab === 'hr_dashboard' || activeTab === 'employees') {
              return [
                { key: 'headcount', title: 'Total Headcount', icon: Users, color: '#0ea5e9', lightColor: '#e0f2fe', val: '206', unit: 'employees', label: 'Active employees', guide: '200', type: 'line', data: [200, 201, 202, 202, 204, 205, 205, 206] },
                { key: 'clockedin', title: 'Clocked In Today', icon: CheckSquare, color: '#22c55e', lightColor: '#dcfce7', val: '183', unit: 'present', label: '88% attendance rate', guide: '170', type: 'bar', data: [175, 178, 180, 182, 179, 183, 181, 183] },
                { key: 'pendingleaves', title: 'Pending Leaves', icon: Clock, color: '#ef4444', lightColor: '#fee2e2', val: '3', unit: 'leaves', label: 'Requires review', guide: '0', type: 'bar', data: [5, 4, 3, 2, 4, 3, 2, 3] },
                { key: 'onleavetoday', title: 'On Leave Today', icon: Calendar, color: '#f59e0b', lightColor: '#fef3c7', val: '5', unit: 'absent', label: 'Scheduled absences', guide: '5', type: 'line', data: [4, 5, 6, 4, 5, 5, 6, 5] }
              ];
            }
            if (activeTab === 'production_dept') {
              return [
                { key: 'oee', title: 'Overall OEE (Shift)', icon: Activity, color: '#0ea5e9', lightColor: '#e0f2fe', val: '82.4', unit: '%', label: 'Shift Avg target', guide: '80%', type: 'line', data: [72, 70, 73, 76, 81, 79, 83, 82.4] },
                { key: 'uptime', title: 'Machine Uptime Rate', icon: Zap, color: '#22c55e', lightColor: '#dcfce7', val: '94.2', unit: '%', label: 'Avg this week', guide: '92%', type: 'bar', data: [91, 90, 93, 94, 92, 93, 94, 94.2] },
                { key: 'batches', title: 'Batches Completed', icon: Package, color: '#ef4444', lightColor: '#fee2e2', val: '1,280', unit: 'runs', label: 'Monthly output', guide: '1.2k', type: 'bar', data: [980, 1020, 1100, 1150, 1200, 1220, 1250, 1280] },
                { key: 'rejects', title: 'Quality Reject Rate', icon: ShieldAlert, color: '#f59e0b', lightColor: '#fef3c7', val: '1.2', unit: '%', label: 'Target max', guide: '1.5%', type: 'line', data: [1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.3, 1.2] }
              ];
            }
            if (activeTab === 'procurement') {
              return [
                { key: 'poRaised', title: 'Total POs Raised', icon: ClipboardList, color: '#0ea5e9', lightColor: '#e0f2fe', val: '147', unit: 'POs', label: 'Avg this week', guide: '130', type: 'bar', data: [120, 115, 130, 140, 128, 135, 142, 147] },
                { key: 'poVal', title: 'Total PO Value', icon: CircleDollarSign, color: '#22c55e', lightColor: '#dcfce7', val: '42.1', unit: 'Cr', label: 'Avg this week', guide: '₹35Cr', type: 'bar', data: [32, 28, 38, 41, 34, 39, 43, 42.1] },
                { key: 'overduePo', title: 'Overdue POs', icon: AlertTriangle, color: '#ef4444', lightColor: '#fee2e2', val: '14', unit: 'POs', label: 'Avg this week', guide: '10', type: 'bar', data: [8, 11, 15, 12, 14, 13, 11, 14] },
                { key: 'overdueVal', title: 'Overdue Value', icon: ShieldAlert, color: '#f59e0b', lightColor: '#fef3c7', val: '3.6', unit: 'Cr', label: 'Avg this week', guide: '3.0', type: 'line', data: [2.5, 2.8, 3.2, 3.0, 3.5, 3.2, 3.4, 3.6] }
              ];
            }
            if (activeTab === 'accounts') {
              return [
                { key: 'rev', title: 'Accounts Revenue', icon: CircleDollarSign, color: '#0ea5e9', lightColor: '#e0f2fe', val: '78.4', unit: 'Cr', label: 'Avg this week', guide: '₹65Cr', type: 'bar', data: [35, 25, 45, 55, 30, 48, 60, 52, 65, 58, 70, 78.4] },
                { key: 'opex', title: 'Operating Expenses', icon: TrendingUp, color: '#ef4444', lightColor: '#fee2e2', val: '12.6', unit: 'Cr', label: 'Avg this week', guide: '₹14Cr', type: 'bar', data: [11.2, 12.0, 13.1, 12.5, 12.2, 12.6, 12.8, 12.6] },
                { key: 'np', title: 'Net Profit Margin', icon: CheckCircle, color: '#22c55e', lightColor: '#dcfce7', val: '18.5', unit: 'Cr', label: 'Avg this week', guide: '₹15Cr', type: 'bar', data: [12, 11, 15, 17, 13, 16, 18, 18.5] },
                { key: 'invoices', title: 'Pending Clearances', icon: Clock, color: '#f59e0b', lightColor: '#fef3c7', val: '18', unit: 'files', label: 'Awaiting Sign', guide: '20', type: 'line', data: [24, 22, 19, 21, 25, 20, 18, 18] }
              ];
            }
            if (activeTab === 'sales') {
              return [
                { key: 'pipeline', title: 'Active Sales Pipeline', icon: TrendingUp, color: '#0ea5e9', lightColor: '#e0f2fe', val: '14.8', unit: 'Cr', label: 'Avg this week', guide: '₹12Cr', type: 'line', data: [10, 11, 12.5, 13, 12.8, 13.5, 14, 14.8] },
                { key: 'closed', title: 'Closed Deals (Month)', icon: CircleDollarSign, color: '#22c55e', lightColor: '#dcfce7', val: '8.2', unit: 'Cr', label: 'Target: ₹7.5Cr', guide: '₹7.5Cr', type: 'bar', data: [6.2, 5.8, 6.9, 7.2, 7.0, 7.8, 8.0, 8.2] },
                { key: 'leads', title: 'New Leads Generated', icon: Users, color: '#ef4444', lightColor: '#fee2e2', val: '342', unit: 'leads', label: 'Avg this week', guide: '300', type: 'bar', data: [290, 310, 320, 305, 330, 325, 338, 342] },
                { key: 'conv', title: 'Deals Conversion Rate', icon: CheckSquare, color: '#f59e0b', lightColor: '#fef3c7', val: '24.5', unit: '%', label: 'Target: 22%', guide: '22%', type: 'line', data: [21.5, 22.0, 22.8, 23.5, 23.0, 24.0, 24.2, 24.5] }
              ];
            }
            if (activeTab === 'design') {
              return [
                { key: 'activejobs', title: 'Active CAD Projects', icon: ClipboardList, color: '#0ea5e9', lightColor: '#e0f2fe', val: '28', unit: 'jobs', label: 'Ongoing engineering', guide: '25', type: 'bar', data: [22, 24, 25, 23, 27, 26, 28, 28] },
                { key: 'pendingrev', title: 'Pending Design Reviews', icon: ShieldAlert, color: '#ef4444', lightColor: '#fee2e2', val: '4', unit: 'reviews', label: 'Awaiting CEO override', guide: '2', type: 'bar', data: [3, 2, 4, 1, 3, 5, 2, 4] },
                { key: 'completedlayouts', title: 'Completed Layouts', icon: CheckCircle, color: '#22c55e', lightColor: '#dcfce7', val: '184', unit: 'files', label: 'YTD Approved', guide: '150', type: 'bar', data: [140, 148, 155, 162, 170, 175, 180, 184] },
                { key: 'revcycles', title: 'Avg Revision Cycles', icon: Activity, color: '#f59e0b', lightColor: '#fef3c7', val: '1.8', unit: 'cycles', label: 'Target: < 2.0', guide: '2.0', type: 'line', data: [2.5, 2.2, 2.1, 2.0, 1.9, 1.8, 1.9, 1.8] }
              ];
            }
            if (activeTab === 'digital_marketing') {
              return [
                { key: 'budget', title: 'Ad Budget Burn', icon: CircleDollarSign, color: '#ef4444', lightColor: '#fee2e2', val: '14.5', unit: 'Lakh', label: 'Target: ₹15L', guide: '₹15L', type: 'bar', data: [12.0, 11.5, 13.0, 14.2, 13.8, 14.0, 14.4, 14.5] },
                { key: 'adleads', title: 'Total Campaign Leads', icon: Users, color: '#22c55e', lightColor: '#dcfce7', val: '4,820', unit: 'leads', label: 'MTD Performance', guide: '4.5k', type: 'bar', data: [3800, 4100, 4300, 4400, 4600, 4700, 4800, 4820] },
                { key: 'cpl', title: 'Cost Per Lead (CPL)', icon: TrendingUp, color: '#0ea5e9', lightColor: '#e0f2fe', val: '300', unit: 'INR', label: 'Target: < ₹320', guide: '₹320', type: 'line', data: [340, 330, 315, 310, 305, 300, 305, 300] },
                { key: 'leadquality', title: 'Lead Quality Index', icon: CheckCircle, color: '#f59e0b', lightColor: '#fef3c7', val: '84', unit: '%', label: 'Avg this week', guide: '80%', type: 'line', data: [78, 80, 81, 83, 82, 84, 83, 84] }
              ];
            }
            if (activeTab === 'employee_dashboard') {
              return [
                { key: 'dealsclosed', title: 'Deals Closed This Month', icon: CheckSquare, color: '#22c55e', lightColor: '#dcfce7', val: '8', unit: 'deals', label: 'Personal Target: 10', guide: '10', type: 'bar', data: [4, 6, 7, 5, 8, 7, 6, 8] },
                { key: 'leadfollow', title: 'Leads Followed Up', icon: Users, color: '#ef4444', lightColor: '#fee2e2', val: '42', unit: 'leads', label: '91% response rate', guide: '40', type: 'line', data: [32, 35, 38, 41, 39, 43, 40, 42] },
                { key: 'empleaves', title: 'Pending Leave Submits', icon: Calendar, color: '#f59e0b', lightColor: '#fef3c7', val: '1', unit: 'request', label: 'Awaiting HR review', guide: '0', type: 'line', data: [0, 0, 1, 0, 0, 1, 0, 1] }
              ];
            }
            // CEO Overview
            return [
              { key: 'revenue', title: 'Revenue for the last 8 weeks', icon: CircleDollarSign, color: '#0ea5e9', lightColor: '#e0f2fe', val: '78.4', unit: 'Cr', label: 'Avg this week', guide: '₹65Cr', type: 'bar', data: [35, 25, 45, 55, 30, 48, 60, 52, 65, 58, 70, 78.4] },
              { key: 'netProfit', title: 'Net Profit Margin Last 8 weeks', icon: TrendingUp, color: '#ef4444', lightColor: '#fee2e2', val: '23.7', unit: '%', label: 'Avg this week', guide: '20%', type: 'bar', data: [15, 12, 18, 22, 14, 19, 21, 20, 23, 21, 22, 23.7] },
              { key: 'otd', title: 'On-Time Delivery Last 8 weeks', icon: Package, color: '#22c55e', lightColor: '#dcfce7', val: '87.3', unit: '%', label: 'Avg this week', guide: '80%', type: 'bar', data: [75, 78, 80, 85, 76, 82, 84, 83, 85, 84, 86, 87.3] },
              { key: 'oee', title: 'OEE for the last 8 weeks', icon: Activity, color: '#f59e0b', lightColor: '#fef3c7', val: '82.4', unit: '%', label: 'Avg this week', guide: '80', type: 'line', data: [72, 70, 73, 76, 81, 79, 83, 82.4] }
            ];
          };
          const cards = getCards();

          return (
            <div className="kpi-strip" style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: '1.25rem', marginBottom: '1.5rem' }}>
              {cards.map(c => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '240px',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Icon + Title */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} style={{ color: c.color }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-h)' }}>{c.title}</span>
                      </div>
                    </div>

                    {/* Middle Value Row */}
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'Montserrat', fontSize: '1.85rem', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.02em', lineHeight: 1 }}>{c.val}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.unit}</span>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div style={{ height: '75px', position: 'relative', marginTop: 'auto' }}>
                      {c.type === 'bar' ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e2e8f0', zIndex: 1 }} />
                          <span style={{ position: 'absolute', top: '18%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', zIndex: 2 }}>{c.guide}</span>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', width: '100%', paddingLeft: '32px' }}>
                            {c.data.map((val, idx) => {
                              const maxVal = Math.max(...c.data);
                              const pctHeight = (val / maxVal) * 80;
                              const isLast = idx === c.data.length - 1;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: '6px',
                                    height: `${pctHeight}%`,
                                    background: isLast ? c.color : c.lightColor,
                                    borderRadius: '3px',
                                    zIndex: 2
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '1px', borderTop: '1px solid #f1f5f9' }} />
                          <div style={{ position: 'absolute', bottom: '20%', left: 0, right: 0, height: '1px', borderTop: '1px solid #f1f5f9' }} />
                          {(() => {
                            const minVal = Math.min(...c.data);
                            const maxVal = Math.max(...c.data);
                            return (
                              <>
                                <span style={{ position: 'absolute', top: '5%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>{Math.round(maxVal)}</span>
                                <span style={{ position: 'absolute', bottom: '5%', left: 0, fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>{Math.round(minVal)}</span>
                              </>
                            );
                          })()}

                          <div style={{ width: '100%', height: '100%', paddingLeft: '24px', position: 'relative' }}>
                            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '14px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }} />
                            
                            <svg viewBox="0 0 160 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                              {(() => {
                                const minVal = Math.min(...c.data);
                                const maxVal = Math.max(...c.data);
                                const range = maxVal - minVal || 1;
                                const w = 150, h = 40;
                                const points = c.data.map((val, idx) => ({
                                  x: idx * (w / (c.data.length - 1)),
                                  y: h - ((val - minVal) / range) * h
                                }));
                                const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                return (
                                  <>
                                    <path d={pathD} fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" />
                                    <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="3.5" fill={c.color} stroke="#fff" strokeWidth="1.5" />
                                  </>
                                );
                              })()}
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom timeframe selector layout */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.625rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {['Week', 'Month', 'Year'].map(tf => {
                          const active = kpiTimeframe[c.key] === tf;
                          return (
                            <span
                              key={tf}
                              onClick={(e) => {
                                e.stopPropagation();
                                setKpiTimeframe(prev => ({ ...prev, [c.key]: tf }));
                              }}
                              style={{
                                background: active ? '#111827' : 'transparent',
                                color: active ? '#ffffff' : 'var(--text-muted)',
                                borderRadius: '99px',
                                padding: '2px 8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {tf}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── TAB PANELS ── */}
        {activeTab === 'employee_dashboard' && <EmployeeDashboardTab user={user} />}
        {activeTab === 'complaint_entry'    && <ComplaintEntryTab subTab={complaintSubTab} setSubTab={setComplaintSubTab} user={user} />}
        {activeTab === 'hr_dashboard'       && <HrDashboardTab directory={directory} />}
        {activeTab === 'overview'          && <OverviewTab    onDrill={openDrill} onAlertClick={a => setAlertModal(a)} userName={user?.name} />}
        {activeTab === 'production_dept'   && <ProductionTab  onDrill={openDrill} />}
        {activeTab === 'procurement'       && <PurchaseTab    onDrill={openDrill} />}
        {activeTab === 'accounts'          && <FinanceTab     onDrill={openDrill} />}
        {activeTab === 'sales'             && <OperationsTab  onDrill={openDrill} />}
        {activeTab === 'design'            && <DesignTab      onDrill={openDrill} />}
        {activeTab === 'digital_marketing' && <DigitalMarketingTab />}
        {activeTab === 'inventory'         && <InventoryTab   onDrill={openDrill} />}
        {activeTab === 'attendance'        && <AttendanceTab />}
        {activeTab === 'employees'         && <EmployeeTab    leaves={leaves} directory={directory} onDrill={openDrill} />}
        {activeTab === 'assign_works'      && <AssignWorksTab tasks={assignedTasks} onAssign={t => setAssignedTasks([t, ...assignedTasks])} directory={directory} />}
        {activeTab === 'approvals'         && <ApprovalsTab />}
        {activeTab === 'settings'          && <SettingsTab currentUserRole={user?.role} directory={directory} token={token} activeSubTab={settingsSubTab} setActiveSubTab={setSettingsSubTab} />}

      </main>

      {/* ─── DRILL-DOWN MODAL ─── */}
      {(() => {
        const ModalIcon = ({ type, data }) => {
          const size = 18;
          const style = { marginRight: '8px', display: 'inline-flex', alignSelf: 'center', color: 'var(--accent)' };
          
          if (type === 'dept') {
            const Icon = {
              purchase: ShoppingCart,
              production: Factory,
              quality: CheckCircle,
              dispatch: Package,
              data: Database,
              marketing: TrendingUp,
            }[data?.id] || Building2;
            return <Icon size={size} style={style} />;
          }
          
          if (type === 'kpi') {
            const Icon = {
              CircleDollarSign: CircleDollarSign,
              TrendingUp: TrendingUp,
              Package: Package,
              Activity: Activity,
              ShoppingCart: ShoppingCart,
              ShieldAlert: ShieldAlert,
            }[data?.iconName] || CircleDollarSign;
            return <Icon size={size} style={style} />;
          }
          
          if (type === 'machine') return <Activity size={size} style={style} />;
          if (type === 'vendor') return <Building2 size={size} style={style} />;
          if (type === 'inventory') return <Package size={size} style={style} />;
          return null;
        };

        return (
          <DrillModal
            open={!!drillData}
            onClose={closeDrill}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ModalIcon type={drillType} data={drillData} />
                <span>
                  {drillType === 'dept'    ? drillData?.name :
                   drillType === 'order'   ? `Order Drill-Down — ${drillData?.id}` :
                   drillType === 'kpi'     ? drillData?.label :
                   drillType === 'machine' ? `${drillData?.name} — OEE Detail` :
                   drillType === 'vendor'  ? drillData?.name :
                   drillType === 'inventory' ? drillData?.name :
                   'Detail View'}
                </span>
              </div>
            }
            subtitle={
              drillType === 'dept'  ? `Head: ${drillData?.head} · ${drillData?.hc} employees` :
              drillType === 'order' ? `${drillData?.customer} · ${drillData?.product} · ${drillData?.value}` :
              drillType === 'kpi'   ? `Target: ${drillData?.target}${typeof drillData?.target === 'number' && drillData.target > 100 ? '' : '%'} · Current: ${drillData?.val}` :
              null
            }
          >
        {drillType === 'dept' && drillData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { l: 'Target %', v: `${drillData.target}%` },
                { l: 'Achieved %', v: `${drillData.achieved}%`, c: getDeptColor(drillData.achieved, drillData.target) },
                { l: 'Headcount', v: drillData.hc },
              ].map((s, i) => (
                <div key={i} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1.5rem', color: s.c ? `var(--${s.c})` : 'var(--text-h)' }}>{s.v}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="prog-hd"><span className="prog-label">Performance vs Target</span><span className="prog-val" style={{ color: `var(--${getDeptColor(drillData.achieved, drillData.target)})` }}>{Math.round((drillData.achieved/drillData.target)*100)}%</span></div>
              <div className="prog-track"><div className={`prog-fill ${getDeptColor(drillData.achieved, drillData.target)}`} style={{ width: `${(drillData.achieved/drillData.target)*100}%` }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary btn-sm">Email Dept Head</button>
              <button className="btn btn-warning btn-sm">View Department Report</button>
              <button className="btn btn-ghost btn-sm">Expand Full View</button>
            </div>
          </div>
        )}
        {drillType === 'order' && drillData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {[
                { l: 'Order No.',   v: drillData.id },
                { l: 'Customer',    v: drillData.customer },
                { l: 'Product',     v: drillData.product },
                { l: 'Order Value', v: drillData.value },
                { l: 'Delay Days',  v: `${drillData.delayDays} days` },
                { l: 'Root Cause',  v: drillData.reason },
              ].map((s, i) => (
                <div key={i} style={{ padding: '0.875rem', background: 'var(--bg-app)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontFamily: 'Montserrat', fontWeight: 600, color: 'var(--text-h)', fontSize: '0.9rem' }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm">Override Deadline (+5 Days)</button>
              <button className="btn btn-warning btn-sm">Reassign Lead</button>
              <button className="btn btn-danger btn-sm">Escalate to Customer</button>
              <button className="btn btn-ghost btn-sm">Print Details</button>
            </div>
          </div>
        )}
        {drillType === 'machine' && drillData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {[
                { l: 'OEE', v: drillData.oee ? `${drillData.oee}%` : '—', c: drillData.oee >= 85 ? 'green' : drillData.oee >= 70 ? 'amber' : 'red' },
                { l: 'Availability', v: drillData.avail ? `${drillData.avail}%` : '—', c: 'navy' },
                { l: 'Performance',  v: drillData.perf  ? `${drillData.perf}%`  : '—', c: 'navy' },
                { l: 'Quality',      v: drillData.qual  ? `${drillData.qual}%`  : '—', c: 'navy' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1.5rem', color: `var(--${s.c})` }}>{s.v}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.875rem', background: 'var(--red-bg)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--red-dark)', fontSize: '0.85rem' }}>Status: {drillData.status}</div>
              {drillData.status === 'Breakdown' && <div style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 4 }}>Machine is offline. Estimated 6hr downtime. Contact maintenance team immediately.</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm">Log Maintenance</button>
              <button className="btn btn-warning btn-sm">View History</button>
            </div>
          </div>
        )}
        {drillType === 'kpi' && drillData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {[
                { l: 'Current Value', v: drillData.val },
                { l: 'Previous Month', v: typeof drillData.prev === 'number' ? (drillData.label.includes('Revenue') || drillData.label.includes('PO') ? `₹${drillData.prev}Cr` : `${drillData.prev}${drillData.label.includes('Margin') || drillData.label.includes('Rate') || drillData.label.includes('OEE') ? '%' : ''}`) : String(drillData.prev) },
                { l: 'Target', v: drillData.target !== null ? `${drillData.target}${typeof drillData.target === 'number' && drillData.target <= 100 ? '%' : ''}` : 'N/A' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1.5rem', color: 'var(--text-h)' }}>{s.v}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm">📊 Full Trend Report</button>
              <button className="btn btn-ghost btn-sm">📥 Download Data</button>
            </div>
          </div>
        )}
        {(drillType === 'vendor' || drillType === 'inventory' || drillType === 'pl') && drillData && (
          <div>
            <div style={{ background: 'var(--bg-app)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
              <pre style={{ fontFamily: 'Montserrat', fontSize: '0.78rem', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(drillData, null, 2)}</pre>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm">📊 Detailed Report</button>
              <button className="btn btn-ghost btn-sm" onClick={closeDrill}>Close</button>
            </div>
          </div>
        )}
      </DrillModal>
      );
      })()}

      {/* ─── ALERT DETAIL MODAL ─── */}
      <DrillModal
        open={!!alertModal}
        onClose={() => setAlertModal(null)}
        title={
          alertModal ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ShieldAlert size={18} style={{ marginRight: '8px', color: 'var(--red)' }} />
              <span>{alertModal.priority} Alert</span>
            </div>
          ) : ''
        }
        subtitle={alertModal?.dept}
      >
        {alertModal && (
          <div>
            <div style={{ padding: '1rem', background: alertModal.priority === 'Critical' ? 'var(--red-bg)' : 'var(--amber-bg)', borderRadius: 10, border: `1px solid ${alertModal.priority === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.925rem', lineHeight: 1.5 }}>{alertModal.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: 6 }}>{alertModal.dept} · {alertModal.time}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm">Acknowledge</button>
              <button className="btn btn-warning btn-sm">Escalate to HOD</button>
              <button className="btn btn-ghost btn-sm">View Full Log</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAlertModal(null)}>Close</button>
            </div>
          </div>
        )}
      </DrillModal>

    </div>
  );
}
