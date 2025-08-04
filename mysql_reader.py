import mysql.connector

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch up to batch_size.
    Columns only yielded with the first batch.
    """
    conn = None
    try:
        conn = mysql.connector.connect(
            user=connection_details["user"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=int(connection_details.get("port", 3306)),
            database=connection_details["database"]
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
        print(f"MySQL fetch_data error: {e}")
        raise
    finally:
        if conn:
            conn.close()
