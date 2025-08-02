import pyodbc

def map_mssql_dtype(dtype):
    if 'int' in dtype:
        return 'INT'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BIT'
    elif 'datetime' in dtype:
        return 'DATETIME'
    else:
        return 'NVARCHAR(255)'

def insert_data(connection_details, df, table_name):
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={connection_details['host']},{connection_details['port']};"
        f"DATABASE={connection_details['database']};"
        f"UID={connection_details['user']};"
        f"PWD={connection_details['password']};"
    )
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    # 1. CREATE TABLE IF NOT EXISTS logic for SQL Server
    columns_with_types = ', '.join(
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
    # 2. Insert data
    cols = ','.join(f'[{col}]' for col in df.columns)
    values_template = ','.join(['?'] * len(df.columns))
    sql = f"INSERT INTO [{table_name}] ({cols}) VALUES ({values_template})"
    cursor.executemany(sql, df.values.tolist())
    conn.commit()
    cursor.close()
    conn.close()
