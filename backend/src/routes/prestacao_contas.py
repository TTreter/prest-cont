from flask import Blueprint, request, jsonify
from src.extensions import db
from src.models.prestacao_contas import (
    Servidor, Cargo, Presidente, PrestacaoContas, 
    Adiantamento, DespesaDiaria, DocumentoComprovacao, DespesaPassagem
)

from datetime import datetime

prestacao_bp = Blueprint('prestacao', __name__)

# Rotas para Servidores
# Rota para obter todos os servidores cadastrados.
@prestacao_bp.route("/servidores", methods=["GET"])
def get_servidores():
    servidores = Servidor.query.all()
    return jsonify([servidor.to_dict() for servidor in servidores])

# Rota para criar um novo servidor.
@prestacao_bp.route("/servidores", methods=["POST"])
def create_servidor():
    data = request.get_json()
    servidor = Servidor(
        nome=data["nome"],
        cargo=data["cargo"]
    )
    db.session.add(servidor)
    db.session.commit()
    return jsonify(servidor.to_dict()), 201

# Rotas para Cargos
# Rota para obter todos os cargos cadastrados.
@prestacao_bp.route("/cargos", methods=["GET"])
def get_cargos():
    cargos = Cargo.query.all()
    return jsonify([cargo.to_dict() for cargo in cargos])

# Rota para criar um novo cargo.
@prestacao_bp.route("/cargos", methods=["POST"])
def create_cargo():
    data = request.get_json()
    cargo = Cargo(
        nome_cargo=data["nome_cargo"],
        valor_diaria_dentro_estado=data["valor_diaria_dentro_estado"],
        valor_diaria_fora_estado=data["valor_diaria_fora_estado"]
    )
    db.session.add(cargo)
    db.session.commit()
    return jsonify(cargo.to_dict()), 201

# Rota para atualizar um cargo existente.
@prestacao_bp.route("/cargos/<int:cargo_id>", methods=["PUT"])
def update_cargo(cargo_id):
    cargo = Cargo.query.get_or_404(cargo_id)
    data = request.get_json()
    
    cargo.nome_cargo = data.get("nome_cargo", cargo.nome_cargo)
    cargo.valor_diaria_dentro_estado = data.get("valor_diaria_dentro_estado", cargo.valor_diaria_dentro_estado)
    cargo.valor_diaria_fora_estado = data.get("valor_diaria_fora_estado", cargo.valor_diaria_fora_estado)
    
    db.session.commit()
    return jsonify(cargo.to_dict())

# Rotas para Presidentes
# Rota para obter todos os presidentes cadastrados.
@prestacao_bp.route("/presidentes", methods=["GET"])
def get_presidentes():
    presidentes = Presidente.query.all()
    return jsonify([presidente.to_dict() for presidente in presidentes])

# Rota para criar um novo presidente.
@prestacao_bp.route("/presidentes", methods=["POST"])
def create_presidente():
    data = request.get_json()
    presidente = Presidente(nome=data["nome"])
    db.session.add(presidente)
    db.session.commit()
    return jsonify(presidente.to_dict()), 201

# Rotas para Prestações de Contas
# Rota para criar uma nova prestação de contas.
@prestacao_bp.route("/prestacoes", methods=["POST"])
def create_prestacao():
    data = request.get_json()
    prestacao = PrestacaoContas(
        servidor_id=data["servidor_id"],
        presidente_id=data["presidente_id"]
    )
    db.session.add(prestacao)
    db.session.commit()
    return jsonify(prestacao.to_dict()), 201

# Rota para obter uma prestação de contas específica pelo ID.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>", methods=["GET"])
def get_prestacao(prestacao_id):
    prestacao = PrestacaoContas.query.get_or_404(prestacao_id)
    return jsonify(prestacao.to_dict())

