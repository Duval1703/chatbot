import psycopg2
from config import settings

# Connect to database and drop all tables with CASCADE
print('Dropping all tables with CASCADE...')
try:
    conn = psycopg2.connect(
        host='localhost',
        database='medichat_ai',
        user='postgres', 
        password='postgresql',
        port=5432
    )
    
    cur = conn.cursor()
    
    # Get all table names 
    cur.execute("""
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
    """)
    
    tables = cur.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f'Dropping table: {table_name}')
        cur.execute(f'DROP TABLE IF EXISTS {table_name} CASCADE')
    
    conn.commit()
    cur.close()
    conn.close()
    
    print('✅ All tables dropped')
    
    # Now recreate with SQLAlchemy
    from database import engine
    from models import Base
    
    Base.metadata.create_all(bind=engine)
    print('✅ Tables recreated with correct schema')
    
except Exception as e:
    print(f'❌ Error: {e}')
