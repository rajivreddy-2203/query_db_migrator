import psycopg2
from psycopg2.extras import execute_values

def map_postgres_dtype(dtype):
    dtype = dtype.lower()
    if 'int' in dtype:
        return 'INTEGER'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BOOLEAN'
    elif 'datetime' in dtype or 'date' in dtype:
        return 'TIMESTAMP'
    else:
        return 'TEXT'

def insert_data(connection_details, df, table_name, type_mapping=None, create_table=False):
    """
    Insert a DataFrame batch into Postgres, creating table if needed.
    type_mapping: dict of {col: postgres_type}
    create_table: only True for first batch
    """
    conn = psycopg2.connect(
        dbname=connection_details["database"],
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=int(connection_details["port"])
    )
    cursor = conn.cursor()
    try:
        if create_table:
            columns_with_types = ', '.join(
                f'"{col}" {type_mapping.get(col, map_postgres_dtype(str(dtype)))}'
                if type_mapping else
                f'"{col}" {map_postgres_dtype(str(dtype))}'
                for col, dtype in zip(df.columns, df.dtypes)
            )
            create_stmt = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({columns_with_types});'
            cursor.execute(create_stmt)

        # Insert data
        cols = ','.join(f'"{col}"' for col in df.columns)
        execute_values(
            cursor,
            f'INSERT INTO "{table_name}" ({cols}) VALUES %s',
            df.values.tolist()
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()
