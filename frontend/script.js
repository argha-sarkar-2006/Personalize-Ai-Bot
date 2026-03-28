const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navBtns = document.querySelectorAll('.nav-btn');
    const panels = document.querySelectorAll('.panel');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active-panel'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active-panel');
        });
    });

    // Upload Logic
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const uploadStatus = document.getElementById('upload-status');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-color)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        if(e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        showStatus('Uploading and processing...', '');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if(response.ok) {
                showStatus(data.message, 'success');
            } else {
                showStatus(data.detail || 'Upload failed', 'error');
            }
        } catch (error) {
            showStatus('Network error occurred.', 'error');
        }
    }

    function showStatus(msg, type) {
        uploadStatus.style.display = 'block';
        uploadStatus.textContent = msg;
        uploadStatus.className = 'status-msg mt-3';
        if(type === 'success') uploadStatus.classList.add('status-success');
        if(type === 'error') uploadStatus.classList.add('status-error');
    }

    // Summary Logic
    const btnGenerateSummary = document.getElementById('btn-generate-summary');
    const summaryContent = document.getElementById('summary-content');

    btnGenerateSummary.addEventListener('click', async () => {
        summaryContent.innerHTML = '<p class="placeholder-text">Generating summary, please wait...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/summary`);
            const data = await response.json();
            if(response.ok) {
                summaryContent.innerHTML = marked.parse(data.summary);
            } else {
                summaryContent.innerHTML = `<p class="placeholder-text status-error">Error: ${data.detail}</p>`;
            }
        } catch (error) {
            summaryContent.innerHTML = `<p class="placeholder-text status-error">Network error.</p>`;
        }
    });

    // Chatbot Logic
    const chatInput = document.getElementById('chat-input');
    const btnSendChat = document.getElementById('btn-send-chat');
    const chatHistory = document.getElementById('chat-history');

    btnSendChat.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendChatMessage();
    });

    async function sendChatMessage() {
        const question = chatInput.value.trim();
        if(!question) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.innerHTML = `<p>${question}</p>`;
        chatHistory.appendChild(userMsg);
        
        chatInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Add loading bot message
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = `<p>Thinking...</p>`;
        chatHistory.appendChild(botMsg);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await response.json();
            
            if(response.ok) {
                botMsg.innerHTML = marked.parse(data.answer);
            } else {
                botMsg.innerHTML = `<p class="status-error">Error: ${data.detail}</p>`;
            }
        } catch (error) {
            botMsg.innerHTML = `<p class="status-error">Network error.</p>`;
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Statistics Logic
    const btnFetchStats = document.getElementById('btn-fetch-stats');
    const statsContent = document.getElementById('stats-content');

    btnFetchStats.addEventListener('click', async () => {
        statsContent.innerHTML = '<p class="placeholder-text">Fetching statistics...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/statistics`);
            const data = await response.json();
            if(data.error) {
                statsContent.innerHTML = `<p class="placeholder-text">${data.error}</p>`;
                return;
            }
            
            renderStatsTable(data.statistics);

        } catch (error) {
            statsContent.innerHTML = `<p class="placeholder-text status-error">Network error.</p>`;
        }
    });

    function renderStatsTable(statsData) {
        let html = `<h3>Dataset Financial Profile</h3>`;
        
        html += `<table><thead><tr><th>Metric</th>`;
        statsData.columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += `</tr></thead><tbody>`;

        const metrics = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
        metrics.forEach(metric => {
            html += `<tr><td><strong>${metric}</strong></td>`;
            statsData.columns.forEach(col => {
                const val = statsData.summary[col][metric];
                html += `<td>${val !== undefined ? val.toFixed(2) : '-'}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        statsContent.innerHTML = html;
    }

    // Mind Map Logic
    const btnGenerateMindmap = document.getElementById('btn-generate-mindmap');
    const mindmapContent = document.getElementById('mindmap-content');

    btnGenerateMindmap.addEventListener('click', async () => {
        mindmapContent.innerHTML = '<p class="placeholder-text">Extracting structure, please wait...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/mindmap`);
            const data = await response.json();
            if(response.ok) {
                mindmapContent.innerHTML = marked.parse(data.mindmap);
            } else {
                mindmapContent.innerHTML = `<p class="placeholder-text status-error">Error: ${data.detail}</p>`;
            }
        } catch (error) {
            mindmapContent.innerHTML = `<p class="placeholder-text status-error">Network error.</p>`;
        }
    });
});
