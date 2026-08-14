import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default paths
ACCDB_PATH = r"C:\Users\sai\OneDrive\Documents\agriyield.accdb"
PDF_STORAGE_DIR = r"C:\Users\sai\OneDrive\Documents\agriyield_pdfs"

is_vercel = os.environ.get("VERCEL") == "1" or not os.name == "nt"

engine = None

if not is_vercel:
    try:
        os.makedirs(os.path.dirname(ACCDB_PATH), exist_ok=True)
        os.makedirs(PDF_STORAGE_DIR, exist_ok=True)
        import sqlalchemy_access
        conn_str = f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={ACCDB_PATH};"
        SQLALCHEMY_DATABASE_URL = f"access+pyodbc:///?odbc_connect={urllib.parse.quote_plus(conn_str)}"
        engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
    except Exception as e:
        print(f"[DATABASE NOTICE] MS Access DB connection test ({e}). Activating resilient SQLite fallback...")
        engine = None

if engine is None:
    fallback_dir = "/tmp" if is_vercel else os.path.join(os.path.expanduser("~"), ".agriyield")
    os.makedirs(fallback_dir, exist_ok=True)
    FALLBACK_DB_PATH = os.path.join(fallback_dir, "agriyield_fallback.db")
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
