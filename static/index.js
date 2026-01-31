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
  const timeNowBtn = document.getElementById('timeNowBtn');
  const timePlus15Btn = document.getElementById('timePlus15Btn');
  const timePlus30Btn = document.getElementById('timePlus30Btn');

  // Database logo mappings
  const dbLogos = {
    'mysql': '',
    'postgresql': '',
    'sqlserver': '',
    'oracle': ''
  };

  // Custom select dropdown functionality
  function setupCustomSelect(hiddenSelect, selectElement, optionsContainer, button) {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      optionsContainer.classList.toggle('open');
      button.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!selectElement.contains(e.target)) {
        optionsContainer.classList.remove('open');
        button.classList.remove('active');
      }
    });
  }

  function populateCustomSelect(hiddenSelect, optionsContainer, button, isSource) {
    optionsContainer.innerHTML = '';
    const options = hiddenSelect.querySelectorAll('option');
    
    options.forEach(opt => {
      if (opt.value) {
        const optDiv = document.createElement('div');
        optDiv.className = 'option';
        optDiv.dataset.value = opt.value;
        
        optDiv.innerHTML = `
          <span class="option-text">${opt.text}</span>
        `;
        
        optDiv.addEventListener('click', () => {
          hiddenSelect.value = opt.value;
          hiddenSelect.dispatchEvent(new Event('change'));
          
          const buttonText = button.querySelector('.button-text');
          buttonText.textContent = opt.text;
          
          optionsContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
          optDiv.classList.add('selected');
          optionsContainer.classList.remove('open');
          button.classList.remove('active');
        });
        
        optionsContainer.appendChild(optDiv);
      }
    });
  }

  function syncCustomSelect(hiddenSelect, optionsContainer, button) {
    const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
    const buttonText = button.querySelector('.button-text');
    if (selectedOption && selectedOption.value) {
      buttonText.textContent = selectedOption.text;
    } else {
      buttonText.textContent = 'Select a connection...';
    }
    optionsContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    if (selectedOption && selectedOption.value) {
      const match = optionsContainer.querySelector(`.option[data-value="${CSS.escape(selectedOption.value)}"]`);
      if (match) match.classList.add('selected');
    }
  }

  // Setup source select
  const sourceSelect = document.getElementById('sourceSelect');
  const sourceButton = document.getElementById('sourceButton');
  const sourceOptions = document.getElementById('sourceOptions');
  setupCustomSelect(sourceSelect, sourceSelect, sourceOptions, sourceButton);
  source.addEventListener('change', () => {
    syncCustomSelect(source, sourceOptions, sourceButton);
  });

  // Setup destination select
  const destSelect = document.getElementById('destSelect');
  const destButton = document.getElementById('destButton');
  const destOptions = document.getElementById('destOptions');
  setupCustomSelect(destSelect, destSelect, destOptions, destButton);
  destination.addEventListener('change', () => {
    syncCustomSelect(destination, destOptions, destButton);
    // Refresh mapping panel if already open to update data types
    if (sidePanel && sidePanel.style.display !== 'none' && typeMapForm.innerHTML) {
      previewBtn.click();
    }
  });

  function formatTimeValue(dateObj) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function setScheduleTime(dateObj) {
    if (!scheduleTimeInput) return;
    scheduleTimeInput.value = formatTimeValue(dateObj);
    scheduleTimeInput.dispatchEvent(new Event('input'));
  }

  function adjustScheduleByMinutes(minutesToAdd) {
    if (!scheduleTimeInput) return;
    const now = new Date();
    const [hours, minutes] = (scheduleTimeInput.value || formatTimeValue(now)).split(':');
    const base = new Date();
    base.setHours(Number(hours), Number(minutes), 0, 0);
    base.setMinutes(base.getMinutes() + minutesToAdd);
    setScheduleTime(base);
  }

  // --- Set schedule time to current time by default
  setScheduleTime(new Date());

  if (timeNowBtn) {
    timeNowBtn.addEventListener('click', () => setScheduleTime(new Date()));
  }
  if (timePlus15Btn) {
    timePlus15Btn.addEventListener('click', () => adjustScheduleByMinutes(15));
  }
  if (timePlus30Btn) {
    timePlus30Btn.addEventListener('click', () => adjustScheduleByMinutes(30));
  }
  if (scheduleTimeInput) {
    scheduleTimeInput.addEventListener('click', () => {
      if (typeof scheduleTimeInput.showPicker === 'function') {
        scheduleTimeInput.showPicker();
      }
    });
  }

  // --- Fetch connections for dropdowns
  function fetchConnections() {
    fetch('/api/connections')
      .then(resp => resp.json())
      .then(cons => {
        source.innerHTML = '';
        destination.innerHTML = '';
        let defaultSourceName = null;
        let defaultDestinationName = null;
        
        Object.entries(cons).forEach(([type, dbs]) => {
          Object.entries(dbs).forEach(([name, details]) => {
            let opt1 = document.createElement('option');
            opt1.value = name; opt1.textContent = `${name} [${type}]`;
            let opt2 = opt1.cloneNode(true);
            source.appendChild(opt1);
            destination.appendChild(opt2);
            
            // Track default connections
            if (details.default_source) defaultSourceName = name;
            if (details.default_destination) defaultDestinationName = name;
          });
        });
        
        populateCustomSelect(source, sourceOptions, sourceButton, true);
        populateCustomSelect(destination, destOptions, destButton, false);
        
        // Auto-select default connections if set
        if (defaultSourceName) {
          source.value = defaultSourceName;
          source.dispatchEvent(new Event('change'));
        }
        if (defaultDestinationName) {
          destination.value = defaultDestinationName;
          destination.dispatchEvent(new Event('change'));
        }

        syncCustomSelect(source, sourceOptions, sourceButton);
        syncCustomSelect(destination, destOptions, destButton);
        
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

  // --- Hide mapping panel by default
  if (sidePanel) sidePanel.style.display = 'none';

  // --- Get destination database type from selected destination
  function getDestinationType() {
    const selectedOption = destination.options[destination.selectedIndex];
    if (!selectedOption || !selectedOption.text) return null;
    const match = selectedOption.text.match(/\[(.*?)\]/);
    return match ? match[1].toLowerCase() : null;
  }

  // --- Get appropriate data types for destination database
  function getDataTypeOptions(destType) {
    const dataTypes = {
      'mysql': [
        'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT',
        'BIGINT', 'INT', 'SMALLINT', 'TINYINT',
        'DOUBLE', 'FLOAT', 
        'TINYINT(1)', 
        'DATETIME', 'DATE', 'TIME', 'TIMESTAMP',
        'VARCHAR(255)', 'VARCHAR(500)', 'VARCHAR(1000)'
      ],
      'postgresql': [
        'TEXT', 'VARCHAR', 
        'BIGINT', 'INTEGER', 'SMALLINT',
        'DOUBLE PRECISION', 'REAL',
        'BOOLEAN',
        'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'DATE', 'TIME',
        'JSON', 'JSONB'
      ],
      'sqlserver': [
        'NVARCHAR(MAX)', 'NVARCHAR(255)', 'NVARCHAR(500)', 'NVARCHAR(1000)',
        'VARCHAR(MAX)', 'VARCHAR(255)',
        'TEXT', 'NTEXT',
        'BIGINT', 'INT', 'SMALLINT', 'TINYINT',
        'FLOAT(53)', 'REAL',
        'BIT',
        'DATETIME2', 'DATETIME', 'DATE', 'TIME',
        'DECIMAL', 'NUMERIC'
      ],
      'oracle': [
        'CLOB', 'VARCHAR2(4000)', 'VARCHAR2(2000)', 'VARCHAR2(1000)',
        'NUMBER(19)', 'NUMBER(10)', 'NUMBER(5)', 'NUMBER(3)', 'NUMBER',
        'BINARY_DOUBLE', 'BINARY_FLOAT',
        'NUMBER(1)',
        'TIMESTAMP', 'DATE',
        'BLOB', 'RAW(2000)'
      ]
    };
    
    return dataTypes[destType] || [
      'TEXT', 'INTEGER', 'BIGINT', 'FLOAT', 
      'BOOLEAN', 'DATE', 'TIMESTAMP'
    ];
  }

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
      // Preview Table with column types in headers
      let previewHtml = `<table class="mappingtable"><thead><tr>`;
      res.columns.forEach((col, idx) => { 
        const srcType = res.types[idx] || '';
        previewHtml += `<th>${col}${srcType ? ' - ' + srcType : ''}</th>`; 
      });
      previewHtml += `</tr></thead><tbody>`;
      for (let row of res.preview) {
        previewHtml += "<tr>" + row.map(cell => `<td>${cell === null ? '' : cell}</td>`).join('') + "</tr>";
      }
      previewHtml += "</tbody></table>";
      if (queryPreview) queryPreview.innerHTML = previewHtml;
      // Mapping Table with dynamic data types based on destination
      const destType = getDestinationType();
      const dataTypeOptions = getDataTypeOptions(destType);
      
      let mappingHtml = `<table class="mappingtable"><thead><tr><th>Column</th><th>Source Type</th><th>Destination Type</th></tr></thead><tbody>`;
      for (let i = 0; i < res.columns.length; ++i) {
        let col = res.columns[i];
        let srctype = res.types[i] || "";
        
        // Build options for destination type dropdown
        let optionsHtml = '';
        dataTypeOptions.forEach(dataType => {
          optionsHtml += `<option value="${dataType}">${dataType}</option>`;
        });
        
        mappingHtml += `<tr>
          <td>${col}</td>
          <td>${srctype}</td>
          <td>
            <select name="type_${col}">
              ${optionsHtml}
            </select>
          </td>
        </tr>`;
      }
      mappingHtml += "</tbody></table>";
      if (typeMapForm) typeMapForm.innerHTML = mappingHtml;
      // Show mapping panel
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

  // --- Monitor side panel visibility to push floating icons
  const floatingIcons = document.querySelectorAll('.floating-icon');
  const observer = new MutationObserver(() => {
    const isPanelVisible = sidePanel && sidePanel.style.display !== 'none';
    floatingIcons.forEach(icon => {
      if (isPanelVisible) {
        // Smoothly push icons out when card appears
        icon.classList.add('pushed');
      } else {
        // Smoothly bring icons back when card disappears
        icon.classList.remove('pushed');
      }
    });
  });

  if (sidePanel) {
    observer.observe(sidePanel, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
  }
};
