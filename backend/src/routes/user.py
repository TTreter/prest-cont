from flask import Blueprint, jsonify, request
from src.extensions import db
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

# Rota para obter todos os usuários (protegida).
@user_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# Rota para criar um novo usuário (agora apenas para uso administrativo).
# O registro público deve ser feito através de /api/auth/register
@user_bp.route("/users", methods=["POST"])
@jwt_required()
def create_user():
    try:
        data = request.json
        
        # Validação dos campos obrigatórios
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Username, email e password são obrigatórios"}), 400
        
        # Verificar se já existe
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username já existe"}), 409
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email já existe"}), 409
        
        user = User(username=data["username"], email=data["email"])
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Rota para obter um usuário específico pelo ID (protegida).
@user_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# Rota para atualizar um usuário existente pelo ID (protegida).
@user_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        # Usuário só pode atualizar seus próprios dados (exceto admin)
        if current_user_id != user_id:
            return jsonify({"error": "Não autorizado a atualizar este usuário"}), 403
        
        data = request.json
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        
        # Atualizar senha se fornecida
        if data.get("password"):
            user.set_password(data["password"])
        
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Rota para deletar um usuário pelo ID (protegida).
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Usuário só pode deletar sua própria conta (exceto admin)
        if current_user_id != user_id:
            return jsonify({"error": "Não autorizado a deletar este usuário"}), 403
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
