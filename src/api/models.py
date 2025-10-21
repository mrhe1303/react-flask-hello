from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, Column, Integer
from datetime import datetime
import hashlib
import secrets

db = SQLAlchemy()

def generate_salt():
    return secrets.token_hex(16)

class User(db.Model):
    __tablename__ = 'users'  # Cambiar de 'user' a 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    salt = Column(String(32), nullable=False, default=generate_salt)
    is_active = Column(Boolean(), nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hash the password with the salt"""
        self.salt = generate_salt()
        self.password = hashlib.sha256((password + self.salt).encode()).hexdigest()

    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        password_hash = hashlib.sha256((password + self.salt).encode()).hexdigest()
        return self.password == password_hash

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }