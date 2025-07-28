import oracledb
import psycopg2

# Oracle DB connections (multiple)
ORACLE_DBS = {
    "db1": {
        "user": "yrr2203",
        "password": "yrr2203",
        "dsn": "localhost:1522/orclpdb"
    },
}

def get_oracle_connection(db_key):
    config = ORACLE_DBS[db_key]
    return oracledb.connect(user=config["user"], password=config["password"], dsn=config["dsn"])

def get_pg_connection():
    return psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="admin"
    )
