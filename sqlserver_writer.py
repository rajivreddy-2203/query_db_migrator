import pyodbc

def map_mssql_dtype(dtype):
    dtype = dtype.lower()
    if 'int' in dtype:
        return 'INT'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BIT'
    elif 'datetime' in dtype or 'date' in dtype:
        return 'DATETIME'
    else:
        return 'NVARCHAR(255)'

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
