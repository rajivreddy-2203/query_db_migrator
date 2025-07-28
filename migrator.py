from db_config import get_oracle_connection
from psycopg2 import sql
from psycopg2.extras import execute_batch

def migrate_query_result(oracle_db_key, query, pg_table, pg_conn):
    # Fetch data from Oracle
    with get_oracle_connection(oracle_db_key) as ora_conn:
        cursor = ora_conn.cursor()
        cursor.execute(query)
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()

    if not rows:
        raise Exception("No rows returned from Oracle query.")

    # Create table in PostgreSQL
    with pg_conn.cursor() as cur:
        col_defs = [f"{col} TEXT" for col in columns]  # Use TEXT to support multilingual
        cur.execute(
            sql.SQL("CREATE TABLE IF NOT EXISTS {} ({})").format(
                sql.Identifier(pg_table),
                sql.SQL(', ').join(sql.SQL(col_def) for col_def in col_defs)
            )
        )

        # Insert rows
        insert_query = sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
            sql.Identifier(pg_table),
            sql.SQL(', ').join(map(sql.Identifier, columns)),
            sql.SQL(', ').join(sql.Placeholder() * len(columns))
        )
        execute_batch(cur, insert_query.as_string(pg_conn), rows)

    pg_conn.commit()
    return {"rows_migrated": len(rows)}
