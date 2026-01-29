import pyodbc

def get_column_types(cursor_description):
    """
    Extract SQL Server column types from cursor description.
    Returns list of formatted type strings.
    """
    types = []
    for desc in cursor_description:
        type_name = desc[1].__name__ if hasattr(desc[1], '__name__') else str(desc[1])
        size = desc[3] if len(desc) > 3 and desc[3] else None
        
        # Map Python types to SQL Server types
        if type_name == 'str':
            if size and size > 0 and size < 4000:
                types.append(f"NVARCHAR({size})")
            else:
                types.append("NVARCHAR(MAX)")
        elif type_name == 'int':
            types.append('INT')
        elif type_name == 'float':
            types.append('FLOAT')
        elif type_name == 'Decimal':
            types.append('DECIMAL')
        elif type_name == 'datetime':
            types.append('DATETIME2')
        elif type_name == 'date':
            types.append('DATE')
        elif type_name == 'time':
            types.append('TIME')
        elif type_name == 'bool':
            types.append('BIT')
        elif type_name == 'bytes':
            types.append('VARBINARY(MAX)')
        elif type_name == 'UUID':
            types.append('UNIQUEIDENTIFIER')
        else:
            types.append('NVARCHAR(MAX)')
    
    return types

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch from SQL Server.
    Columns yielded on the first batch only.
    """
    conn = None
    try:
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={connection_details['host']},{connection_details['port']};"
            f"DATABASE={connection_details['database']};"
            f"UID={connection_details['user']};"
            f"PWD={connection_details['password']};"
        )
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        while True:
            rows = cursor.fetchmany(batch_size)
            if not rows:
                break
            # Convert pyodbc Row objects to tuples for proper pandas DataFrame handling
            rows_as_tuples = [tuple(row) for row in rows]
            yield columns, rows_as_tuples
    except Exception as e:
        print(f"SQL Server fetch_data error: {e}")
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
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={connection_details['host']},{connection_details['port']};"
            f"DATABASE={connection_details['database']};"
            f"UID={connection_details['user']};"
            f"PWD={connection_details['password']};"
        )
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        types = get_column_types(cursor.description)
        cursor.fetchone()  # Fetch one row to ensure query executed
        return columns, types
    except Exception as e:
        print(f"SQL Server get_column_metadata error: {e}")
        raise
    finally:
        if conn:
            conn.close()
