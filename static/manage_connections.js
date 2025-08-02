function fetchConnections() {
  fetch('/api/connections')
    .then(resp => resp.json())
    .then(cons => {
      let tbody = document.querySelector('#connections tbody');
      tbody.innerHTML = '';
      Object.entries(cons).forEach(([type, dbs]) => {
        Object.entries(dbs).forEach(([name, details]) => {
          let tr = document.createElement('tr');
          tr.innerHTML = `<td>${name}</td><td>${type}</td>
            <td>
              <button onclick="editConn('${type}', '${name}')">Edit</button>
              <button onclick="delConn('${name}')">Delete</button>
            </td>`;
          tbody.appendChild(tr);
        });
      });
    });
}


function showFields() {
  let db_type = document.getElementById('db_type').value;
  let fieldsDiv = document.getElementById('fields');
  let html = '';
  if (db_type === "oracle") {
    html = `
      <label>User id:</label><input id="user" required><br>
      <label>Password:</label><input id="password" type="password" required><br>
      <label>DSN: </label><input id="dsn" required><br>
      <small>(sample dsn: "localhost:port/sid" you can use service name instead of sid)</small>
    `;
  } else if (db_type === "postgresql" || db_type === "mysql" || db_type === "sqlserver") {
    html = `
      <label>User id:</label><input id="user" required><br>
      <label>Password:</label><input id="password" type="password" required><br>
      <label>Host:</label><input id="host" required><br>
      <label>Port:</label><input id="port" required><br>
      <label>Database:</label><input id="database" required><br>
    `;
  }
  fieldsDiv.innerHTML = html;
}

function delConn(name) {
  if (confirm('Delete connection '+name+'?')) {
    fetch('/api/connections?name='+encodeURIComponent(name), {method:'DELETE'})
    .then(() => fetchConnections());
  }
}

function editConn(db_type, name) {
  fetch('/api/connections')
    .then(resp => resp.json())
    .then(cons => {
      const details = cons[db_type][name];
      document.getElementById('name').value = name;
      document.getElementById('db_type').value = db_type;
      showFields();
      setTimeout(() => {
        for (const key in details) {
          if (document.getElementById(key)) {
            document.getElementById(key).value = details[key];
          }
        }
        document.getElementById('name').readOnly = true;
        document.getElementById('db_type').disabled = true;
      }, 50);
    });
}


function resetForm() {
  document.getElementById('connForm').reset();
  document.getElementById('fields').innerHTML = '';
}

document.getElementById('connForm').onsubmit = function(e){
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
  fetch('/api/connections', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name, db_type, details})
  }).then(() => { resetForm(); fetchConnections(); });
};

window.onload = fetchConnections;
