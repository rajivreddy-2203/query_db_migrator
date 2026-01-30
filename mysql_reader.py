import mysql.connector

def get_column_types(cursor_description):
    """
    Extract MySQL column types from cursor description.
    Returns list of formatted type strings.
    """
    type_map = {
        0: 'DECIMAL',
        1: 'TINYINT',
        2: 'SMALLINT',
        3: 'INT',
        4: 'FLOAT',
        5: 'DOUBLE',
        7: 'TIMESTAMP',
        8: 'BIGINT',
        9: 'MEDIUMINT',
        10: 'DATE',
        11: 'TIME',
        12: 'DATETIME',
        13: 'YEAR',
        15: 'VARCHAR',
        16: 'BIT',
        246: 'DECIMAL',
        247: 'ENUM',
        248: 'SET',
        249: 'TINYTEXT',
        250: 'MEDIUMTEXT',
        251: 'LONGTEXT',
        252: 'TEXT',
        253: 'VARCHAR',
        254: 'CHAR'
    }
    
    types = []
    for desc in cursor_description:
        type_code = desc[1]
        size = desc[2] if len(desc) > 2 else None
        type_name = type_map.get(type_code, 'UNKNOWN')
        
        if type_name in ('VARCHAR', 'CHAR') and size:
            types.append(f"{type_name}({size})")
        elif type_name == 'TEXT' and size and size > 65535:
            types.append('LONGTEXT')
        elif type_name == 'TEXT' and size and size > 16383:
            types.append('MEDIUMTEXT')
        else:
            types.append(type_name)
    
    return types

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
            database=connection_details["database"],
            charset='utf8mb4',
            use_unicode=True
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

def get_column_metadata(query, connection_details):
    """
    Get column names and their actual database types.
    Returns (columns, types) tuple.
    """
    conn = None
    try:
        conn = mysql.connector.connect(
            user=connection_details["user"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=int(connection_details.get("port", 3306)),
            database=connection_details["database"],
            charset='utf8mb4',
            use_unicode=True
        )
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        types = get_column_types(cursor.description)
        cursor.fetchone()  # Fetch one row to ensure query executed
        return columns, types
    except Exception as e:
        print(f"MySQL get_column_metadata error: {e}")
        raise
    finally:
        if conn:
            conn.close()
