from src.extensions import db

# Modelo para representar um usuário do sistema.
class User(db.Model):
    # Identificador único do usuário.
    id = db.Column(db.Integer, primary_key=True)
    # Nome de usuário, deve ser único e não nulo.
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Endereço de e-mail, deve ser único e não nulo.
    email = db.Column(db.String(120), unique=True, nullable=False)

    # Representação string do objeto User.
    def __repr__(self):
        return f'<User {self.username}>'

    # Converte o objeto User em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
