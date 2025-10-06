from src.extensions import db
from datetime import datetime

class Servidor(db.Model):
    __tablename__ = 'servidores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cargo': self.cargo
        }

class Cargo(db.Model):
    __tablename__ = 'cargos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome_cargo = db.Column(db.String(100), nullable=False, unique=True)
    valor_diaria_dentro_estado = db.Column(db.Float, nullable=False)
    valor_diaria_fora_estado = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome_cargo': self.nome_cargo,
            'valor_diaria_dentro_estado': self.valor_diaria_dentro_estado,
            'valor_diaria_fora_estado': self.valor_diaria_fora_estado
        }

class Presidente(db.Model):
    __tablename__ = 'presidentes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome
        }

class PrestacaoContas(db.Model):
    __tablename__ = 'prestacoes_contas'
    
    id = db.Column(db.Integer, primary_key=True)
    servidor_id = db.Column(db.Integer, db.ForeignKey('servidores.id'), nullable=False)
    presidente_id = db.Column(db.Integer, db.ForeignKey('presidentes.id'), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    servidor = db.relationship('Servidor', backref='prestacoes')
    presidente = db.relationship('Presidente', backref='prestacoes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'servidor_id': self.servidor_id,
            'presidente_id': self.presidente_id,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'servidor': self.servidor.to_dict() if self.servidor else None,
            'presidente': self.presidente.to_dict() if self.presidente else None
        }

class Adiantamento(db.Model):
    __tablename__ = 'adiantamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'diaria' ou 'passagem'
    numero_adiantamento = db.Column(db.String(50), nullable=False)
    numero_empenho = db.Column(db.String(50), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data_adiantamento = db.Column(db.Date, nullable=False)
    
    # Relacionamento
    prestacao = db.relationship('PrestacaoContas', backref='adiantamentos')
    
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'tipo': self.tipo,
            'numero_adiantamento': self.numero_adiantamento,
            'numero_empenho': self.numero_empenho,
            'valor': self.valor,
            'data_adiantamento': self.data_adiantamento.isoformat() if self.data_adiantamento else None
        }

class DespesaDiaria(db.Model):
    __tablename__ = 'despesas_diarias'
    
    id = db.Column(db.Integer, primary_key=True)
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False)
    diarias_dentro_estado = db.Column(db.Integer, default=0)
    refeicoes_dentro_estado = db.Column(db.Integer, default=0)
    diarias_fora_estado = db.Column(db.Integer, default=0)
    refeicoes_fora_estado = db.Column(db.Integer, default=0)
    
    # Relacionamento
    prestacao = db.relationship('PrestacaoContas', backref='despesas_diarias')
    
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'diarias_dentro_estado': self.diarias_dentro_estado,
            'refeicoes_dentro_estado': self.refeicoes_dentro_estado,
            'diarias_fora_estado': self.diarias_fora_estado,
            'refeicoes_fora_estado': self.refeicoes_fora_estado
        }

class DocumentoComprovacao(db.Model):
    __tablename__ = 'documentos_comprovacao'
    
    id = db.Column(db.Integer, primary_key=True)
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)  # 'nota_fiscal', 'nota_hotel', etc.
    descricao = db.Column(db.Text, nullable=False)
    data_documento = db.Column(db.Date)
    valor = db.Column(db.Float)
    
    # Relacionamento
    prestacao = db.relationship('PrestacaoContas', backref='documentos')
    
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'tipo_documento': self.tipo_documento,
            'descricao': self.descricao,
            'data_documento': self.data_documento.isoformat() if self.data_documento else None,
            'valor': self.valor
        }

class DespesaPassagem(db.Model):
    __tablename__ = 'despesas_passagens'
    
    id = db.Column(db.Integer, primary_key=True)
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False)
    bpe = db.Column(db.String(50), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    tipo_viagem = db.Column(db.String(10), nullable=False)  # 'ida' ou 'volta'
    
    # Relacionamento
    prestacao = db.relationship('PrestacaoContas', backref='despesas_passagens')
    
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'bpe': self.bpe,
            'valor': self.valor,
            'tipo_viagem': self.tipo_viagem
        }
