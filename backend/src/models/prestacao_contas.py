from src.extensions import db
from datetime import datetime

# Modelo para representar um servidor público.
class Servidor(db.Model):
    __tablename__ = 'servidores'
    
    # Identificador único do servidor.
    id = db.Column(db.Integer, primary_key=True)
    # Nome completo do servidor.
    nome = db.Column(db.String(200), nullable=False, index=True)
    # Cargo ocupado pelo servidor.
    cargo = db.Column(db.String(100), nullable=False, index=True)
    
    # Converte o objeto Servidor em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cargo': self.cargo
        }

# Modelo para representar um cargo e seus valores de diária associados.
class Cargo(db.Model):
    __tablename__ = 'cargos'
    
    # Identificador único do cargo.
    id = db.Column(db.Integer, primary_key=True)
    # Nome do cargo, deve ser único.
    nome_cargo = db.Column(db.String(100), nullable=False, unique=True)
    # Valor da diária para viagens dentro do estado.
    valor_diaria_dentro_estado = db.Column(db.Float, nullable=False)
    # Valor da diária para viagens fora do estado.
    valor_diaria_fora_estado = db.Column(db.Float, nullable=False)
    
    # Converte o objeto Cargo em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'nome_cargo': self.nome_cargo,
            'valor_diaria_dentro_estado': self.valor_diaria_dentro_estado,
            'valor_diaria_fora_estado': self.valor_diaria_fora_estado
        }

# Modelo para representar um presidente (ou autoridade similar).
class Presidente(db.Model):
    __tablename__ = 'presidentes'
    
    # Identificador único do presidente.
    id = db.Column(db.Integer, primary_key=True)
    # Nome completo do presidente.
    nome = db.Column(db.String(200), nullable=False)
    
    # Converte o objeto Presidente em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome
        }

# Modelo para gerenciar as prestações de contas.
class PrestacaoContas(db.Model):
    __tablename__ = 'prestacoes_contas'
    
    # Identificador único da prestação de contas.
    id = db.Column(db.Integer, primary_key=True)
    # ID do servidor associado à prestação de contas.
    servidor_id = db.Column(db.Integer, db.ForeignKey('servidores.id'), nullable=False, index=True)
    # ID do presidente associado à prestação de contas.
    presidente_id = db.Column(db.Integer, db.ForeignKey('presidentes.id'), nullable=False, index=True)
    # Data de criação da prestação de contas.
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relacionamento com o modelo Servidor.
    servidor = db.relationship('Servidor', backref='prestacoes')
    # Relacionamento com o modelo Presidente.
    presidente = db.relationship('Presidente', backref='prestacoes')
    
    # Converte o objeto PrestacaoContas em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'servidor_id': self.servidor_id,
            'presidente_id': self.presidente_id,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'servidor': self.servidor.to_dict() if self.servidor else None,
            'presidente': self.presidente.to_dict() if self.presidente else None
        }

# Modelo para registrar adiantamentos de diárias ou passagens.
class Adiantamento(db.Model):
    __tablename__ = 'adiantamentos'
    
    # Identificador único do adiantamento.
    id = db.Column(db.Integer, primary_key=True)
    # ID da prestação de contas à qual este adiantamento pertence.
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False, index=True)
    # Tipo de adiantamento: 'diaria' ou 'passagem'.
    tipo = db.Column(db.String(20), nullable=False, index=True)  # 'diaria' ou 'passagem'
    # Número do adiantamento.
    numero_adiantamento = db.Column(db.String(50), nullable=False)
    # Número do empenho associado ao adiantamento.
    numero_empenho = db.Column(db.String(50), nullable=False)
    # Valor total do adiantamento.
    valor = db.Column(db.Float, nullable=False)
    # Data em que o adiantamento foi realizado.
    data_adiantamento = db.Column(db.Date, nullable=False)
    
    # Relacionamento com o modelo PrestacaoContas.
    prestacao = db.relationship('PrestacaoContas', backref='adiantamentos')
    
    # Converte o objeto Adiantamento em um dicionário.
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

# Modelo para registrar as despesas de diárias.
class DespesaDiaria(db.Model):
    __tablename__ = 'despesas_diarias'
    
    # Identificador único da despesa de diária.
    id = db.Column(db.Integer, primary_key=True)
    # ID da prestação de contas à qual esta despesa pertence.
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False, index=True)
    # Número de diárias dentro do estado.
    diarias_dentro_estado = db.Column(db.Integer, default=0)
    # Número de refeições dentro do estado.
    refeicoes_dentro_estado = db.Column(db.Integer, default=0)
    # Número de diárias fora do estado.
    diarias_fora_estado = db.Column(db.Integer, default=0)
    # Número de refeições fora do estado.
    refeicoes_fora_estado = db.Column(db.Integer, default=0)
    
    # Relacionamento com o modelo PrestacaoContas.
    prestacao = db.relationship('PrestacaoContas', backref='despesas_diarias')
    
    # Converte o objeto DespesaDiaria em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'diarias_dentro_estado': self.diarias_dentro_estado,
            'refeicoes_dentro_estado': self.refeicoes_dentro_estado,
            'diarias_fora_estado': self.diarias_fora_estado,
            'refeicoes_fora_estado': self.refeicoes_fora_estado
        }

# Modelo para registrar documentos de comprovação de despesas.
class DocumentoComprovacao(db.Model):
    __tablename__ = 'documentos_comprovacao'
    
    # Identificador único do documento.
    id = db.Column(db.Integer, primary_key=True)
    # ID da prestação de contas à qual este documento pertence.
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False, index=True)
    # Tipo do documento (ex: 'nota_fiscal', 'nota_hotel').
    tipo_documento = db.Column(db.String(50), nullable=False, index=True)  # 'nota_fiscal', 'nota_hotel', etc.
    # Descrição detalhada do documento.
    descricao = db.Column(db.Text, nullable=False)
    # Data do documento.
    data_documento = db.Column(db.Date)
    # Valor associado ao documento.
    valor = db.Column(db.Float)
    
    # Relacionamento com o modelo PrestacaoContas.
    prestacao = db.relationship('PrestacaoContas', backref='documentos')
    
    # Converte o objeto DocumentoComprovacao em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'tipo_documento': self.tipo_documento,
            'descricao': self.descricao,
            'data_documento': self.data_documento.isoformat() if self.data_documento else None,
            'valor': self.valor
        }

# Modelo para registrar despesas de passagens.
class DespesaPassagem(db.Model):
    __tablename__ = 'despesas_passagens'
    
    # Identificador único da despesa de passagem.
    id = db.Column(db.Integer, primary_key=True)
    # ID da prestação de contas à qual esta despesa pertence.
    prestacao_id = db.Column(db.Integer, db.ForeignKey('prestacoes_contas.id'), nullable=False, index=True)
    # Bilhete de Passagem Eletrônico (BPE).
    bpe = db.Column(db.String(50), nullable=False)
    # Valor da passagem.
    valor = db.Column(db.Float, nullable=False)
    # Tipo de viagem: 'ida' ou 'volta'.
    tipo_viagem = db.Column(db.String(10), nullable=False)  # 'ida' ou 'volta'
    
    # Relacionamento com o modelo PrestacaoContas.
    prestacao = db.relationship('PrestacaoContas', backref='despesas_passagens')
    
    # Converte o objeto DespesaPassagem em um dicionário.
    def to_dict(self):
        return {
            'id': self.id,
            'prestacao_id': self.prestacao_id,
            'bpe': self.bpe,
            'valor': self.valor,
            'tipo_viagem': self.tipo_viagem
        }
