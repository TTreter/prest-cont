from flask import Blueprint, jsonify, request
from src.extensions import db
from src.models.user import User
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Rota para registrar um novo usuário
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        
        # Validação dos campos obrigatórios
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Username, email e password são obrigatórios"}), 400
        
        # Verificar se o username já existe
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username já está em uso"}), 409
        
        # Verificar se o email já existe
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email já está em uso"}), 409
        
        # Criar novo usuário
        user = User(username=data["username"], email=data["email"])
        user.set_password(data["password"])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "Usuário criado com sucesso",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Rota para login de usuário
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        
        # Validação dos campos obrigatórios
        if not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username e password são obrigatórios"}), 400
        
        # Buscar usuário pelo username
        user = User.query.filter_by(username=data["username"]).first()
        
        # Verificar se o usuário existe e a senha está correta
        if not user or not user.check_password(data["password"]):
            return jsonify({"error": "Credenciais inválidas"}), 401
        
        # Verificar se o usuário está ativo
        if not user.is_active:
            return jsonify({"error": "Usuário desativado"}), 403
        
        # Atualizar last_login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Criar tokens JWT
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                "username": user.username,
                "email": user.email
            }
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            "message": "Login realizado com sucesso",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para renovar o access token usando o refresh token
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({"error": "Usuário não encontrado ou desativado"}), 404
        
        # Criar novo access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                "username": user.username,
                "email": user.email
            }
        )
        
        return jsonify({
            "access_token": access_token
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para obter informações do usuário autenticado
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para alterar senha
@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        if not data.get("old_password") or not data.get("new_password"):
            return jsonify({"error": "Senha antiga e nova senha são obrigatórias"}), 400
        
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Verificar senha antiga
        if not user.check_password(data["old_password"]):
            return jsonify({"error": "Senha antiga incorreta"}), 401
        
        # Definir nova senha
        user.set_password(data["new_password"])
        db.session.commit()
        
        return jsonify({"message": "Senha alterada com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Rota para logout (blacklist do token - requer implementação adicional)
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Nota: Para implementar um logout completo, seria necessário um sistema de blacklist de tokens
    # Por enquanto, o logout será feito no frontend removendo o token
    return jsonify({"message": "Logout realizado com sucesso"}), 200
