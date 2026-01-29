function escapeHTML(s) {
  return (''+s).replace(/[&<>"'`]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'
  }[c]));
}
function escapeAttr(s) { return escapeHTML(s).replace(/"/g,'&quot;'); }

function fetchConnections() {
  fetch('/api/connections')
    .then(resp => resp.json())
    .then(cons => {
      let tbody = document.querySelector('#connTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      let empty = true;
      Object.entries(cons).forEach(([type, dbs]) => {
        Object.entries(dbs).forEach(([name, details]) => {
          empty = false;
          let tr = document.createElement('tr');
          // Render details as a tidy table, not raw JSON
          let detailRows = "";
          Object.entries(details).forEach(([k, v]) => {
            // Skip default flags and mask password field in display
            if (k.startsWith('default_')) return;
            let displayValue = (k.toLowerCase() === 'password') ? '********' : escapeHTML(v);
            detailRows += `<tr><td style="font-weight:600;padding-right:4px;color:#357cf9;">${escapeHTML(k)}:</td><td>${displayValue}</td></tr>`;
          });
          let defaultStatus = '';
          if (details.default_source) defaultStatus += '<span style="color:#2ecc71;font-weight:600;">★ Default Source</span>';
          if (details.default_destination) defaultStatus += (defaultStatus ? ' | ' : '') + '<span style="color:#f39c12;font-weight:600;">★ Default Destination</span>';
          if (defaultStatus) {
            detailRows += `<tr><td style="font-weight:600;padding-right:4px;color:#357cf9;">Status:</td><td>${defaultStatus}</td></tr>`;
          }
          tr.innerHTML = `
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(type)}</td>
            <td><table class="details-table">${detailRows}</table></td>
            <td class="action-btns">
              <button class="btn edit-btn" type="button" onclick="editConn('${escapeAttr(type)}', '${escapeAttr(name)}')">Edit</button>
              <button class="btn delete-btn" type="button" onclick="delConn('${escapeAttr(name)}')">Delete</button>
            </td>`;
          tbody.appendChild(tr);
        });
      });
      if (empty) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#8b92ad;">No connections found.</td></tr>`;
      }
    });
}

// Show fields dynamically after db_type selection
function showFields() {
  let db_type = document.getElementById('db_type').value;
  let fieldsDiv = document.getElementById('fields');
  let html = '';
  if (db_type === "oracle") {
    html = `
      <label>User id:</label><input id="user" required autocomplete="new-password"><br>
      <label>Password:</label><input id="password" type="password" required autocomplete="new-password"><br>
      <label>DSN: </label><input id="dsn" required><br>
      <small>(e.g., "localhost:port/sid or service name")</small>
    `;
  } else if (["postgresql", "mysql", "sqlserver"].includes(db_type)) {
    html = `
      <label>User id:</label><input id="user" required autocomplete="new-password"><br>
      <label>Password:</label><input id="password" type="password" required autocomplete="new-password"><br>
      <label>Host:</label><input id="host" required><br>
      <label>Port:</label><input id="port" required><br>
      <label>Database:</label><input id="database" required><br>
    `;
  } else {
    html = '';
  }
  fieldsDiv.innerHTML = html;
}

// Delete
function delConn(name) {
  if (confirm('Delete connection ' + name + '?')) {
    fetch('/api/connections?name=' + encodeURIComponent(name), { method: 'DELETE' })
      .then(() => fetchConnections());
  }
}

// Edit
function editConn(db_type, name) {
  fetch('/api/connections')
    .then(r => r.json())
    .then(cons => {
      const details = cons[db_type][name];
      document.getElementById('name').value = name;
      document.getElementById('db_type').value = db_type;
      showFields();
      setTimeout(() => {
        Object.entries(details).forEach(([k,v]) => {
          if (document.getElementById(k)) document.getElementById(k).value = v;
        });
        // Set default preference dropdown
        const defaultRole = document.getElementById('default_role');
        if (details.default_source) {
          defaultRole.value = 'source';
        } else if (details.default_destination) {
          defaultRole.value = 'destination';
        } else {
          defaultRole.value = '';
        }
        document.getElementById('name').readOnly = true;
        document.getElementById('db_type').disabled = true;
      }, 10);
    });
}

// Reset
function resetForm() {
  document.getElementById('connForm').reset();
  document.getElementById('fields').innerHTML = '';
  document.getElementById('name').readOnly = false;
  document.getElementById('db_type').disabled = false;
  document.getElementById('default_role').value = '';
}

// Add event for type selection (fix: ensures changing type shows fields)
document.getElementById('db_type').addEventListener('change', showFields);

// Reset button handler
document.getElementById('resetConnBtn').onclick = resetForm;

// Save (Add/Edit)
document.getElementById('connForm').onsubmit = function(e) {
  e.preventDefault();
  let db_type = document.getElementById('db_type').value;
  let name = document.getElementById('name').value;
  let details = {};
  if (db_type === "oracle") {
    details.user = document.getElementById('user').value;
    details.password = document.getElementById('password').value;
    details.dsn = document.getElementById('dsn').value;
  } else {
    details.user = document.getElementById('user').value;
    details.password = document.getElementById('password').value;
    details.host = document.getElementById('host').value;
    details.port = document.getElementById('port').value;
    details.database = document.getElementById('database').value;
  }
  const defaultRole = document.getElementById('default_role').value;
  details.default_source = defaultRole === 'source';
  details.default_destination = defaultRole === 'destination';
  
  // Check for existing defaults before saving
  if (details.default_source || details.default_destination) {
    fetch('/api/connections')
      .then(resp => resp.json())
      .then(cons => {
        let existingDefaultSource = null;
        let existingDefaultDest = null;
        
        // Find existing defaults (excluding current being edited)
        Object.entries(cons).forEach(([type, dbs]) => {
          Object.entries(dbs).forEach(([n, d]) => {
            if (n !== name) {
              if (d.default_source) existingDefaultSource = n;
              if (d.default_destination) existingDefaultDest = n;
            }
          });
        });
        
        let confirmMsg = '';
        if (details.default_source && existingDefaultSource) {
          confirmMsg = `A default source connection is already set to "${existingDefaultSource}". Do you want to replace it with "${name}"?`;
        }
        if (details.default_destination && existingDefaultDest) {
          confirmMsg = `A default destination connection is already set to "${existingDefaultDest}". Do you want to replace it with "${name}"?`;
        }
        
        if (confirmMsg && !confirm(confirmMsg)) {
          return;
        }
        
        saveConnection(name, db_type, details);
      });
  } else {
    saveConnection(name, db_type, details);
  }
};

function saveConnection(name, db_type, details) {
  fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, db_type, details })
  }).then(() => { resetForm(); fetchConnections(); });
}

// Load connections on page load
window.onload = function() {
  fetchConnections();
  loadSettings();
};

// ========== Settings Management ==========

function loadSettings() {
  fetch('/api/settings')
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        document.getElementById('batch_size').value = data.settings.batch_size || 100000;
      }
    })
    .catch(err => console.error('Error loading settings:', err));
}

function showSettingsMessage(msg, isError = false) {
  const msgDiv = document.getElementById('settingsMessage');
  msgDiv.textContent = msg;
  msgDiv.style.color = isError ? 'red' : 'green';
  msgDiv.style.display = 'block';
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 3000);
}

document.getElementById('settingsForm').onsubmit = function(e) {
  e.preventDefault();
  const batchSize = document.getElementById('batch_size').value;
  
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_size: parseInt(batchSize) })
  })
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        showSettingsMessage('Batch size updated successfully!');
      } else {
        showSettingsMessage(data.error || 'Failed to update settings', true);
      }
    })
    .catch(err => {
      showSettingsMessage('Error: ' + err.message, true);
    });
};
