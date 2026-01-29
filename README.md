# Query DB Migrator

**Query DB Migrator** is a Flask-based web application for migrating data between Oracle, PostgreSQL, MySQL, and Microsoft SQL Server databases using custom SQL queries.

---

## ⚡ Features

- **Web-Based UI:** Modern, intuitive interface for managing connections and migrations
- **Multi-Database Support:** Oracle, PostgreSQL, MySQL, and SQL Server
- **Query-Based Migration:** Use custom SQL queries to extract and migrate data
- **Secure:** Automatic password encryption using Fernet (AES-128) encryption
- **Batch Processing:** Configurable batch size (default: 100,000 rows) for optimal performance
- **Scheduled Migrations:** Schedule migrations to run at specific times with modern time picker
- **Migration History:** Track all migration jobs with detailed logs and timestamps
- **Auto-Configuration:** Automatically creates required config files on first run
- **Password Masking:** Connection passwords are masked in UI for security

---

## 🧠 How the App Works

### 1. First Run Setup
   - On first launch, the application automatically creates:
     - `config/` directory
     - `db_connections.json` (database connections and settings)
     - `migration_history.json` (migration logs)
     - `schedules.json` (scheduled jobs)
     - `.encryption_key` (Fernet encryption key)

### 2. Manage Connections
   - Navigate to the **Manage Connections** page
   - **Add** new database connections with encrypted password storage
   - **Edit** existing connections (passwords are masked as ******** in display)
   - **Delete** connections you no longer need
   - **Configure Global Settings:** Set batch size for all migrations (default: 100,000 rows)
   - All changes are automatically saved to `config/db_connections.json`

### 3. Run a Migration
   - From the main page, select the **source database** connection
   - Select the **destination database** connection
   - Enter a SQL **query** to extract data (supports multi-table queries)
   - Specify the **target table name** in the destination database
   - Click **Migrate Now** to start immediately, or use the time picker to **Schedule** for later
   - Monitor real-time progress with batch updates

### 4. Schedule Migrations
   - Use the modern time picker with quick actions (Now, +15 min, +30 min)
   - View all scheduled jobs in the **Schedules** page
   - Cancel scheduled jobs before they execute
   - Scheduled jobs persist across application restarts

### 5. View Migration History
   - Navigate to **Migration History** page
   - View all past migrations with timestamps
   - See source/destination details, queries, and row counts
   - Track success/failure status of each migration

> **Note:** The system reads data from the source using your query and inserts it into the destination table in configurable batches.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rajivreddy-2203/query_db_migrator.git
cd query_db_migrator
```

### 2. Install Dependencies

Install all required packages:

```bash
pip install -r requirements.txt
```

**Included Dependencies:**
- `Flask==3.1.2` - Web framework
- `cryptography==42.0.0` - Password encryption
- `apscheduler==3.11.0` - Job scheduling
- `pandas==2.1.4` - Data processing
- `mysql-connector-python==8.2.0` - MySQL driver
- `oracledb==3.4.0` - Oracle driver
- `psycopg2==2.9.11` - PostgreSQL driver
- `pyodbc==5.3.0` - SQL Server driver

### 3. Start the Application

**Windows:**
```bash
python app.py
```

**Linux/macOS:**
```bash
python app.py
```

The application will:
- Auto-create the `config/` directory and required files
- Generate encryption key for password security
- Start the Flask server on [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### 4. Add Database Connections

- Open your browser and navigate to [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
- Click **Manage Connections** in the navigation menu
- Add your database connections (passwords are automatically encrypted)
- Adjust the global batch size if needed (default: 100,000 rows)

---

## 📁 Project Structure

```
query_db_migrator/
├── app.py                          # Main Flask application with config management
├── db_router.py                    # Connection management with encryption
├── migrator.py                     # Data migration orchestration
├── mysql_reader.py                 # MySQL data reader
├── mysql_writer.py                 # MySQL data writer
├── oracle_reader.py                # Oracle data reader
├── oracle_writer.py                # Oracle data writer
├── postgresql_reader.py            # PostgreSQL data reader
├── postgresql_writer.py            # PostgreSQL data writer
├── sqlserver_reader.py             # SQL Server data reader
├── sqlserver_writer.py             # SQL Server data writer
├── requirements.txt                # Python dependencies
├── README.md                       # Documentation
├── .gitignore                      # Git ignore rules (excludes config/)
├── config/                         # Configuration directory (auto-created)
│   ├── db_connections.json         # Database connections & settings
│   ├── migration_history.json      # Migration logs
│   ├── schedules.json              # Scheduled jobs
│   └── .encryption_key             # Fernet encryption key
├── static/                         # Frontend assets
│   ├── styles.css                  # Application styles
│   ├── index.js                    # Main page logic
│   ├── manage_connections.js       # Connection management logic
│   ├── migration_history.js        # History page logic
│   └── schedules.js                # Schedules page logic
└── templates/                      # HTML templates
    ├── index.html                  # Main migration page
    ├── manage_connections.html     # Connection management page
    ├── migration_history.html      # History page
    └── schedules.html              # Schedules page
