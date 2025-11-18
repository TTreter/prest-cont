from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime
import io

class PDFGenerator:
    """Classe responsável por gerar documentos PDF para prestação de contas."""
    
    def __init__(self):
        """Inicializa o gerador de PDF e configura os estilos personalizados."""
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Configura estilos de parágrafo personalizados para o documento PDF."""
        # Estilo para título principal
        self.styles.add(ParagraphStyle(
            name='TituloPrincipal',
            parent=self.styles['Title'],
            fontSize=16,
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1a1a1a')
        ))
        
        # Estilo para subtítulos
        self.styles.add(ParagraphStyle(
            name='Subtitulo',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=12,
            spaceBefore=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#2c3e50')
        ))
        
        # Estilo para texto normal
        self.styles.add(ParagraphStyle(
            name='TextoNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            spaceBefore=4,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=14,
            textColor=colors.HexColor('#2c3e50')
        ))
        
        # Estilo para assinatura
        self.styles.add(ParagraphStyle(
            name='Assinatura',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            alignment=TA_CENTER,
            fontName='Helvetica',
            textColor=colors.HexColor('#2c3e50')
        ))
        
        # Estilo para informações em negrito
        self.styles.add(ParagraphStyle(
            name='TextoDestaque',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#2c3e50')
        ))

    def formatar_valor(self, valor):
        """Formata valor numérico para padrão brasileiro (R$ X.XXX,XX)."""
        if valor is None:
            return "R$ 0,00"
        try:
            valor_float = float(valor)
            return f"R$ {valor_float:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        except (ValueError, TypeError):
            return "R$ 0,00"
    
    def formatar_data(self, data_str):
        """Formata data do formato ISO para formato brasileiro."""
        if not data_str:
            return ""
        try:
            if isinstance(data_str, str):
                data_obj = datetime.strptime(data_str, '%Y-%m-%d')
            else:
                data_obj = data_str
            return data_obj.strftime('%d/%m/%Y')
        except (ValueError, AttributeError):
            return str(data_str)

    def safe_get(self, data_dict, key, default=""):
        """Obtém valor do dicionário de forma segura."""
        if data_dict is None:
            return default
        return data_dict.get(key, default)

    def gerar_pdf_diaria(self, prestacao_data):
        """Gera um PDF de prestação de contas de diária com tratamento de erros melhorado."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=2*cm, 
            leftMargin=2*cm, 
            topMargin=2*cm, 
            bottomMargin=2*cm
        )
        
        story = []
        
        try:
            # Validar dados essenciais
            servidor = prestacao_data.get("servidor", {})
            adiantamento_diaria = prestacao_data.get("adiantamento_diaria")
            totais = prestacao_data.get("totais", {})
            detalhes = totais.get("detalhes", {})
            
            # Adiciona o título principal do documento
            story.append(Paragraph(
                "PRESTAÇÃO DE CONTAS DE DIÁRIA", 
                self.styles["TituloPrincipal"]
            ))
            story.append(Spacer(1, 0.5*cm))
            
            # Seção de informações do servidor
            if adiantamento_diaria:
                servidor_info = f"""
                O servidor <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>, 
                cargo <b>{self.safe_get(servidor, 'cargo', 'Não informado')}</b>, 
                em atendimento às exigências legais, vem proceder a Prestação de Contas da DIÁRIA 
                sob processo de Adiantamento Nº <b>{self.safe_get(adiantamento_diaria, 'numero_adiantamento', 'N/A')}</b>, 
                recebido em <b>{self.formatar_data(self.safe_get(adiantamento_diaria, 'data_adiantamento'))}</b>, 
                conforme Empenho número <b>{self.safe_get(adiantamento_diaria, 'numero_empenho', 'N/A')}</b>, 
                no valor de <b>{self.formatar_valor(self.safe_get(adiantamento_diaria, 'valor', 0))}</b>, 
                para o que junta a documentação das despesas efetuadas, conforme discriminação abaixo:
                """
            else:
                servidor_info = f"""
                O servidor <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b> 
                procede a Prestação de Contas de Diária. Não há informações de adiantamento disponíveis.
                """
            
            story.append(Paragraph(servidor_info, self.styles["TextoNormal"]))
            story.append(Spacer(1, 0.5*cm))
            
            # Tabela detalhando os valores das diárias e refeições
            story.append(Paragraph("DISCRIMINAÇÃO DAS DESPESAS", self.styles["Subtitulo"]))
            story.append(Spacer(1, 0.3*cm))
            
            # Obter valores com segurança
            refeicoes_dentro = detalhes.get("refeicoes_dentro_estado", {})
            refeicoes_fora = detalhes.get("refeicoes_fora_estado", {})
            diarias_dentro = detalhes.get("diarias_dentro_estado", {})
            diarias_fora = detalhes.get("diarias_fora_estado", {})
            
            tabela_data = [
                ["Qtd", "Descrição", "Tipo", "Valor Unit.", "Total"]
            ]
            
            # Adicionar diárias dentro do estado
            if diarias_dentro.get("quantidade", 0) > 0:
                tabela_data.append([
                    str(diarias_dentro.get("quantidade", 0)),
                    "Diária com pernoite",
                    "Dentro do Estado",
                    self.formatar_valor(diarias_dentro.get("valor_unitario", 0)),
                    self.formatar_valor(diarias_dentro.get("total", 0))
                ])
            
            # Adicionar diárias fora do estado
            if diarias_fora.get("quantidade", 0) > 0:
                tabela_data.append([
                    str(diarias_fora.get("quantidade", 0)),
                    "Diária com pernoite",
                    "Fora do Estado",
                    self.formatar_valor(diarias_fora.get("valor_unitario", 0)),
                    self.formatar_valor(diarias_fora.get("total", 0))
                ])
            
            # Adicionar refeições dentro do estado
            if refeicoes_dentro.get("quantidade", 0) > 0:
                tabela_data.append([
                    str(refeicoes_dentro.get("quantidade", 0)),
                    "Refeição",
                    "Dentro do Estado",
                    self.formatar_valor(refeicoes_dentro.get("valor_unitario", 0)),
                    self.formatar_valor(refeicoes_dentro.get("total", 0))
                ])
            
            # Adicionar refeições fora do estado
            if refeicoes_fora.get("quantidade", 0) > 0:
                tabela_data.append([
                    str(refeicoes_fora.get("quantidade", 0)),
                    "Refeição",
                    "Fora do Estado",
                    self.formatar_valor(refeicoes_fora.get("valor_unitario", 0)),
                    self.formatar_valor(refeicoes_fora.get("total", 0))
                ])
            
            # Adicionar linha de total
            tabela_data.append([
                "", "", "", "TOTAL GERAL:",
                self.formatar_valor(totais.get("total_geral", 0))
            ])
            
            tabela = Table(tabela_data, colWidths=[1.5*cm, 5*cm, 3.5*cm, 2.5*cm, 2.5*cm])
            tabela.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.HexColor('#ecf0f1')),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#bdc3c7')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            
            story.append(tabela)
            story.append(Spacer(1, 0.5*cm))
            
            # Informação de diferença (se houver)
            diferenca = totais.get("diferenca", 0)
            valor_adiantamento = totais.get("valor_adiantamento_diaria", 0)
            
            if diferenca != 0:
                story.append(Paragraph("RESUMO FINANCEIRO", self.styles["Subtitulo"]))
                story.append(Spacer(1, 0.3*cm))
                
                resumo_data = [
                    ["Descrição", "Valor"],
                    ["Valor do Adiantamento", self.formatar_valor(valor_adiantamento)],
                    ["Total de Despesas", self.formatar_valor(totais.get("total_geral", 0))],
                    ["Diferença", self.formatar_valor(diferenca)]
                ]
                
                resumo_table = Table(resumo_data, colWidths=[10*cm, 5*cm])
                resumo_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                
                story.append(resumo_table)
                story.append(Spacer(1, 0.3*cm))
                
                # Adicionar nota sobre diferença
                if diferenca > 0:
                    nota = f"<b>Nota:</b> Valor a receber: {self.formatar_valor(diferenca)}"
                else:
                    nota = f"<b>Nota:</b> Valor a devolver: {self.formatar_valor(abs(diferenca))}"
                story.append(Paragraph(nota, self.styles["TextoNormal"]))
                story.append(Spacer(1, 0.5*cm))
            
            # Tabela de documentos apresentados
            story.append(Paragraph("DOCUMENTOS COMPROBATÓRIOS", self.styles["Subtitulo"]))
            story.append(Spacer(1, 0.3*cm))
            
            doc_data = [['Data', 'Descrição do Documento', 'Valor', 'Referência']]
            
            documentos = prestacao_data.get('documentos', [])
            if documentos:
                for doc in documentos:
                    doc_data.append([
                        self.formatar_data(self.safe_get(doc, 'data_documento')),
                        self.safe_get(doc, 'descricao', 'Sem descrição')[:50],
                        self.formatar_valor(self.safe_get(doc, 'valor')),
                        'Anexo'
                    ])
            else:
                doc_data.append(['', 'Nenhum documento anexado', '', ''])
            
            # Adicionar linhas vazias para completar
            while len(doc_data) < 6:
                doc_data.append(['', '', '', ''])
            
            tabela_docs = Table(doc_data, colWidths=[2*cm, 7*cm, 2.5*cm, 3.5*cm])
            tabela_docs.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            story.append(tabela_docs)
            story.append(Spacer(1, 1*cm))
            
            # Local e data
            story.append(Paragraph(
                f"Município Exemplo, {datetime.now().strftime('%d de %B de %Y')}", 
                self.styles['Assinatura']
            ))
            story.append(Spacer(1, 1*cm))
            
            # Assinatura do responsável
            story.append(Paragraph("_" * 60, self.styles['Assinatura']))
            story.append(Paragraph(
                f"<b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph(
                f"{self.safe_get(servidor, 'cargo', 'Servidor')}", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph(
                "Responsável pelo Adiantamento", 
                self.styles['Assinatura']
            ))
            
            # Construir o documento
            doc.build(story)
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            # Em caso de erro, gerar um PDF com mensagem de erro
            print(f"Erro ao gerar PDF de diária: {str(e)}")
            story = []
            story.append(Paragraph("ERRO AO GERAR PRESTAÇÃO DE CONTAS", self.styles["TituloPrincipal"]))
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"Ocorreu um erro ao processar os dados: {str(e)}", self.styles["TextoNormal"]))
            story.append(Paragraph("Por favor, verifique se todos os dados foram preenchidos corretamente.", self.styles["TextoNormal"]))
            
            doc.build(story)
            buffer.seek(0)
            return buffer

    def gerar_pdf_passagem(self, prestacao_data):
        """Gera um PDF de prestação de contas de passagem com tratamento de erros."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=2*cm, 
            leftMargin=2*cm, 
            topMargin=2*cm, 
            bottomMargin=2*cm
        )
        
        story = []
        
        try:
            servidor = prestacao_data.get("servidor", {})
            adiantamento_passagem = prestacao_data.get("adiantamento_passagem")
            passagens = prestacao_data.get('passagens', [])
            
            # Título principal
            story.append(Paragraph(
                "PRESTAÇÃO DE CONTAS DE PASSAGEM", 
                self.styles["TituloPrincipal"]
            ))
            story.append(Spacer(1, 0.5*cm))
            
            # Verificar se há adiantamento de passagem
            if not adiantamento_passagem:
                story.append(Paragraph(
                    "Não há adiantamento de passagem registrado para esta prestação de contas.", 
                    self.styles["TextoNormal"]
                ))
                story.append(Spacer(1, 1*cm))
                story.append(Paragraph(
                    f"Servidor: <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>", 
                    self.styles["TextoNormal"]
                ))
            else:
                # Informações do servidor e adiantamento
                servidor_info = f"""
                O servidor <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>, 
                cargo <b>{self.safe_get(servidor, 'cargo', 'Não informado')}</b>, 
                em atendimento às exigências legais, vem proceder a Prestação de Contas do 
                Adiantamento número <b>{self.safe_get(adiantamento_passagem, 'numero_adiantamento', 'N/A')}</b>, 
                recebido em <b>{self.formatar_data(self.safe_get(adiantamento_passagem, 'data_adiantamento'))}</b>, 
                conforme Empenho nº <b>{self.safe_get(adiantamento_passagem, 'numero_empenho', 'N/A')}</b>, 
                no valor de <b>{self.formatar_valor(self.safe_get(adiantamento_passagem, 'valor', 0))}</b>, 
                para o que junta a documentação comprobatória das despesas efetuadas conforme discriminação abaixo:
                """
                story.append(Paragraph(servidor_info, self.styles['TextoNormal']))
                story.append(Spacer(1, 0.5*cm))
                
                # Tabela de movimentação financeira
                story.append(Paragraph("DEMONSTRATIVO FINANCEIRO", self.styles["Subtitulo"]))
                story.append(Spacer(1, 0.3*cm))
                
                tabela_data = [
                    ["Data", "Descrição", "Débito", "Crédito"]
                ]
                
                # Adicionar adiantamento recebido
                tabela_data.append([
                    self.formatar_data(self.safe_get(adiantamento_passagem, "data_adiantamento")),
                    f"Adiantamento - Empenho nº {self.safe_get(adiantamento_passagem, 'numero_empenho', 'N/A')}",
                    self.formatar_valor(self.safe_get(adiantamento_passagem, "valor", 0)),
                    ""
                ])
                
                # Adicionar passagens
                total_passagens = 0
                if passagens:
                    for passagem in passagens:
                        valor_passagem = self.safe_get(passagem, 'valor', 0)
                        try:
                            total_passagens += float(valor_passagem)
                        except (ValueError, TypeError):
                            pass
                        
                        tipo_viagem = self.safe_get(passagem, 'tipo_viagem', 'N/A').capitalize()
                        tabela_data.append([
                            "",
                            f"Passagem {tipo_viagem} - BPE: {self.safe_get(passagem, 'bpe', 'N/A')}",
                            "",
                            self.formatar_valor(valor_passagem)
                        ])
                else:
                    tabela_data.append(["", "Nenhuma passagem registrada", "", ""])
                
                # Calcular diferença
                try:
                    valor_adiantamento = float(self.safe_get(adiantamento_passagem, 'valor', 0))
                    valor_a_devolver = valor_adiantamento - total_passagens
                except (ValueError, TypeError):
                    valor_adiantamento = 0
                    valor_a_devolver = 0
                
                # Adicionar linha de total
                tabela_data.append([
                    "", 
                    "<b>TOTAL</b>", 
                    self.formatar_valor(valor_adiantamento),
                    self.formatar_valor(total_passagens)
                ])
                
                # Adicionar linha de saldo
                if valor_a_devolver > 0:
                    tabela_data.append([
                        "",
                        "<b>Saldo a Devolver</b>",
                        "",
                        self.formatar_valor(valor_a_devolver)
                    ])
                elif valor_a_devolver < 0:
                    tabela_data.append([
                        "",
                        "<b>Valor a Receber</b>",
                        "",
                        self.formatar_valor(abs(valor_a_devolver))
                    ])
                else:
                    tabela_data.append([
                        "",
                        "<b>Saldo: QUITADO</b>",
                        "",
                        ""
                    ])
                
                tabela = Table(tabela_data, colWidths=[2.5*cm, 7*cm, 3*cm, 3*cm])
                tabela.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BACKGROUND', (0, 1), (-1, -3), colors.HexColor('#ecf0f1')),
                    ('BACKGROUND', (0, -2), (-1, -1), colors.HexColor('#bdc3c7')),
                    ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                
                story.append(tabela)
            
            story.append(Spacer(1, 1.5*cm))
            
            # Local e data
            story.append(Paragraph(
                f"Município Exemplo, {datetime.now().strftime('%d de %B de %Y')}", 
                self.styles['Assinatura']
            ))
            story.append(Spacer(1, 1.5*cm))
            
            # Assinatura do responsável
            story.append(Paragraph("_" * 60, self.styles['Assinatura']))
            story.append(Paragraph(
                f"<b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph(
                f"{self.safe_get(servidor, 'cargo', 'Servidor')}", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph(
                "Responsável pelo Adiantamento", 
                self.styles['Assinatura']
            ))
            
            doc.build(story)
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            print(f"Erro ao gerar PDF de passagem: {str(e)}")
            story = []
            story.append(Paragraph("ERRO AO GERAR PRESTAÇÃO DE CONTAS", self.styles["TituloPrincipal"]))
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"Ocorreu um erro: {str(e)}", self.styles["TextoNormal"]))
            
            doc.build(story)
            buffer.seek(0)
            return buffer

    def gerar_pdf_parecer(self, prestacao_data):
        """Gera um PDF de parecer técnico para prestação de contas."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=2*cm, 
            leftMargin=2*cm, 
            topMargin=2*cm, 
            bottomMargin=2*cm
        )
        
        story = []
        
        try:
            servidor = prestacao_data.get("servidor", {})
            presidente = prestacao_data.get("presidente", {})
            adiantamento = prestacao_data.get("adiantamento_diaria", {})
            
            # Cabeçalho institucional
            story.append(Paragraph(
                "CÂMARA MUNICIPAL DE MUNICÍPIO EXEMPLO", 
                self.styles["TituloPrincipal"]
            ))
            story.append(Paragraph(
                "Secretaria de Administração e Finanças", 
                self.styles["Subtitulo"]
            ))
            story.append(Spacer(1, 1*cm))
            
            # Título do parecer
            story.append(Paragraph(
                "PARECER TÉCNICO CONTÁBIL", 
                self.styles['TituloPrincipal']
            ))
            story.append(Spacer(1, 0.5*cm))
            
            # Informações do processo
            processo_info = f"""
            <b>Processo:</b> Prestação de Contas de Adiantamento<br/>
            <b>Servidor:</b> {self.safe_get(servidor, 'nome', 'Não informado')}<br/>
            <b>Cargo:</b> {self.safe_get(servidor, 'cargo', 'Não informado')}<br/>
            <b>Adiantamento Nº:</b> {self.safe_get(adiantamento, 'numero_adiantamento', 'N/A')}<br/>
            <b>Data do Adiantamento:</b> {self.formatar_data(self.safe_get(adiantamento, 'data_adiantamento'))}<br/>
            <b>Empenho Nº:</b> {self.safe_get(adiantamento, 'numero_empenho', 'N/A')}<br/>
            <b>Valor:</b> {self.formatar_valor(self.safe_get(adiantamento, 'valor', 0))}
            """
            story.append(Paragraph(processo_info, self.styles["TextoNormal"]))
            story.append(Spacer(1, 0.8*cm))
            
            # Parecer da contadoria
            story.append(Paragraph("PARECER", self.styles['Subtitulo']))
            story.append(Spacer(1, 0.3*cm))
            
            parecer_texto = f"""
            A Contadoria, procedendo ao exame técnico da prestação de contas do(a) servidor(a) 
            <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>, relativo ao Adiantamento 
            Nº <b>{self.safe_get(adiantamento, 'numero_adiantamento', 'N/A')}</b>, recebido em 
            <b>{self.formatar_data(self.safe_get(adiantamento, 'data_adiantamento'))}</b>, 
            no valor de <b>{self.formatar_valor(self.safe_get(adiantamento, 'valor', 0))}</b>, 
            verificou que a documentação apresentada está em conformidade com as normas vigentes, 
            apresentando regularidade quanto aos aspectos aritméticos, legais e formais das despesas efetuadas.
            <br/><br/>
            A documentação comprobatória encontra-se devidamente anexada e atende às exigências 
            previstas na legislação aplicável.
            <br/><br/>
            Diante do exposto, esta Contadoria manifesta-se favoravelmente à aprovação da presente 
            prestação de contas, sugerindo o seu encaminhamento à autoridade competente para julgamento.
            """
            story.append(Paragraph(parecer_texto, self.styles["TextoNormal"]))
            story.append(Spacer(1, 1*cm))
            
            # Conclusão
            story.append(Paragraph(
                "À consideração superior.", 
                self.styles['TextoNormal']
            ))
            story.append(Spacer(1, 1.5*cm))
            
            # Assinatura da contadora
            story.append(Paragraph(
                f"Contadoria Geral do Município, em {datetime.now().strftime('%d de %B de %Y')}", 
                self.styles['Assinatura']
            ))
            story.append(Spacer(1, 1*cm))
            
            story.append(Paragraph("_" * 60, self.styles['Assinatura']))
            story.append(Paragraph(
                "<b>Etiane Acosta Alves</b>", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph("Contadora", self.styles['Assinatura']))
            story.append(Paragraph("CRC/XX XXXXX/X", self.styles['Assinatura']))
            
            # Quebra de página para julgamento
            story.append(PageBreak())
            
            # Termo de julgamento
            story.append(Paragraph(
                "TERMO DE JULGAMENTO", 
                self.styles['TituloPrincipal']
            ))
            story.append(Spacer(1, 1*cm))
            
            julgamento_texto = f"""
            Tendo em vista o Parecer Técnico da Contadoria, que atesta a regularidade da documentação 
            apresentada, <b>JULGO BOAS</b> as contas do(a) servidor(a) 
            <b>{self.safe_get(servidor, 'nome', 'Não informado')}</b>, relativo ao Adiantamento 
            em epígrafe.
            <br/><br/>
            Determino o encaminhamento à Contadoria para a baixa da responsabilidade e demais 
            providências cabíveis.
            """
            story.append(Paragraph(julgamento_texto, self.styles['TextoNormal']))
            story.append(Spacer(1, 2*cm))
            
            # Assinatura do presidente
            story.append(Paragraph(
                f"Câmara de Vereadores, em {datetime.now().strftime('%d de %B de %Y')}", 
                self.styles['Assinatura']
            ))
            story.append(Spacer(1, 1.5*cm))
            
            story.append(Paragraph("_" * 60, self.styles['Assinatura']))
            story.append(Paragraph(
                f"<b>{self.safe_get(presidente, 'nome', 'Não informado')}</b>", 
                self.styles['Assinatura']
            ))
            story.append(Paragraph(
                "Presidente da Câmara de Vereadores", 
                self.styles['Assinatura']
            ))
            
            # Se for prestação do próprio presidente, adicionar assinatura de membro da mesa
            nome_servidor = str(self.safe_get(servidor, 'nome', '')).lower().strip()
            nome_presidente = str(self.safe_get(presidente, 'nome', '')).lower().strip()
            
            if nome_servidor and nome_presidente and nome_servidor == nome_presidente:
                story.append(Spacer(1, 2*cm))
                story.append(Paragraph(
                    "<i>* Conforme previsto em lei, por tratar-se de prestação de contas do " +
                    "próprio Presidente, requer-se visto de Membro da Mesa Diretora:</i>",
                    self.styles['TextoNormal']
                ))
                story.append(Spacer(1, 1.5*cm))
                story.append(Paragraph("_" * 60, self.styles['Assinatura']))
                story.append(Paragraph(
                    "Membro da Mesa Diretora", 
                    self.styles['Assinatura']
                ))
                story.append(Paragraph("(Visto)", self.styles['Assinatura']))
            
            doc.build(story)
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            print(f"Erro ao gerar PDF de parecer: {str(e)}")
            story = []
            story.append(Paragraph("ERRO AO GERAR PARECER", self.styles["TituloPrincipal"]))
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"Ocorreu um erro: {str(e)}", self.styles["TextoNormal"]))
            
            doc.build(story)
            buffer.seek(0)
            return buffer
