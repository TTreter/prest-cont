import os
import sys
from datetime import timedelta

# Adiciona o diretório pai ao sys.path para permitir importações relativas.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.extensions import db, bcrypt, jwt
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.prestacao_contas import prestacao_bp
from src.routes.pdf_routes import pdf_bp

# Inicializa a aplicação Flask e configura a pasta de arquivos estáticos.
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Define uma chave secreta para a aplicação Flask (usada para sessões, etc.).
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurações JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production-#FGS$5WGT')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Configura a URI do banco de dados SQLAlchemy (SQLite neste caso).
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
# Desabilita o rastreamento de modificações do SQLAlchemy para economizar recursos.
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa extensões
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# Configurar CORS para permitir requisições do frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Registra os Blueprints (conjuntos de rotas) na aplicação Flask.
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(prestacao_bp, url_prefix='/api')
app.register_blueprint(pdf_bp, url_prefix='/api')

# Importa todos os modelos para garantir que as tabelas sejam criadas no banco de dados.
from src.models.user import User
from src.models.prestacao_contas import (
    Servidor, Cargo, Presidente, PrestacaoContas, 
    Adiantamento, DespesaDiaria, DocumentoComprovacao, DespesaPassagem
)

# Cria todas as tabelas do banco de dados dentro do contexto da aplicação.
with app.app_context():
    db.create_all()

# Rota para servir arquivos estáticos e o index.html do frontend.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    # Tenta servir o arquivo estático solicitado.
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        # Se o arquivo não for encontrado, serve o index.html (para aplicações SPA).
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


# Bloco de execução principal: inicia o servidor Flask.
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

