import psycopg2

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch from PostgreSQL.
    Columns are only yielded on the first batch.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=connection_details["database"],
            user=connection_details["user"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=int(connection_details["port"])
        )
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        while True:
            rows = cursor.fetchmany(batch_size)
            if not rows:
                break
            yield columns, rows
    except Exception as e:
        print(f"PostgreSQL fetch_data error: {e}")
        raise
    finally:
        if conn:
            conn.close()
