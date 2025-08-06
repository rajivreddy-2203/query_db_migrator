window.onload = function() {
  // --- Elements
  const resultDiv = document.getElementById('result');
  const migrateBtn = document.getElementById('migrateBtn');
  const scheduleBtn = document.getElementById('scheduleBtn');
  const source = document.getElementById('source');
  const destination = document.getElementById('destination');
  const query = document.getElementById('query');
  const targetTable = document.getElementById('target_table');
  const scheduleTimeInput = document.getElementById('schedule_time');
  const previewBtn = document.getElementById('previewBtn');
  const typeMapForm = document.getElementById('typeMapForm');
  const queryPreview = document.getElementById('queryPreview');
  const progressArea = document.getElementById('progressArea');
  const progressFill = document.getElementById('progressfill');
  const progressText = document.getElementById('progressText');
  const sidePanel = document.getElementById('sidePanel');

  // --- Fetch connections for dropdowns
  function fetchConnections() {
    fetch('/api/connections')
      .then(resp => resp.json())
      .then(cons => {
        source.innerHTML = '';
        destination.innerHTML = '';
        Object.entries(cons).forEach(([type, dbs]) => {
          Object.keys(dbs).forEach(name => {
            let opt1 = document.createElement('option');
            opt1.value = name; opt1.textContent = `${name} [${type}]`;
            let opt2 = opt1.cloneNode(true);
            source.appendChild(opt1);
            destination.appendChild(opt2);
          });
        });
        updateMigrateButtonState();
      });
  }
  fetchConnections();

  // --- Form validation
  function areAllFieldsFilled() {
    return (
      source.value.trim() !== '' &&
      destination.value.trim() !== '' &&
      query.value.trim() !== '' &&
      targetTable.value.trim() !== ''
    );
  }
  function updateMigrateButtonState() {
    migrateBtn.disabled = !areAllFieldsFilled();
    scheduleBtn.disabled = !areAllFieldsFilled();
  }
  [source, destination, query, targetTable, scheduleTimeInput].forEach(el =>
    el.addEventListener('input', updateMigrateButtonState));
  updateMigrateButtonState();

  // --- Hide mapping/preview by default
  if (sidePanel) sidePanel.style.display = 'none';

  // --- Preview Button
  previewBtn.onclick = function() {
    if (typeMapForm) typeMapForm.innerHTML = '';
    if (queryPreview) queryPreview.innerHTML = '';
    resultDiv.style.display = 'none';
    if (!source.value || !query.value) {
      alert("Select source and enter a query for preview.");
      if (sidePanel) sidePanel.style.display = 'none';
      return;
    }
    previewBtn.disabled = true;
    fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: source.value, query: query.value })
    })
    .then(r => r.json())
    .then(res => {
      if (!res.success) {
        resultDiv.textContent = "Preview Error: " + res.error;
        resultDiv.style.display = 'block';
        if (sidePanel) sidePanel.style.display = 'none';
        return;
      }
      // Preview Table
      let previewHtml = `<table class="mappingtable"><thead><tr>`;
      res.columns.forEach(col => { previewHtml += `<th>${col}</th>`; });
      previewHtml += `</tr></thead><tbody>`;
      for (let row of res.preview) {
        previewHtml += "<tr>" + row.map(cell => `<td>${cell === null ? '' : cell}</td>`).join('') + "</tr>";
      }
      previewHtml += "</tbody></table>";
      if (queryPreview) queryPreview.innerHTML = previewHtml;
      // Mapping Table
      let mappingHtml = `<table class="mappingtable"><thead><tr><th>Column</th><th>Source Type</th><th>Destination Type</th></tr></thead><tbody>`;
      for (let i = 0; i < res.columns.length; ++i) {
        let col = res.columns[i];
        let srctype = res.types[i] || "";
        mappingHtml += `<tr>
          <td>${col}</td>
          <td>${srctype}</td>
          <td>
            <select name="type_${col}">
              <option value="TEXT">TEXT</option>
              <option value="INTEGER">INTEGER</option>
              <option value="FLOAT">FLOAT</option>
              <option value="BOOLEAN">BOOLEAN</option>
              <option value="DATE">DATE</option>
              <option value="TIMESTAMP">TIMESTAMP</option>
              <option value="VARCHAR2(4000)">VARCHAR2(4000)</option>
              <option value="NVARCHAR(255)">NVARCHAR(255)</option>
              <option value="NUMBER">NUMBER</option>
              <option value="FLOAT">FLOAT</option>
            </select>
          </td>
        </tr>`;
      }
      mappingHtml += "</tbody></table>";
      if (typeMapForm) typeMapForm.innerHTML = mappingHtml;
      // SHOW the right panel!
      if (sidePanel) sidePanel.style.display = 'flex';
    })
    .catch(err => {
      resultDiv.textContent = "Preview/Mapping failed: " + err;
      resultDiv.style.display = 'block';
      if (sidePanel) sidePanel.style.display = 'none';
    })
    .finally(() => { previewBtn.disabled = false; });
  };

  // --- Progress Bar Functions
  function showProgressArea() {
    if (progressArea) {
      progressArea.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = '';
    }
  }
  function setProgress(pct, text) {
    if (progressFill) progressFill.style.width = pct + "%";
    if (progressText) progressText.textContent = text || '';
  }
  function hideProgressArea() {
    if (progressArea) {
      progressArea.style.display = 'none';
      progressFill.style.width = '0%';
      progressText.textContent = '';
    }
  }

  // --- Migration Submit
  document.getElementById('migrateForm').onsubmit = function(e) {
    e.preventDefault();
    migrateBtn.disabled = true;
    hideProgressArea();
    resultDiv.textContent = "Initializing migration...";
    resultDiv.style.display = 'block';
    if (sidePanel) sidePanel.style.display = 'none';
    // Extract type mapping
    let type_mapping = {};
    let selects = [];
    if (typeMapForm) selects = typeMapForm.querySelectorAll('select');
    selects.forEach(sel => {
      let col = sel.name.replace(/^type_/, '');
      type_mapping[col] = sel.value;
    });
    let data = {
      source: source.value,
      destination: destination.value,
      query: query.value,
      target_table: targetTable.value,
      type_mapping: type_mapping
    };
    fetch('/api/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
      if (res.job_id) {
        showProgressArea();
        pollJob(res.job_id);
      } else {
        resultDiv.textContent = "Error: " + (res.error || "No job id returned.");
        resultDiv.style.display = 'block';
        hideProgressArea();
        migrateBtn.disabled = false;
      }
    })
    .catch(() => {
      resultDiv.textContent = "Migration failed to start.";
      resultDiv.style.display = 'block';
      hideProgressArea();
      migrateBtn.disabled = false;
    });
  };

  // --- Schedule Migration
  scheduleBtn.onclick = function() {
    if (!areAllFieldsFilled()) {
      alert('Please fill in all required fields before scheduling.');
      return;
    }
    const scheduleTime = scheduleTimeInput.value;
    if (!scheduleTime) {
      alert("Please select a time for the schedule!");
      return;
    }
    let type_mapping = {};
    let selects = [];
    if (typeMapForm) selects = typeMapForm.querySelectorAll('select');
    selects.forEach(sel => {
      let col = sel.name.replace(/^type_/, '');
      type_mapping[col] = sel.value;
    });
    let data = {
      source: source.value,
      destination: destination.value,
      query: query.value,
      target_table: targetTable.value,
      type_mapping: type_mapping,
      schedule_time: scheduleTime
    };
    fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("Migration scheduled successfully for " + scheduleTime + "!");
      } else {
        alert("Error scheduling migration: " + (res.error || ""));
      }
    })
    .catch(() => { alert("Failed to schedule migration."); });
  };

  // --- Poll Migration Progress
  function pollJob(job_id) {
    let interval = setInterval(() => {
      fetch(`/api/migration_status?job_id=${job_id}`)
        .then(r => r.json())
        .then(status => {
          if (!status.status) { return; }
          let rows = status.rows || 0;
          let pct = Math.min(90, rows / Math.max(1, rows) * 100);
          setProgress(pct, `Migrated ${rows} rows...`);
          if (status.status === 'finished') {
            setProgress(100, `Done! Migrated ${rows} rows.`);
            resultDiv.textContent = `✅ Success! ${rows} rows migrated. Time: ${((status.ended - status.started) || 0).toFixed(2)} s.`;
            resultDiv.style.display = 'block';
            migrateBtn.disabled = false;
            clearInterval(interval);
            setTimeout(hideProgressArea, 3000);
            if (sidePanel) sidePanel.style.display = 'none';
          } else if (status.status === 'failed') {
            resultDiv.textContent = "❌ Error: " + (status.error || "Migration failed");
            resultDiv.style.display = 'block';
            migrateBtn.disabled = false;
            clearInterval(interval);
            setTimeout(hideProgressArea, 3000);
            if (sidePanel) sidePanel.style.display = 'none';
          }
        });
    }, 1000);
  }

  // --- Reset on load
  resultDiv.textContent = "";
  resultDiv.style.display = 'none';
  hideProgressArea();
};
