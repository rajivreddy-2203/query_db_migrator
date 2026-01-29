import pyodbc

def map_mssql_dtype(dtype):
    """Map pandas dtype to SQL Server-specific data types"""
    dtype = dtype.lower()
    if 'int64' in dtype:
        return 'BIGINT'
    elif 'int32' in dtype:
        return 'INT'
    elif 'int16' in dtype:
        return 'SMALLINT'
    elif 'int8' in dtype:
        return 'TINYINT'
    elif 'int' in dtype:
        return 'INT'
    elif 'float64' in dtype:
        return 'FLOAT(53)'  # Double precision
    elif 'float32' in dtype:
        return 'REAL'  # Single precision
    elif 'float' in dtype:
        return 'FLOAT(53)'
    elif 'bool' in dtype:
        return 'BIT'
    elif 'datetime64' in dtype:
        return 'DATETIME2'  # More precise than DATETIME
    elif 'datetime' in dtype:
        return 'DATETIME2'
    elif 'date' in dtype:
        return 'DATE'
    elif 'time' in dtype:
        return 'TIME'
    elif 'object' in dtype:
        return 'NVARCHAR(MAX)'  # Use NVARCHAR(MAX) for long strings with Unicode support
    else:
        return 'NVARCHAR(MAX)'

def insert_data(connection_details, df, table_name, type_mapping=None, create_table=False):
    """
    Insert a batch DataFrame into SQL Server table, creating the table if requested.
    type_mapping: dict of {col: mssql_type}
    create_table: only True on first batch
    """
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={connection_details['host']},{connection_details['port']};"
        f"DATABASE={connection_details['database']};"
        f"UID={connection_details['user']};"
        f"PWD={connection_details['password']};"
    )
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    try:
        if create_table:
            columns_with_types = ', '.join(
                f'[{col}] {type_mapping.get(col, map_mssql_dtype(str(dtype)))}'
                if type_mapping else
                f'[{col}] {map_mssql_dtype(str(dtype))}'
                for col, dtype in zip(df.columns, df.dtypes)
            )
            check_and_create_sql = f"""
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'{table_name}')
            BEGIN
                CREATE TABLE [{table_name}] ({columns_with_types});
            END
            """
            cursor.execute(check_and_create_sql)
        # Insert data
        cols = ','.join(f'[{col}]' for col in df.columns)
        values_template = ','.join(['?'] * len(df.columns))
        sql = f"INSERT INTO [{table_name}] ({cols}) VALUES ({values_template})"
        cursor.executemany(sql, df.values.tolist())
        conn.commit()
    finally:
        cursor.close()
        conn.close()
