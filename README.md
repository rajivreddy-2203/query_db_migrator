# Data Migrator

**Data Migrator** is a Python utility to move data between Oracle, PostgreSQL, MySQL, and Microsoft SQL Server.

---

## ⚡ Features

- **Modular:** Only uses code needed for your migration.
- **Flexible:** Add new database backends easily.
- **No bloat:** Install only the packages for the databases you use.

---

## 🧠 How the App Works

1. **Manage Connections:**
   - Navigate to the **Manage Connections** page.
   - You can **add** , **edit** or **remove** database connections from the UI.
   - These changes will be reflected and saved in `config/db_connections.json`.

2. **Run a Migration:**
   - From the main page, **select the source connection** (the database to read from).
   - Select the **destination connection** (the database to write to).
   - Provide a valid SQL **query** to extract data from the source, note: multi-table queries are also supported.
   - Enter the **target table name** in the destination table name.
   - Click the **Migrate** button to start the process.

> The system will read the data from the source using your query and insert it into the destination table.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rajivreddy-2203/data_migrator_query.git
cd data_migrator_query
```

### 2. Configure Database Connections

Edit `config/db_connections.json` to specify your source and target database credentials:

```json
{
  "source": {
    "db_type": "oracle",
    "host": "localhost",
    "port": 1521,
    "user": "username",
    "password": "password",
    "database": "XE"
  },
  "target": {
    "db_type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "user": "username",
    "password": "password",
    "database": "postgres"
  }
}
```

> No need to edit this file as the app and UI updates this file automatically when you add, edit, or remove connections.

### 3. Install Required Packages

Install only the packages for the databases you intend to migrate:

```bash
pip install -r requirements.txt
```

---

## 🛠️ Usage

### 1. Start the Application

- **Windows**:
  ```bash
  set FLASK_APP=app.py
  flask run
  ```

- **Linux/macOS**:
  ```bash
  export FLASK_APP=app.py
  flask run
  ```

Visit [http://127.0.0.1:5000/](http://127.0.0.1:5000/) in your browser.

### 2. Manage Connections in the UI

- Add, edit, or remove database connections using the provided web interface.
- All changes automatically update `config/db_connections.json`.

### 3. Run a Migration

- Select the source and target databases in the UI.
- Choose the data/tables you want to migrate.
- Click the **Migrate** button to start the process.

---

## 📁 Project Structure

```
ORACLE_PG_MIGRATOR/
├── app.py
├── db_router.py
├── migrator.py
├── config/
│   └── db_connections.json
├── static/
│   └── manage_connections.js
├── templates/
│   ├── index.html
│   └── manage_connections.html
├── mssql_reader.py
├── mssql_writer.py
├── mysql_reader.py
├── mysql_writer.py
├── oracle_reader.py
├── oracle_writer.py
├── postgresql_reader.py
├── postgresql_writer.py
├── __pycache__/
│   └── *.pyc
└── .gitignore
```

---

## 🔒 How Connections Are Saved & Managed

- All database connection details are stored in `config/db_connections.json`.
- Modifications through the web app interface are saved directly to this file.
- `db_router.py` and `migrator.py` read the current configuration and use it during migrations.

---

## ❓ FAQ

**Q:** Do I have to install all database drivers?  
**A:** No. Only install the drivers for the databases you are using (e.g., `oracledb`, `psycopg2`, `mysql-connector-python`, `pyodbc`).

**Q:** Can I extend/customize the migrations?  
**A:** Yes! Add new reader/writer modules as needed.

---

## 📄 License

This project is licensed under the MIT License.

---

*For questions or contributions, please open an issue or fork the repo.*  
👉 [GitHub Repo](https://github.com/rajivreddy-2203/data_migrator_query)


---
