# Oracle_PG_Migrator

Oracle_PG_Migrator is a Python-based utility that helps you **migrate data between Oracle, PostgreSQL, MySQL, and MSSQL databases** with minimal setup. Designed for flexibility, the tool allows you to trigger only the necessary migration scripts, letting you install just the Python packages you need for your specific migration scenario.

---

## 🚀 How the Project Works

- The project is built around distinct Python modules for each database type:
  - **`*_reader.py`** files read from source databases.
  - **`*_writer.py`** files handle writing into target databases.
- **Routing logic** (in `db_router.py` and `migrator.py`) orchestrates the data flow, determining which reader and writer to use based on migration settings.
- The **configuration** (`config/db_connections.json`) holds your database connection details.
- **Static web assets** and **templates** (`static/`, `templates/`) provide any UI elements if included.

---

## 🛠️ Getting Started

### 1. **Clone the Repository**

- git clone 
- cd ORACLE_PG_MIGRATOR


### 2. **Set Up Configuration**

- Edit `config/db_connections.json` with the credentials for your source and target databases.

### 3. **Install Only the Necessary Packages**

- **You do not need to install all possible database drivers.**
- For example, if you are migrating from Oracle to PostgreSQL, only install their respective packages:


- Here are some common packages:
- **Oracle:** `oracledb`
- **PostgreSQL:** `psycopg2`
- **MySQL:** `mysql`
- **MSSQL:** `pyodbc`
- If you change the database sources, install additional packages as required.

### 4. **Run the Application**

- **To use the Flask web interface:**
- open cmd then cd to the project dir
  1. Set the Flask app environment variable:
      - On Windows (CMD):
          ```
          set FLASK_APP=app.py
          ```
      - On Linux/macOS (bash):
          ```
          export FLASK_APP=app.py
          ```
  2. Launch the web application:
      ```
      flask run
      ```
  3. Open your web browser and go to the URL provided in the terminal (usually `http://127.0.0.1:5000/`).

## 📁 Project Structure

ORACLE_PG_MIGRATOR/
│
├── app.py
├── db_router.py
├── migrator.py
├── config/
│ └── db_connections.json
├── static/
│ └── manage_connections.js
├── templates/
│ └── index.html
│ └── manage_connections.html
├── mssql_reader.py / mssql_writer.py
├── mysql_reader.py / mysql_writer.py
├── oracle_reader.py / oracle_writer.py
├── postgresql_reader.py / postgresql_writer.py
├── pycache/
│ └── *.pyc
└── .gitignore


---

## ⚡ Features

- **Modular:** Only uses code relevant to your migration.
- **Flexible:** Easy to add new database backends.
- **No bloat:** Install only what you need.

---

## 🔒 .gitignore

The project includes a sensible `.gitignore` to avoid committing bytecode, virtual environments, logs, and local settings.

---

## 🙋 FAQ

**Q: Do I have to install all the database packages?**  
A: _No_ — only install the ones you're actively using for your migration; the unused modules and dependencies are never loaded.

**Q: Can I extend or customize migrations?**  
A: Yes! Add new reader/writer modules for additional databases or tweak the routing logic as needed.

---

## 📝 License

This project is licensed under the MIT License.

---

_If you have questions or want to contribute, please open an issue or fork the repo!_
