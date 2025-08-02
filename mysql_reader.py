import mysql.connector

def fetch_data(query, connection_details, batch_size=1000):
    conn = mysql.connector.connect(
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=connection_details["port"],
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
    cursor.close()
    conn.close()
