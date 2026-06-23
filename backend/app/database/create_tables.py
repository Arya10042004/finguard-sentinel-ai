from app.database.db_connection import engine, Base
from app.models import db_models


def create_database_tables():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    create_database_tables()