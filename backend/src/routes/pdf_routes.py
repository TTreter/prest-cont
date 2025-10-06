from flask import Blueprint, request, jsonify, send_file
from src.extensions import db
from src.models.prestacao_contas import (
    PrestacaoContas, Adiantamento, DespesaDiaria, 
    DocumentoComprovacao, DespesaPassagem, Cargo, Servidor, Presidente
)

from src.services.pdf_generator import PDFGenerator
from datetime import datetime

pdf_bp = Blueprint("pdf", __name__)

@pdf_bp.route("/prestacoes/<int:prestacao_id>/pdf/<string:tipo>", methods=["GET"])
def gerar_pdf(prestacao_id, tipo):
    try:
        # Buscar dados da prestação, incluindo servidor e presidente
        prestacao = PrestacaoContas.query.options(db.joinedload(PrestacaoContas.servidor), db.joinedload(PrestacaoContas.presidente)).get_or_404(prestacao_id)
        
        # Buscar adiantamentos
        adiantamentos = Adiantamento.query.filter_by(prestacao_id=prestacao_id).all()
        adiantamento_diaria = next((a for a in adiantamentos if a.tipo == "diaria"), None)
        adiantamento_passagem = next((a for a in adiantamentos if a.tipo == "passagem"), None)
        
        # Buscar despesas de diárias
        despesa_diaria = DespesaDiaria.query.filter_by(prestacao_id=prestacao_id).first()
        
        # Buscar documentos
        documentos = DocumentoComprovacao.query.filter_by(prestacao_id=prestacao_id).all()
        
        # Buscar passagens
        passagens = DespesaPassagem.query.filter_by(prestacao_id=prestacao_id).all()
        
        # Buscar cargo para calcular valores
        cargo = None
        if prestacao.servidor and prestacao.servidor.cargo:
            cargo = Cargo.query.filter_by(nome_cargo=prestacao.servidor.cargo).first()
        
        # Calcular totais
        totais = calcular_totais_prestacao(prestacao_id, cargo, despesa_diaria, adiantamento_diaria)
        
        # Preparar dados para o PDF, tratando casos de None
        prestacao_data = {
            "servidor": prestacao.servidor.to_dict() if prestacao.servidor else {},
            "presidente": prestacao.presidente.to_dict() if prestacao.presidente else {},
            "adiantamento_diaria": adiantamento_diaria.to_dict() if adiantamento_diaria else None,
            "adiantamento_passagem": adiantamento_passagem.to_dict() if adiantamento_passagem else None,
            "despesa_diaria": despesa_diaria.to_dict() if despesa_diaria else {},
            "documentos": [doc.to_dict() for doc in documentos],
            "passagens": [passagem.to_dict() for passagem in passagens],
            "totais": totais,
            "cargo": cargo.to_dict() if cargo else None
        }
        
        # Gerar PDF
        pdf_generator = PDFGenerator()
        
        filename_base = prestacao.servidor.nome.replace(" ", "_") if prestacao.servidor else "desconhecido"

        if tipo == "diaria":
            pdf_buffer = pdf_generator.gerar_pdf_diaria(prestacao_data)
            filename = f"prestacao_contas_diaria_{filename_base}.pdf"
        elif tipo == "passagem":
            pdf_buffer = pdf_generator.gerar_pdf_passagem(prestacao_data)
            filename = f"prestacao_contas_passagem_{filename_base}.pdf"
        elif tipo == "parecer":
            pdf_buffer = pdf_generator.gerar_pdf_parecer(prestacao_data)
            filename = f"parecer_tecnico_{filename_base}.pdf"
        else:
            return jsonify({"error": "Tipo de PDF inválido"}), 400
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf"
        )
        
    except Exception as e:
        print(f"Erro ao gerar PDF: {str(e)}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

def calcular_totais_prestacao(prestacao_id, cargo, despesa_diaria, adiantamento_diaria):
    # Se cargo ou despesa_diaria não existirem, retorna totais zerados
    if not cargo or not despesa_diaria:
        return {
            "total_diarias": 0,
            "total_refeicoes": 0,
            "total_geral": 0,
            "valor_adiantamento_diaria": 0,
            "diferenca": 0,
            "detalhes": {}
        }
    
    # Calcular totais
    total_diarias_dentro = despesa_diaria.diarias_dentro_estado * cargo.valor_diaria_dentro_estado
    total_diarias_fora = despesa_diaria.diarias_fora_estado * cargo.valor_diaria_fora_estado
    
    total_refeicoes_dentro = despesa_diaria.refeicoes_dentro_estado * (cargo.valor_diaria_dentro_estado * 0.15)
    total_refeicoes_fora = despesa_diaria.refeicoes_fora_estado * (cargo.valor_diaria_fora_estado * 0.15)
    
    total_diarias = total_diarias_dentro + total_diarias_fora
    total_refeicoes = total_refeicoes_dentro + total_refeicoes_fora
    total_geral = total_diarias + total_refeicoes
    
    valor_adiantamento_diaria = adiantamento_diaria.valor if adiantamento_diaria else 0
    diferenca = total_geral - valor_adiantamento_diaria
    
    return {
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
    }