```

---

## 🔒 Security & Configuration

### Password Encryption

All database passwords are **automatically encrypted** using Fernet (AES-128) symmetric encryption:

- ✅ Passwords are never stored in plain text
- ✅ Encryption key is auto-generated on first run
- ✅ Key stored in `config/.encryption_key` (excluded from git via `.gitignore`)
- ✅ Passwords are masked (********) in the UI for security
- ✅ Both password and DSN fields are encrypted

**Important:** Always backup `db_connections.json` AND `.encryption_key` together. Without the key, encrypted passwords cannot be decrypted.

### Configuration Files

The `config/` directory contains all application data:

```json
// db_connections.json
{
  "oracle": {
    "prod_db": {
      "user": "admin",
      "password": "Z0FBQUFBQm...",  // Encrypted
      "dsn": "gAAAAA...",             // Encrypted
      "host": "localhost",
      "port": "1521"
    }
  },
  "settings": {
    "batch_size": 100000
  }
}
```

```json
// migration_history.json
[
  {
    "timestamp": "2026-01-30 14:30:00",
    "source": "oracle/prod_db",
    "destination": "postgresql/analytics",
    "query": "SELECT * FROM orders",
    "target_table": "orders_archive",
    "rows": 50000,
    "status": "completed"
  }
]
```

```json
// schedules.json
[
  {
    "job_id": "abc-123",
    "source": "mysql/sales_db",
    "destination": "postgresql/warehouse",
    "query": "SELECT * FROM daily_sales",
    "target_table": "sales_data",
    "schedule_time": "2026-01-30 18:00:00"
  }
]
```

### Global Settings

- **Batch Size:** Controls how many rows are processed at once (default: 100,000)
  - Adjustable from the Manage Connections page under "Global Settings"
  - Affects all migrations (both immediate and scheduled)
  - Higher values = faster migrations but more memory usage

---

## ❓ FAQ

**Q: Do I need to install all database drivers?**  
A: Yes, all drivers are included in `requirements.txt` for convenience. However, you only need the drivers for databases you're actually using.

**Q: Can I extend the application with new database types?**  
A: Yes! Create new reader/writer modules following the existing pattern (e.g., `mongodb_reader.py`, `mongodb_writer.py`).

**Q: How secure are my passwords?**  
A: Very secure! All passwords are encrypted using Fernet (AES-128) encryption. Never commit `.encryption_key` to version control or share it publicly.

**Q: Can I change the batch size for specific migrations?**  
A: Currently, batch size is global. You can change it in Global Settings, and it will apply to all future migrations.

**Q: What happens if a scheduled job fails to run?**  
A: If the application is stopped, scheduled jobs won't execute. Restart the app to re-register persisted schedules.

**Q: Can I manually edit `db_connections.json`?**  
A: Not recommended. Passwords must be encrypted. Use the web UI to add/edit connections, which handles encryption automatically.

**Q: Does the application support SSL/TLS connections?**  
A: Depends on the database driver. Configure SSL parameters in the connection details as needed by your database.

**Q: How do I backup my configuration?**  
A: Backup the entire `config/` directory, including `.encryption_key`. Without the key, encrypted passwords are unrecoverable.

**Q: Can I run multiple migrations simultaneously?**  
A: Yes, each migration runs in its own thread. However, be mindful of database connection limits and resource usage.

---

## 🛠️ Troubleshooting

**Issue: "Config files not found"**
- Solution: Delete the `config/` directory and restart the app. Files will be auto-created.

**Issue: "Decryption failed"**
- Solution: The `.encryption_key` file is missing or corrupted. If you have a backup, restore it. Otherwise, you'll need to re-enter connection passwords.

**Issue: "Database connection failed"**
- Solution: Verify connection details (host, port, username, password). Test connectivity outside the app first.

**Issue: "Scheduled jobs not running"**
- Solution: Ensure the application remains running. Scheduled jobs only execute while the app is active.

---

## 📝 API Endpoints

The application provides REST APIs for programmatic access:

- `GET /api/settings` - Get current global settings
- `POST /api/settings` - Update global settings (e.g., batch size)
- `GET /api/schedule` - List all scheduled jobs
- `POST /api/schedule` - Create a new scheduled migration
- `DELETE /api/schedule/<job_id>` - Cancel a scheduled job
- `GET /api/history` - Get migration history
- `POST /api/migrate` - Start an immediate migration

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Encryption powered by [Cryptography](https://cryptography.io/)
- Job scheduling via [APScheduler](https://apscheduler.readthedocs.io/)
- Database drivers: oracledb, psycopg2, mysql-connector-python, pyodbc

---

**For questions, issues, or contributions, please visit the GitHub repository.**  
👉 [GitHub Repository](https://github.com/rajivreddy-2203/query_db_migrator)
