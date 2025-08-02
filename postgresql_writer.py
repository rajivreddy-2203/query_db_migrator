import psycopg2
from psycopg2.extras import execute_values

def map_dtype(dtype):
    if 'int' in dtype:
        return 'INTEGER'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BOOLEAN'
    elif 'datetime' in dtype:
        return 'TIMESTAMP'
    else:
        return 'TEXT'

def insert_data(connection_details, df, table_name):
    conn = psycopg2.connect(
        dbname=connection_details["database"],
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=connection_details["port"]
    )
    cursor = conn.cursor()
    # 1. Try to create table if it doesn't exist
    columns_with_types = ', '.join(
        f'{col} {map_dtype(str(dtype))}'
        for col, dtype in zip(df.columns, df.dtypes)
    )
    create_stmt = f'CREATE TABLE IF NOT EXISTS {table_name} ({columns_with_types});'
    cursor.execute(create_stmt)

    # 2. Insert data
    cols = ','.join(df.columns)
    execute_values(
        cursor,
        f"INSERT INTO {table_name} ({cols}) VALUES %s",
        df.values.tolist()
    )
    conn.commit()
    cursor.close()
    conn.close()
