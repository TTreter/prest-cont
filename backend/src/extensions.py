from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Inicializa a extensão SQLAlchemy para gerenciar o banco de dados.
db = SQLAlchemy()

# Inicializa o Bcrypt para hash de senhas
bcrypt = Bcrypt()

# Inicializa o JWT Manager para autenticação
jwt = JWTManager()

