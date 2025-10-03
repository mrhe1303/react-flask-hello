from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import hashlib
import secrets

db = SQLAlchemy()

def generate_salt():
    return secrets.token_hex(16)

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[str] = mapped_column(String(32), nullable=False, default=generate_salt)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
        
        self.salt = generate_salt()
        self.password = hashlib.sha256((password + self.salt).encode()).hexdigest()

    def check_password(self, password):
        
        password_hash = hashlib.sha256((password + self.salt).encode()).hexdigest()
        return self.password == password_hash

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }