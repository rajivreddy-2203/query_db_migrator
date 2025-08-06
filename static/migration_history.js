window.onload = function() {
  const table = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
  const search = document.getElementById('historySearch');
  let history = [];
  let filtered = [];

  function render() {
    table.innerHTML = '';
    const data = filtered.length ? filtered : history;
    if (!data.length) {
      table.innerHTML = "<tr><td colspan='9'>No migration history yet.</td></tr>";
      return;
    }
    data.forEach(entry => {
      table.innerHTML += `<tr>
        <td>${entry.timestamp || ''}</td>
        <td class="wrap">${entry.job_id || ''}</td>
        <td>${entry.source || ''}</td>
        <td>${entry.destination || ''}</td>
        <td>${entry.target_table || ''}</td>
        <td class="wrap" title="${entry.query || ''}">${(entry.query || '').slice(0,64)}${(entry.query && entry.query.length>64?'...':'')}</td>
        <td>${entry.rows_migrated || ''}</td>
        <td>${entry.duration_sec ? parseFloat(entry.duration_sec).toFixed(1) : ''}</td>
        <td class="wrap">${entry.schedule_id || ''}</td>
      </tr>`;
    });
  }

  function fetchHistory() {
    fetch('/api/history').then(r=>r.json()).then(data => {
      history = Array.isArray(data) ? data : [];
      filtered = [];
      render();
    });
  }

  function filter() {
    const q = search.value.toLowerCase();
    filtered = history.filter(h =>
      (h.job_id && h.job_id.toLowerCase().includes(q)) ||
      (h.source && h.source.toLowerCase().includes(q)) ||
      (h.destination && h.destination.toLowerCase().includes(q)) ||
      (h.target_table && h.target_table.toLowerCase().includes(q)) ||
      (h.query && h.query.toLowerCase().includes(q)) ||
      (h.schedule_id && h.schedule_id.toLowerCase().includes(q))
    );
    render();
  }

  search.addEventListener('input', filter);
  fetchHistory();
};

document.getElementById('clearHistoryBtn').onclick = function() {
  if (!confirm("Are you sure you want to clear ALL migration history?")) return;
  fetch('/api/history', { method: 'DELETE' })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        // Use your table reload logic here
        if (typeof fetchHistoryTable === "function") fetchHistoryTable();
        else location.reload();
      } else {
        alert(res.error || "Failed to clear history.");
      }
    })
    .catch(() => alert("Failed to clear history."));
};
