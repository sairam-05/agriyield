from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse
import os
import sqlalchemy_access

# User Specified Storage Paths
ACCDB_PATH = r"C:\Users\sai\OneDrive\Documents\agriyield.accdb"
PDF_STORAGE_DIR = r"C:\Users\sai\OneDrive\Documents\agriyield_pdfs"

os.makedirs(os.path.dirname(ACCDB_PATH), exist_ok=True)
os.makedirs(PDF_STORAGE_DIR, exist_ok=True)

conn_str = f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={ACCDB_PATH};"
SQLALCHEMY_DATABASE_URL = f"access+pyodbc:///?odbc_connect={urllib.parse.quote_plus(conn_str)}"

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[DATABASE NOTICE] MS Access DB connection test ({e}). Activating resilient SQLite fallback...")
    FALLBACK_DB_PATH = os.path.join(os.path.dirname(ACCDB_PATH), "agriyield_fallback.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{FALLBACK_DB_PATH}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
