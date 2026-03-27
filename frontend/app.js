const API_BASE = "http://127.0.0.1:8000/api";
let acknowledgedAlerts = new Set();
let previousData = []; // Store past states to manage animations

// DOM Elements
const empForm = document.getElementById("add-employee-form");
const simForm = document.getElementById("simulate-form");
const tbody = document.getElementById("employee-tbody");
const alertOverlay = document.getElementById("alert-overlay");
const alertContent = document.getElementById("alert-content");

// Counters
const totalEmpCount = document.getElementById("total-emp-count");
const activeEmpCount = document.getElementById("active-emp-count");
const breachEmpCount = document.getElementById("breach-emp-count");

// Toast Notification System
function showToast(type, title, message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if(type === 'success') iconName = 'check-circle';
    if(type === 'error') iconName = 'x-circle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-msg">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Add Employee
empForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("emp-name").value;
    const role = document.getElementById("emp-role").value;
    const btn = empForm.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerHTML = `<i data-lucide="loader" class="feather-spin"></i> Processing...`;
    lucide.createIcons();
    
    try {
        const res = await fetch(`${API_BASE}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, role: parseInt(role) })
        });
        if (res.ok) {
            empForm.reset();
            showToast('success', 'Employee Registered', `${name} has been added to the system.`);
            fetchEmployees();
        } else {
            showToast('error', 'Registration Failed', 'Server rejected the request.');
        }
    } catch (err) {
        showToast('error', 'Connection Error', 'Could not connect to the server.');
        console.error("Error adding employee:", err);
    } finally {
        btn.innerHTML = originalText;
    }
});

// Simulate Activity
simForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const employee_id = document.getElementById("sim-id").value;
    const site_worked_on = document.getElementById("sim-site").value;

    try {
        const res = await fetch(`${API_BASE}/activity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: parseInt(employee_id), site_worked_on })
        });
        if (res.ok) {
            simForm.reset();
            showToast('success', 'Trace Injected', `Activity trace added for ID ${employee_id}.`);
            fetchEmployees(); // instant update
        } else {
            showToast('error', 'Injection Failed', 'Invalid employee ID or format.');
        }
    } catch (err) {
        showToast('error', 'Connection Error', 'Server is unreachable.');
        console.error("Error simulating activity:", err);
    }
});

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
}

function getAvatarColor(id) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[id % colors.length];
}

// Fetch Employees Loop
async function fetchEmployees() {
    try {
        const res = await fetch(`${API_BASE}/employees`);
        const data = await res.json();
        
        // Update stats
        totalEmpCount.innerText = data.length;
        let activeCount = 0;
        let breachCount = 0;
        
        let newHtml = "";
        
        data.forEach(emp => {
            const inactiveSecs = Math.floor(emp.inactive_duration);
            const isBreach = emp.role === 1 && inactiveSecs > 300;
            
            if (emp.status === "Active") activeCount++;
            if (isBreach) breachCount++;
            
            let statusClass = "badge-inactive";
            let statusIcon = "clock";
            let displayStatus = emp.status;

            if (emp.status === "Active") {
                statusClass = "badge-active";
                statusIcon = "activity";
            }
            if (isBreach) {
                statusClass = "badge-breach";
                statusIcon = "alert-triangle";
                displayStatus = "BREACH";
            }
            
            let timeColorClass = isBreach ? "high" : "";
            const initial = getInitials(emp.name);
            const bgColor = getAvatarColor(emp.id);

            newHtml += `
                <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar" style="background: ${bgColor}; color: white;">${initial}</div>
                            <div class="user-details">
                                <strong>${emp.name}</strong>
                                <span>ID: #${emp.id}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">
                            Role ${emp.role} ${emp.role === 1 ? '(Strict)' : ''}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">
                            <i data-lucide="${statusIcon}"></i> ${displayStatus}
                        </span>
                    </td>
                    <td><span class="idle-time ${timeColorClass}">${inactiveSecs} s</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" 
                                onclick="document.getElementById('sim-id').value = ${emp.id}; document.getElementById('sim-id').focus();">
                            <i data-lucide="crosshair"></i> Target
                        </button>
                    </td>
                </tr>
            `;
        });
        
        activeEmpCount.innerText = activeCount;
        breachEmpCount.innerText = breachCount;
        
        if (tbody.innerHTML !== newHtml) {
            tbody.innerHTML = newHtml;
            lucide.createIcons();
        }
        
    } catch (err) {
        console.error("Failed to fetch employees:", err);
    }
}

// Fetch Alerts Loop
async function checkAlerts() {
    try {
        const res = await fetch(`${API_BASE}/alerts`);
        const alerts = await res.json();
        
        if (alerts.length > 0) {
            // Find unacknowledged alerts
            const newAlerts = alerts.filter(a => !acknowledgedAlerts.has(`${a.employee_id}-${a.inactive_seconds}`));
            
            if (newAlerts.length > 0) {
                showAlert(newAlerts);
                newAlerts.forEach(a => acknowledgedAlerts.add(`${a.employee_id}-${a.inactive_seconds}`));
            }
        }
    } catch (err) {
        console.error("Failed to check alerts:", err);
    }
}

function showAlert(alerts) {
    let html = `
        <p>The following strict-monitor (Role 1) employees have exceeded the 5-minute inactivity limit.</p>
        <ul>
    `;
    alerts.forEach(a => {
        html += `<li><strong>${a.name}</strong> (ID: ${a.employee_id}) - ${a.inactive_seconds}s idle</li>`;
        
        // As explicitly requested by the user previously:
        // Use standard JS alert in addition to our stunning UI.
        setTimeout(() => {
            alert(\`⚠️ URGENT NOTIFICATION ⚠️\\n\\nEmployee \${a.name} (ID: \${a.employee_id}) has critically violated the inactivity threshold (\${a.inactive_seconds}s)!\`);
        }, 300);
    });
    html += "</ul>";
    
    alertContent.innerHTML = html;
    alertOverlay.classList.remove("hidden");
    
    // Play an alert sound automatically if the browser allows
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'triangle';
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 1);
    } catch(e) {}
}

window.dismissAlert = function() {
    alertOverlay.classList.add("hidden");
}

// Global feather icon spin animation
const style = document.createElement('style');
style.textContent = \`
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .feather-spin { animation: spin 2s linear infinite; }
\`;
document.head.appendChild(style);

// Polling setup
setInterval(fetchEmployees, 2000); // Check statuses every 2 seconds
setInterval(checkAlerts, 5000);    // Check for alerts every 5 seconds

// Initial setup
fetchEmployees();