# Rotas para Adiantamentos
# Rota para criar um novo adiantamento para uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/adiantamentos", methods=["POST"])
def create_adiantamento(prestacao_id):
    data = request.get_json()
    adiantamento = Adiantamento(
        prestacao_id=prestacao_id,
        tipo=data["tipo"], # Pode ser 'diaria' ou 'passagem'
        numero_adiantamento=data["numero_adiantamento"],
        numero_empenho=data["numero_empenho"],
        valor=data["valor"],
       data_adiantamento=datetime.strptime(data["data_adiantamento"], 
'%Y-%m-%d").date() if data.get("data_adiantamento") else None
    )
    db.session.add(adiantamento)
    db.session.commit()
    return jsonify(adiantamento.to_dict()), 201

# Rota para obter todos os adiantamentos de uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/adiantamentos", methods=["GET"])
def get_adiantamentos(prestacao_id):
    adiantamentos = Adiantamento.query.filter_by(prestacao_id=prestacao_id).all()
    return jsonify([adiantamento.to_dict() for adiantamento in adiantamentos])

# Rotas para Despesas de Diárias
# Rota para criar uma nova despesa de diária para uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/despesas-diarias", methods=["POST"])
def create_despesa_diaria(prestacao_id):
    data = request.get_json()
    despesa = DespesaDiaria(
        prestacao_id=prestacao_id,
        diarias_dentro_estado=data.get("diarias_dentro_estado", 0),
        refeicoes_dentro_estado=data.get("refeicoes_dentro_estado", 0),
        diarias_fora_estado=data.get("diarias_fora_estado", 0),
        refeicoes_fora_estado=data.get("refeicoes_fora_estado", 0)
    )
    db.session.add(despesa)
    db.session.commit()
    return jsonify(despesa.to_dict()), 201

# Rota para obter as despesas de diária de uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/despesas-diarias", methods=["GET"])
def get_despesa_diaria(prestacao_id):
    despesa = DespesaDiaria.query.filter_by(prestacao_id=prestacao_id).first()
    if despesa:
        return jsonify(despesa.to_dict())
    return jsonify({}), 404

# Rota para atualizar as despesas de diária de uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/despesas-diarias", methods=["PUT"])
def update_despesa_diaria(prestacao_id):
    data = request.get_json()
    despesa = DespesaDiaria.query.filter_by(prestacao_id=prestacao_id).first()
    
    if not despesa:
        # Se não existir, cria uma nova entrada
        despesa = DespesaDiaria(prestacao_id=prestacao_id)
        db.session.add(despesa)
    
    despesa.diarias_dentro_estado = data.get("diarias_dentro_estado", 0)
    despesa.refeicoes_dentro_estado = data.get("refeicoes_dentro_estado", 0)
    despesa.diarias_fora_estado = data.get("diarias_fora_estado", 0)
    despesa.refeicoes_fora_estado = data.get("refeicoes_fora_estado", 0)
    
    db.session.commit()
    return jsonify(despesa.to_dict())

# Rotas para Documentos de Comprovação
# Rota para criar um novo documento de comprovação para uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/documentos", methods=["POST"])
def create_documento(prestacao_id):
    data = request.get_json()
    documento = DocumentoComprovacao(
        prestacao_id=prestacao_id,
        tipo_documento=data["tipo_documento"],
        descricao=data["descricao"],
        data_documento=datetime.strptime(data["data_documento"], 
'%Y-%m-%d").date() if data.get("data_documento") else None,
        valor=data.get("valor")
    )
    db.session.add(documento)
    db.session.commit()
    return jsonify(documento.to_dict()), 201

# Rota para obter todos os documentos de comprovação de uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/documentos", methods=["GET"])
def get_documentos(prestacao_id):
    documentos = DocumentoComprovacao.query.filter_by(prestacao_id=prestacao_id).all()
    return jsonify([documento.to_dict() for documento in documentos])

# Rota para deletar um documento de comprovação específico pelo ID.
@prestacao_bp.route("/documentos/<int:documento_id>", methods=["DELETE"])
def delete_documento(documento_id):
    documento = DocumentoComprovacao.query.get_or_404(documento_id)
    db.session.delete(documento)

    db.session.commit()
    return '', 204

# Rotas para Despesas de Passagens
# Rota para criar uma nova despesa de passagem para uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/despesas-passagens", methods=["POST"])
def create_despesa_passagem(prestacao_id):
    data = request.get_json()
    despesa = DespesaPassagem(
        prestacao_id=prestacao_id,
        bpe=data["bpe"],
        valor=data["valor"],
        tipo_viagem=data["tipo_viagem"]
    )
    db.session.add(despesa)
    db.session.commit()
    return jsonify(despesa.to_dict()), 201

# Rota para obter todas as despesas de passagem de uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/despesas-passagens", methods=["GET"])
def get_despesas_passagens(prestacao_id):
    despesas = DespesaPassagem.query.filter_by(prestacao_id=prestacao_id).all()
    return jsonify([despesa.to_dict() for despesa in despesas])

# Rota para deletar uma despesa de passagem específica pelo ID.
@prestacao_bp.route("/despesas-passagens/<int:despesa_id>", methods=["DELETE"])
def delete_despesa_passagem(despesa_id):
    despesa = DespesaPassagem.query.get_or_404(despesa_id)
    db.session.delete(despesa)
    db.session.commit()
    return '', 204

# Rota para calcular totais
# Rota para calcular os totais de diárias e refeições para uma prestação de contas específica.
@prestacao_bp.route("/prestacoes/<int:prestacao_id>/calcular-totais", methods=["GET"])
def calcular_totais(prestacao_id):
    prestacao = PrestacaoContas.query.get_or_404(prestacao_id)
    servidor = prestacao.servidor
    
    # Buscar valores de diária do cargo do servidor.
    cargo = Cargo.query.filter_by(nome_cargo=servidor.cargo).first()
    if not cargo:
        return jsonify({"error": "Cargo não encontrado"}), 404
    
    # Buscar despesas de diárias associadas à prestação de contas.
    despesa_diaria = DespesaDiaria.query.filter_by(prestacao_id=prestacao_id).first()
    if not despesa_diaria:
        return jsonify({
            "total_diarias": 0,
            "total_refeicoes": 0,
            "total_geral": 0,
            "valor_adiantamento_diaria": 0,
            "diferenca": 0
        })
    
    # Calcular totais de diárias e refeições com base nos valores do cargo.
    total_diarias_dentro = despesa_diaria.diarias_dentro_estado * cargo.valor_diaria_dentro_estado
    total_diarias_fora = despesa_diaria.diarias_fora_estado * cargo.valor_diaria_fora_estado
    
    total_refeicoes_dentro = despesa_diaria.refeicoes_dentro_estado * (cargo.valor_diaria_dentro_estado * 0.15)
    total_refeicoes_fora = despesa_diaria.refeicoes_fora_estado * (cargo.valor_diaria_fora_estado * 0.15)
    
    total_diarias = total_diarias_dentro + total_diarias_fora
    total_refeicoes = total_refeicoes_dentro + total_refeicoes_fora
    total_geral = total_diarias + total_refeicoes
    
    # Buscar o adiantamento de diária associado à prestação de contas.
    adiantamento_diaria = Adiantamento.query.filter_by(prestacao_id=prestacao_id, tipo="diaria").first()
    valor_adiantamento_diaria = adiantamento_diaria.valor if adiantamento_diaria else 0
    
    # Calcular a diferença entre o total geral e o valor do adiantamento.
    diferenca = total_geral - valor_adiantamento_diaria
    
    # Retornar os totais calculados e detalhes.
    return jsonify({
        "total_diarias": total_diarias,
        "total_refeicoes": total_refeicoes,
        "total_geral": total_geral,
        "valor_adiantamento_diaria": valor_adiantamento_diaria,
        "diferenca": diferenca,
        "detalhes": {
            "diarias_dentro_estado": {
                "quantidade": despesa_diaria.diarias_dentro_estado,
                "valor_unitario": cargo.valor_diaria_dentro_estado,
                "total": total_diarias_dentro
            },
            "diarias_fora_estado": {
                "quantidade": despesa_diaria.diarias_fora_estado,
                "valor_unitario": cargo.valor_diaria_fora_estado,
                "total": total_diarias_fora
            },
            "refeicoes_dentro_estado": {
                "quantidade": despesa_diaria.refeicoes_dentro_estado,
                "valor_unitario": cargo.valor_diaria_dentro_estado * 0.15,
                "total": total_refeicoes_dentro
            },
            "refeicoes_fora_estado": {
                "quantidade": despesa_diaria.refeicoes_fora_estado,
                "valor_unitario": cargo.valor_diaria_fora_estado * 0.15,
                "total": total_refeicoes_fora
            }
        }
    })
