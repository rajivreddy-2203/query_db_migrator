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
  const timePickerBody = document.getElementById('timePickerBody');
  const sourceLogo = document.getElementById('sourceLogo');
  const destLogo = document.getElementById('destLogo');

  // Database logo mappings
  const dbLogos = {
    'mysql': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#00618A" d="M116.948 97.807c-6.863-.187-12.104.452-16.585 2.341-1.273.537-3.305.552-3.513 2.147.7.733.809 1.829 1.365 2.731 1.07 1.73 2.876 4.052 4.488 5.268 1.762 1.33 3.577 2.751 5.465 3.902 3.358 2.047 7.107 3.217 10.34 5.268 1.906 1.21 3.799 2.733 5.658 4.097.92.675 1.537 1.724 2.732 2.147v-.194c-.628-.8-.79-1.898-1.366-2.733l-2.537-2.537c-2.48-3.292-5.629-6.184-8.976-8.585-2.669-1.916-8.642-4.504-9.755-7.609l-.195-.195c1.892-.214 4.107-.898 5.854-1.367 2.934-.786 5.556-.583 8.585-1.365l4.097-1.171v-.78c-1.531-1.571-2.623-3.651-4.292-5.073-4.37-3.72-9.138-7.437-14.048-10.537-2.724-1.718-6.089-2.835-8.976-4.292-.971-.491-2.677-.746-3.318-1.562-1.517-1.932-2.342-4.382-3.511-6.633-2.449-4.717-4.854-9.868-7.024-14.831-1.48-3.384-2.447-6.72-4.293-9.756-8.86-14.567-18.396-23.358-33.169-32-3.144-1.838-6.929-2.563-10.929-3.513-2.145-.129-4.292-.26-6.438-.391-1.311-.546-2.673-2.149-3.902-2.927C17.811 4.565 5.257-2.16 1.633 6.682c-2.289 5.581 3.421 11.025 5.462 13.854 1.434 1.982 3.269 4.207 4.293 6.438.674 1.467.79 2.938 1.367 4.489 1.417 3.822 2.652 7.98 4.487 11.511.927 1.788 1.949 3.67 3.122 5.268.718.981 1.951 1.413 2.145 2.927-1.204 1.686-1.273 4.304-1.95 6.44-3.05 9.615-1.899 21.567 2.537 28.683 1.36 2.186 4.567 6.871 8.975 5.073 3.856-1.57 2.995-6.438 4.098-10.732.249-.973.096-1.689.585-2.341v.195l3.513 7.024c2.6 4.187 7.212 8.562 11.122 11.514 2.027 1.531 3.623 4.177 6.244 5.073v-.196h-.195c-.508-.791-1.303-1.119-1.951-1.755-1.527-1.497-3.225-3.358-4.487-5.073-3.556-4.827-6.698-10.11-9.561-15.609-1.368-2.627-2.557-5.523-3.709-8.196-.444-1.03-.438-2.589-1.364-3.122-1.263 1.958-3.122 3.542-4.098 5.854-1.561 3.696-1.762 8.204-2.341 12.878-.342.122-.19.038-.391.194-2.718-.655-3.672-3.452-4.683-5.853-2.554-6.07-3.029-15.842-.781-22.829.582-1.809 3.21-7.501 2.146-9.172-.508-1.666-2.184-2.63-3.121-3.903-1.161-1.574-2.319-3.646-3.124-5.464-2.09-4.731-3.066-10.044-5.267-14.828-1.053-2.287-2.832-4.602-4.293-6.634-1.617-2.253-3.429-3.912-4.683-6.635-.446-.968-1.051-2.518-.391-3.513.21-.671.508-.951 1.171-1.17 1.132-.873 4.284.29 5.462.779 3.129 1.3 5.741 2.538 8.392 4.294 1.271.844 2.559 2.475 4.097 2.927h1.756c2.747.631 5.824.195 8.391.975 4.536 1.378 8.601 3.523 12.292 5.854 11.246 7.102 20.442 17.21 26.732 29.269 1.012 1.942 1.45 3.794 2.341 5.854 1.798 4.153 4.063 8.426 5.852 12.488 1.786 4.052 3.526 8.141 6.05 11.513 1.327 1.772 6.451 2.723 8.781 3.708 1.632.689 4.307 1.409 5.854 2.34 2.953 1.782 5.815 3.903 8.586 5.855 1.383.975 5.64 3.116 5.852 4.879zM29.729 23.466c-1.431-.027-2.443.156-3.513.389v.195h.195c.683 1.402 1.888 2.306 2.731 3.513.65 1.367 1.301 2.732 1.952 4.097l.194-.193c1.209-.853 1.762-2.214 1.755-4.294-.484-.509-.555-1.147-.975-1.755-.556-.811-1.635-1.272-2.339-1.952z"/>`,
    'postgresql': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#336791" d="M115.731 77.44c-13.925 2.873-14.882-1.842-14.882-1.842 14.703-21.816 20.849-49.51 15.545-56.287C101.924.823 76.875 9.566 76.457 9.793l-.135.024c-2.751-.571-5.83-.911-9.291-.967-6.301-.103-11.08 1.652-14.707 4.402 0 0-44.684-18.408-42.606 23.151.442 8.842 12.672 66.899 27.26 49.363 5.332-6.412 10.483-11.834 10.483-11.834 2.559 1.699 5.622 2.567 8.833 2.255l.25-.212c-.078.796-.042 1.575.1 2.497-3.758 4.199-2.654 4.936-10.167 6.482-7.602 1.566-3.136 4.355-.22 5.084 3.534.884 11.712 2.136 17.237-5.598l-.221.882c1.473 1.18 2.507 7.672 2.334 13.557-.174 5.885-.29 9.926.871 13.082 1.16 3.156 2.316 10.256 12.192 8.14 8.252-1.768 12.528-6.351 13.124-13.995.422-5.435 1.377-4.631 1.438-9.49l.767-2.3c.884-7.367.14-9.743 5.225-8.638l1.235.108c3.742.17 8.639-.602 11.514-1.938 6.19-2.871 9.861-7.667 3.758-6.408z"/>`,
    'sqlserver': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#cfd8dc" d="M23.084,11.277c-1.633-2.449-1.986-5.722-2.063-7.067c-4.148,0.897-8.269,2.506-8.031,3.691 c0.03,0.149,0.218,0.328,0.53,0.502l-0.488,0.873c-0.596-0.334-0.931-0.719-1.022-1.179c-0.269-1.341,1.25-2.554,4.642-3.709 c2.316-0.789,4.652-1.26,4.751-1.279l0.597-0.12L22,3.6c0,0.042,0.026,4.288,1.916,7.123L23.084,11.277z"/><path fill="#b71c1c" d="M21.843,24.4c-0.068,0-0.137-0.014-0.201-0.042c-0.199-0.088-0.319-0.294-0.296-0.51 c0.292-2.749-3.926-3.852-3.969-3.862c-0.174-0.044-0.312-0.179-0.359-0.352s0.002-0.359,0.129-0.486 c0.207-0.207,5.139-5.098,11.327-7.784c0.173-0.075,0.369-0.047,0.515,0.07c0.145,0.118,0.212,0.307,0.174,0.489 c-1.186,5.744-6.71,12.044-6.944,12.309C22.12,24.341,21.982,24.4,21.843,24.4z M18.455,19.285 c1.184,0.445,3.258,1.475,3.783,3.356c1.449-1.808,4.542-5.973,5.697-9.934C23.548,14.817,19.854,17.999,18.455,19.285z"/>`,
    'oracle': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EF0F14" d="M2.861,21.998h2.917c1.05,0,2.261,0.896,2.261,2s-1.21,2-2.261,2H2.861c-1.05,0-1.861-0.895-1.861-2C1,22.893,1.811,21.998,2.861,21.998z M43.021,20.998c-1.401,0-2.521,1.343-2.521,3s1.13,3,2.521,3h4.019l0.96-1h-5c-0.898-0.047-1.289-0.638-1.5-1.5h5.54l0.96-1h-6.5c0.213-0.861,0.592-1.495,1.5-1.5h4.04l0.96-1H43.021z M34,20.998v5.426c0,0.148,0.095,0.292,0.201,0.402s0.249,0.172,0.405,0.172L38.54,27l1-1L35,25.998V21L34,20.998z M27.842,20.998c-1.591,0-2.851,1.346-2.851,3.003s1.26,2.997,2.851,2.997l3.649-0.012l1.149-0.988h-4.819c-1.05,0-1.84-0.894-1.84-1.999s0.79-2.001,1.84-2.001l3.689,0.016l1.13-1.016H27.842z M21,20.998c-0.258,0-0.522,0.215-0.67,0.483l-2.83,5.517h1l2.5-5l1.691,3H20.04l0.941,0.98l2.181-0.006l0.658,1.025l1.081-0.009l-3.277-5.507C21.394,21.112,21.25,20.998,21,20.998z M10,20.998v6h1v-5h3c0.515,0,1,0.464,1,1s-0.485,1-1,1h-2.5l3.481,3H16.5l-2.5-2l0.337-0.009C15.077,24.99,16,24.119,16,22.998c0-1.121-0.687-1.986-1.553-2H10z M2.882,20.998c-1.591,0-2.882,1.344-2.882,3s1.291,3,2.882,3H5.76c1.591,0,3.24-1.343,3.24-3s-1.649-3-3.24-3H2.882z"/>`
  };

  function updateLogo(selectElement, logoElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption) {
      const selectedText = selectedOption.text.toLowerCase();
      let logoSvg = '';
      
      if (selectedText.includes('mysql')) {
        logoSvg = dbLogos['mysql'];
      } else if (selectedText.includes('postgres')) {
        logoSvg = dbLogos['postgresql'];
      } else if (selectedText.includes('sql server') || selectedText.includes('sqlserver')) {
        logoSvg = dbLogos['sqlserver'];
      } else if (selectedText.includes('oracle')) {
        logoSvg = dbLogos['oracle'];
      }
      
      logoElement.innerHTML = logoSvg;
    }
  }

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

  function getDbLogoSvg(dbType) {
    const typeLC = dbType.toLowerCase();
    if (typeLC.includes('mysql')) return dbLogos['mysql'];
    if (typeLC.includes('postgres')) return dbLogos['postgresql'];
    if (typeLC.includes('sql server') || typeLC.includes('sqlserver')) return dbLogos['sqlserver'];
    if (typeLC.includes('oracle')) return dbLogos['oracle'];
    return '';
  }

  function populateCustomSelect(hiddenSelect, optionsContainer, button, isSource) {
    optionsContainer.innerHTML = '';
    const options = hiddenSelect.querySelectorAll('option');
    
    options.forEach(opt => {
      if (opt.value) {
        const optDiv = document.createElement('div');
        optDiv.className = 'option';
        optDiv.dataset.value = opt.value;
        
        const dbType = opt.text.split('[')[1]?.replace(']', '') || '';
        const logoSvg = getDbLogoSvg(dbType);
        
        optDiv.innerHTML = `
          ${logoSvg ? `<div class="option-logo">${logoSvg}</div>` : ''}
          <span class="option-text">${opt.text}</span>
        `;
        
        optDiv.addEventListener('click', () => {
          hiddenSelect.value = opt.value;
          hiddenSelect.dispatchEvent(new Event('change'));
          
          const buttonText = button.querySelector('.button-text');
          buttonText.innerHTML = `
            ${logoSvg ? `<div class="option-logo">${logoSvg}</div>` : ''}
            <span>${opt.text}</span>
          `;
          
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
      const dbType = selectedOption.text.split('[')[1]?.replace(']', '') || '';
      const logoSvg = getDbLogoSvg(dbType);
      buttonText.innerHTML = `
        ${logoSvg ? `<div class="option-logo">${logoSvg}</div>` : ''}
        <span>${selectedOption.text}</span>
      `;
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
    if (sourceLogo) updateLogo(source, sourceLogo);
  });

  // Setup destination select
  const destSelect = document.getElementById('destSelect');
  const destButton = document.getElementById('destButton');
  const destOptions = document.getElementById('destOptions');
  setupCustomSelect(destSelect, destSelect, destOptions, destButton);
  destination.addEventListener('change', () => {
    syncCustomSelect(destination, destOptions, destButton);
    if (destLogo) updateLogo(destination, destLogo);
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
