function fetchConnections() {
    fetch('/api/connections')
        .then(resp => resp.json())
        .then(cons => {
            let srcSel = document.getElementById('source');
            let dstSel = document.getElementById('destination');
            srcSel.innerHTML = '';
            dstSel.innerHTML = '';
            Object.entries(cons).forEach(([type, dbs]) => {
                Object.keys(dbs).forEach(name => {
                    let opt1 = document.createElement('option');
                    opt1.value = name; opt1.textContent = `${name} [${type}]`;
                    let opt2 = opt1.cloneNode(true);
                    srcSel.appendChild(opt1);
                    dstSel.appendChild(opt2);
                });
            });
            // Update migrate button state after options are loaded
            updateMigrateButtonState();
        });
}
fetchConnections();

const resultDiv = document.getElementById('result');
resultDiv.style.display = 'none';

const migrateBtn = document.getElementById('migrateBtn');
const manageBtn = document.getElementById('manageConnectionsBtn');
const source = document.getElementById('source');
const destination = document.getElementById('destination');
const query = document.getElementById('query');
const targetTable = document.getElementById('target_table');

// Helper function to check if all fields are filled
function areAllFieldsFilled() {
    return (
        source.value.trim() !== '' &&
        destination.value.trim() !== '' &&
        query.value.trim() !== '' &&
        targetTable.value.trim() !== ''
    );
}

// Enable/disable Migrate button
function updateMigrateButtonState() {
    migrateBtn.disabled = !areAllFieldsFilled();
}

// Attach input listeners for validation
[source, destination, query, targetTable].forEach(el =>
    el.addEventListener('input', updateMigrateButtonState)
);

// Initial validation on load
updateMigrateButtonState();

document.getElementById('migrateForm').onsubmit = function (e) {
    e.preventDefault();
    migrateBtn.disabled = true;
    manageBtn.disabled = true;

    let data = {
        source: source.value,
        destination: destination.value,
        query: query.value,
        target_table: targetTable.value
    };

    resultDiv.textContent = "Migrating...";
    resultDiv.style.display = 'block';

    fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(res => {
            let msg = "";
            if (res.success) {
                let t = res.elapsed;
                msg = `Success! ${res.rows} rows migrated.`;
                if (typeof t === 'number') {
                    let timeMsg = '';
                    if (t < 60) {
                        timeMsg = `${t.toFixed(2)} seconds`;
                    } else if (t < 3600) {
                        timeMsg = `${(t / 60).toFixed(2)} minutes`;
                    } else {
                        timeMsg = `${(t / 3600).toFixed(2)} hours`;
                    }
                    msg += ` Time taken: ${timeMsg}.`;
                }
            } else {
                msg = "Error: " + res.error;
            }
            if (msg && msg.trim() !== "") {
                resultDiv.textContent = msg;
                resultDiv.style.display = 'block';
            } else {
                resultDiv.textContent = "";
                resultDiv.style.display = 'none';
            }
        })
        .catch(() => {
            resultDiv.textContent = "";
            resultDiv.style.display = 'none';
        })
        .finally(() => {
            // Re-enable manage button after migration (success or error)
            manageBtn.disabled = false;
            // Enable migrate button again if form is complete
            updateMigrateButtonState();
        });
};
