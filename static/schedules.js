window.onload = function() {
  const table = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0];
  const searchBox = document.getElementById('searchBox');
  const refreshBtn = document.getElementById('refreshBtn');
  let schedules = [];
  let filteredSchedules = [];

  function renderTable() {
    table.innerHTML = '';
    const data = filteredSchedules.length ? filteredSchedules : schedules;
    if (data.length === 0) {
      table.innerHTML = "<tr><td colspan='6'>No scheduled migrations found.</td></tr>";
      return;
    }
    data.forEach(job => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="word-break:break-all;">${job.job_id}</td>
        <td>${job.source || ''}</td>
        <td>${job.destination || ''}</td>
        <td>${job.target_table || ''}</td>
        <td>${job.schedule_time || job.schedule || ''}</td>
        <td><button data-id='${job.job_id}' class='btn delete-btn'>Delete</button></td>
      `;
      table.appendChild(tr);
    });
    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        if(confirm('Are you sure you want to delete this schedule?')) {
          const jobId = e.target.getAttribute('data-id');
          deleteSchedule(jobId);
        }
      });
    });
  }

  function deleteSchedule(jobId) {
    fetch(`/api/schedule?job_id=${encodeURIComponent(jobId)}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if(data.success) fetchSchedules();
      else alert('Failed to delete schedule.');
    });
  }

  function fetchSchedules() {
    fetch('/api/schedule')
    .then(res => res.json())
    .then(data => {
      schedules = data.jobs || [];
      filteredSchedules = [];
      renderTable();
    });
  }

  function filterSchedules() {
    const query = searchBox.value.toLowerCase();
    filteredSchedules = schedules.filter(job =>
      (job.job_id && job.job_id.toLowerCase().includes(query)) ||
      (job.source && job.source.toLowerCase().includes(query)) ||
      (job.destination && job.destination.toLowerCase().includes(query)) ||
      (job.target_table && job.target_table.toLowerCase().includes(query)) ||
      (job.schedule && job.schedule.toLowerCase().includes(query)) ||
      (job.schedule_time && job.schedule_time.toLowerCase().includes(query))
    );
    renderTable();
  }

  searchBox.addEventListener('input', filterSchedules);
  refreshBtn.addEventListener('click', fetchSchedules);

  fetchSchedules();
};
