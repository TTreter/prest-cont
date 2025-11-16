from src.extensions import db
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime

# Modelo para representar um usuário do sistema.
class User(db.Model):
    # Identificador único do usuário.
    id = db.Column(db.Integer, primary_key=True)
    # Nome de usuário, deve ser único e não nulo.
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    # Endereço de e-mail, deve ser único e não nulo.
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    # Hash da senha do usuário (bcrypt)
    password_hash = db.Column(db.String(255), nullable=False)
    # Data de criação do usuário
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Última vez que o usuário fez login
    last_login = db.Column(db.DateTime, nullable=True)
    # Indica se o usuário está ativo
    is_active = db.Column(db.Boolean, default=True)

    # Representação string do objeto User.
    def __repr__(self):
        return f'<User {self.username}>'

    # Define a senha do usuário, gerando o hash bcrypt
    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    # Verifica se a senha fornecida corresponde ao hash armazenado
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Converte o objeto User em um dicionário (sem expor a senha)
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }
