# Airbnb NYC 2019 - ETL to Supabase PostgreSQL
import pandas as pd
import psycopg2
from sqlalchemy import create_engine, text
import os
from datetime import datetime

# Configuration
print("🚀 Starting ETL to Supabase PostgreSQL...")
print("=" * 50)

def create_connection():
    """Create connection to Supabase PostgreSQL"""
    try:
        # connection_string = "postgresql://postgres.yqdkkcqlqkdndrqeqvzz:GgoqXGewQeMekBC9@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
        connection_string = "postgresql://postgres:123@localhost:5432/airbnb"
        engine = create_engine(connection_string)
        print("✅ Database connection established successfully")
        return engine
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def load_csv_files():
    """Load all CSV files from ETL results"""
    print("\n📂 Loading CSV files...")
    
    try:
        # Load dimension tables
        dim_location = pd.read_csv('dim_location.csv')
        print(f"✅ dim_location loaded: {len(dim_location)} records")
        
        dim_host = pd.read_csv('dim_host.csv')
        print(f"✅ dim_host loaded: {len(dim_host)} records")
        
        dim_room_type = pd.read_csv('dim_room_type.csv')
        print(f"✅ dim_room_type loaded: {len(dim_room_type)} records")
        
        dim_listing = pd.read_csv('dim_listing.csv')
        print(f"✅ dim_listing loaded: {len(dim_listing)} records")
        
        dim_date = pd.read_csv('dim_date.csv')
        # Convert date column to datetime
        dim_date['date'] = pd.to_datetime(dim_date['date'])
        print(f"✅ dim_date loaded: {len(dim_date)} records")
        
        # Load fact table
        fact_listing_daily = pd.read_csv('fact_listing_daily.csv')
        # Don't convert date_id - it contains UUID values, not dates
        print(f"✅ fact_listing_daily loaded: {len(fact_listing_daily)} records")
        
        return {
            'dim_location': dim_location,
            'dim_host': dim_host,
            'dim_room_type': dim_room_type,
            'dim_listing': dim_listing,
            'dim_date': dim_date,
            'fact_listing_daily': fact_listing_daily
        }
        
    except Exception as e:
        print(f"❌ Error loading CSV files: {e}")
        return None

def create_tables(engine):
    """Create tables in PostgreSQL"""
    print("\n🔨 Creating tables in PostgreSQL...")
    
    create_tables_sql = """
    -- Drop tables if exist (for clean setup)
    DROP TABLE IF EXISTS fact_listing_daily CASCADE;
    DROP TABLE IF EXISTS dim_location CASCADE;
    DROP TABLE IF EXISTS dim_host CASCADE;
    DROP TABLE IF EXISTS dim_room_type CASCADE;
    DROP TABLE IF EXISTS dim_listing CASCADE;
    DROP TABLE IF EXISTS dim_date CASCADE;
    
    -- Create dimension tables
    CREATE TABLE dim_location (
        id VARCHAR(36) PRIMARY KEY,
        neighbourhood_group VARCHAR(50),
        neighbourhood VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8)
    );
    
    CREATE TABLE dim_host (
        id VARCHAR(36) PRIMARY KEY,
        host_name VARCHAR(200)
    );
    
    CREATE TABLE dim_room_type (
        id VARCHAR(36) PRIMARY KEY,
        room_type VARCHAR(50)
    );
    
    CREATE TABLE dim_listing (
        id VARCHAR(36) PRIMARY KEY,
        name TEXT,
        minimum_nights INTEGER
    );
    
    CREATE TABLE dim_date (
        id VARCHAR(36) PRIMARY KEY,
        date DATE,
        day INTEGER,
        month INTEGER,
        year INTEGER,
        day_of_week VARCHAR(10),
        is_weekend BOOLEAN
    );
    
    -- Create fact table WITHOUT foreign key constraints initially
    CREATE TABLE fact_listing_daily (
        id VARCHAR(36) PRIMARY KEY,
        listing_id VARCHAR(36),
        host_id VARCHAR(36),
        location_id VARCHAR(36),
        room_type_id VARCHAR(36),
        date_id VARCHAR(36),
        price DECIMAL(10, 2),
        availability_365 INTEGER,
        number_of_reviews INTEGER,
        reviews_per_month DECIMAL(5, 2),
        calculated_host_listings_count INTEGER
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_fact_listing_location ON fact_listing_daily(location_id);
    CREATE INDEX idx_fact_listing_host ON fact_listing_daily(host_id);
    CREATE INDEX idx_fact_listing_room_type ON fact_listing_daily(room_type_id);
    CREATE INDEX idx_fact_listing_date ON fact_listing_daily(date_id);
    """
    
    try:
        with engine.connect() as connection:
            connection.execute(text(create_tables_sql))
            connection.commit()
        print("✅ Tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def validate_foreign_keys(dataframes):
    """Validate foreign key relationships before loading"""
    print("\n🔍 Validating foreign key relationships...")
    
    fact_df = dataframes['fact_listing_daily'].copy()
    
    # # Check date references
    # date_values = set(dataframes['dim_date']['date'].dt.date)
    # fact_dates = set(fact_df['date_id'].dt.date)
    # missing_dates = fact_dates - date_values
    
    # if missing_dates:
    #     print(f"⚠️  Found {len(missing_dates)} dates in fact table not in dim_date:")
    #     print(f"Missing dates: {sorted(list(missing_dates))[:5]}...")  # Show first 5
        
    #     # Filter out records with missing dates
    #     fact_df = fact_df[fact_df['date_id'].dt.date.isin(date_values)]
    #     print(f"Filtered fact table: {len(fact_df)} records remain")
    
    # Check other foreign keys
    null_listing = fact_df['listing_id'].isnull().sum()
    null_host = fact_df['host_id'].isnull().sum()
    null_location = fact_df['location_id'].isnull().sum()
    null_room_type = fact_df['room_type_id'].isnull().sum()
    
    if null_listing > 0 or null_host > 0 or null_location > 0 or null_room_type > 0:
        print(f"⚠️  Found null foreign keys: listing({null_listing}), host({null_host}), location({null_location}), room_type({null_room_type})")
        fact_df = fact_df.dropna(subset=['listing_id', 'host_id', 'location_id', 'room_type_id'])
        print(f"After removing nulls: {len(fact_df)} records remain")
    
    dataframes['fact_listing_daily'] = fact_df
    print("✅ Foreign key validation completed")
    return dataframes

def load_data_to_database(engine, dataframes):
    """Load all dataframes to PostgreSQL"""
    print("\n📤 Loading data to PostgreSQL...")
    
    try:
        # Validate foreign keys first
        dataframes = validate_foreign_keys(dataframes)
        
        # Load dimension tables first
        tables_order = ['dim_location', 'dim_host', 'dim_room_type', 'dim_listing', 'dim_date']
        
        for table_name in tables_order:
            df = dataframes[table_name]
            print(f"Loading {table_name}...")
            df.to_sql(table_name, engine, if_exists='append', index=False, method='multi', chunksize=1000)
            print(f"✅ {table_name} loaded: {len(df)} records")
        
        # Load fact table
        print("Loading fact_listing_daily...")
        fact_df = dataframes['fact_listing_daily']
        fact_df.to_sql('fact_listing_daily', engine, if_exists='append', index=False, method='multi', chunksize=500)
        print(f"✅ fact_listing_daily loaded: {len(fact_df)} records")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading data to database: {e}")
        print(f"Error details: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

def add_foreign_key_constraints(engine):
    """Add foreign key constraints after data is loaded"""
    print("\n🔗 Adding foreign key constraints...")
    
    constraints = [
        ("fk_listing", "listing_id", "dim_listing(id)"),
        ("fk_host", "host_id", "dim_host(id)"),
        ("fk_location", "location_id", "dim_location(id)"),
        ("fk_room_type", "room_type_id", "dim_room_type(id)"),
        ("fk_date", "date_id", "dim_date(id)")
    ]
    
    success_count = 0
    for constraint_name, column, reference in constraints:
        try:
            sql = f"ALTER TABLE fact_listing_daily ADD CONSTRAINT {constraint_name} FOREIGN KEY ({column}) REFERENCES {reference};"
            with engine.connect() as connection:
                connection.execute(text(sql))
                connection.commit()
            print(f"✅ {constraint_name} added successfully")
            success_count += 1
        except Exception as e:
            print(f"⚠️  Warning: Could not add {constraint_name}: {e}")
    
    if success_count == len(constraints):
        print("✅ All foreign key constraints added successfully")
        return True
    else:
        print(f"⚠️  {success_count}/{len(constraints)} constraints added")
        return False

def verify_data(engine):
    """Verify data in database"""
    print("\n🔍 Verifying data in database...")
    
    try:
        tables = ['dim_location', 'dim_host', 'dim_room_type', 'dim_listing', 'dim_date', 'fact_listing_daily']
        
        print("📊 Table Record Counts:")
        for table in tables:
            query = f"SELECT COUNT(*) as count FROM {table}"
            result = pd.read_sql(query, engine)
            count = result['count'].iloc[0]
            print(f"• {table}: {count:,} records")
        
        # Sample data verification with JOIN
        print("\n📋 Sample data verification:")
        sample_query = """
        SELECT 
            dl.name as listing_name,
            dh.host_name,
            dloc.neighbourhood_group,
            drt.room_type,
            f.price
        FROM fact_listing_daily f
        JOIN dim_listing dl ON f.listing_id = dl.id
        JOIN dim_host dh ON f.host_id = dh.id
        JOIN dim_location dloc ON f.location_id = dloc.id
        JOIN dim_room_type drt ON f.room_type_id = drt.id
        LIMIT 5;
        """
        
        sample_result = pd.read_sql(sample_query, engine)
        print(sample_result.to_string(index=False))
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying data: {e}")
        return False

def main():
    """Main ETL process"""
    start_time = datetime.now()
    
    # Step 1: Load CSV files
    dataframes = load_csv_files()
    if not dataframes:
        print("❌ Failed to load CSV files. Exiting...")
        return
    
    # Step 2: Create database connection
    engine = create_connection()
    if not engine:
        print("❌ Failed to connect to database. Exiting...")
        return
    
    # Step 3: Create tables
    if not create_tables(engine):
        print("❌ Failed to create tables. Exiting...")
        return
    
    # Step 4: Load data to database
    if not load_data_to_database(engine, dataframes):
        print("❌ Failed to load data to database. Exiting...")
        return
    
    # Step 5: Add foreign key constraints (optional)
    add_foreign_key_constraints(engine)
    
    # Step 6: Verify data
    if not verify_data(engine):
        print("❌ Failed to verify data. Please check manually...")
        return
    
    # Success message
    end_time = datetime.now()
    duration = end_time - start_time
    
    print("\n" + "=" * 50)
    print("🎉 ETL PROCESS COMPLETED SUCCESSFULLY!")
    print(f"⏱️  Total execution time: {duration}")
    print("📊 Star schema datawarehouse created in Supabase PostgreSQL")
    print("🔗 You can now connect to your Supabase database for analytics")
    print("=" * 50)

if __name__ == "__main__":
    main()