from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
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
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Estilo para subtítulos
        self.styles.add(ParagraphStyle(
            name='Subtitulo',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Estilo para texto normal
        self.styles.add(ParagraphStyle(
            name='TextoNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_LEFT,
            fontName='Helvetica'
        ))
        
        # Estilo para assinatura
        self.styles.add(ParagraphStyle(
            name='Assinatura',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

    def gerar_pdf_diaria(self, prestacao_data):
        """Gera um PDF de prestação de contas de diária."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, 
                              topMargin=2*cm, bottomMargin=2*cm)
        
        story = []
        
        # Adiciona o título principal do documento.
        story.append(Paragraph("PRESTAÇÃO DE CONTAS DE DIÁRIA", self.styles["TituloPrincipal"]))
        story.append(Spacer(1, 20))
        
        # Seção de informações do servidor, detalhando o propósito da prestação de contas.
        servidor_info = f"""
        O servidor <b>{prestacao_data["servidor"]["nome"]}</b> em atendimento às 
        exigências legais, vem proceder a Prestação de Contas da DIÁRIA sob processo de Adiantamento Nº 
        <b>{prestacao_data["adiantamento_diaria"]["numero_adiantamento"]}</b> recebidos em 
        <b>{prestacao_data["adiantamento_diaria"]["data_adiantamento"]}</b>, conforme Empenho número 
        <b>{prestacao_data["adiantamento_diaria"]["numero_empenho"]}</b>, para o que junta a 
        documentação das despesas efetuadas, e recolhimento conforme discriminação abaixo:
        """
        story.append(Paragraph(servidor_info, self.styles["TextoNormal"]))
        story.append(Spacer(1, 20))
        
        # Tabela detalhando os valores das diárias e refeições.
        tabela_data = [
            ["Tipo", "Seleção Valor", "", "R$", "Valor"],
            ["2", "1 Refeição", "Diária Normal", "R$", f"{prestacao_data["totais"]["detalhes"]["refeicoes_dentro_estado"]["valor_unitario"]:.2f}".replace(".", ",")],
            ["0", "", "Diária DF", "R$", "-"],
            ["0", "2 Refeições", "Diária Normal", "R$", "-"],
            ["0", "", "Diária DF", "R$", "-"],
            ["0", "3 Refeições", "Diária Normal", "R$", "-"],
            ["0", "", "Diária DF", "R$", "-"],
            ["3", "Fora Sede c/pernoite", "Diária Normal", "R$", f"{prestacao_data["totais"]["detalhes"]["diarias_dentro_estado"]["valor_unitario"]:.2f}".replace(".", ",")],
            ["0", "", "Diária DF", "R$", "-"],
            ["", "", "", "R$", f"{prestacao_data["totais"]["total_geral"]:.2f}".replace(".", ",")]
        ]
        
        tabela = Table(tabela_data, colWidths=[1*cm, 4*cm, 3*cm, 1*cm, 2*cm])
        tabela.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(tabela)
        story.append(Spacer(1, 20))
        
        # Tabela de documentos apresentados para comprovação.
        story.append(Paragraph("DOCUMENTOS APRESENTADOS", self.styles["Subtitulo"]))
        story.append(Spacer(1, 10))
        
        doc_data = [['DATA', 'DESCRIÇÃO DOCUMENTO APRESENTADO', 'REFERÊNCIA']]
        for doc in prestacao_data['documentos']:
            data_doc = datetime.strptime(doc['data_documento'], '%Y-%m-%d').strftime('%d/%m/%Y') if doc['data_documento'] else ''
            doc_data.append([data_doc, doc['descricao'], 'Anexo'])
        
        # Adicionar linhas vazias se necessário
        while len(doc_data) < 10:
            doc_data.append(['', '', ''])
        
        tabela_docs = Table(doc_data, colWidths=[2*cm, 8*cm, 3*cm])
        tabela_docs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(tabela_docs)
        story.append(Spacer(1, 30))
        
        # Local e data
        story.append(Paragraph(f"Município Exemplo, {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        story.append(Spacer(1, 30))
        
        # Assinatura do responsável
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph(f"{prestacao_data['servidor']['nome']}", self.styles['Assinatura']))
        story.append(Paragraph("Responsável pelo Adiantamento", self.styles['Assinatura']))
        story.append(Spacer(1, 20))
        
        # Parecer da contadora
        parecer_texto = """
        A Contadoria, analisando contabilmente a documentação apresentada, sugere a aceitação 
        da prestação de contas da diária, SE não houver sugestões de ajustes(abaixo).
        """
        story.append(Paragraph(parecer_texto, self.styles['TextoNormal']))
        story.append(Spacer(1, 30))
        
        # Assinatura da contadora
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph("Etiane Acosta Alves", self.styles['Assinatura']))
        story.append(Paragraph("Contadora", self.styles['Assinatura']))
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Município Exemplo, {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        story.append(Spacer(1, 30))
        
        # Sugestões de ajustes
        story.append(Paragraph("SUGESTÕES DE AJUSTES, SE HOUVER", self.styles['Subtitulo']))
        story.append(Spacer(1, 50))
        
        # Remete ao presidente
        story.append(Paragraph("Remete a(o) Sr. Presidente da Câmara, para julgamento final", 
                             self.styles['Subtitulo']))
        story.append(Spacer(1, 20))
        
        julgamento_texto = f"""
        Tendo em vista o Parecer Técnico da Contadoria, julgo boas as contas do(a) Sr.(a) 
        <b>{prestacao_data['servidor']['nome']}</b> relativo a prestação de Contas da diária (acima).
        """
        story.append(Paragraph(julgamento_texto, self.styles['TextoNormal']))
        story.append(Spacer(1, 10))
        
        story.append(Paragraph("Remete-se à Contadoria para:", self.styles['TextoNormal']))
        story.append(Spacer(1, 20))
        
        # Opções de baixa
        story.append(Paragraph("Baixa de responsabilidade.", self.styles['Subtitulo']))
        story.append(Spacer(1, 20))
        story.append(Paragraph("Realizar as alterações sugeridas.", self.styles['Subtitulo']))
        story.append(Spacer(1, 50))
        
        # Assinatura do presidente
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph(f"{prestacao_data['presidente']['nome']}", self.styles['Assinatura']))
        story.append(Paragraph("Presidente da Câmara de Vereadores", self.styles['Assinatura']))
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Município Exemplo, {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer

    def gerar_pdf_passagem(self, prestacao_data):
        """Gera um PDF de prestação de contas de passagem."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, 
                              topMargin=2*cm, bottomMargin=2*cm)
        
        story = []
        
        # Adiciona o título principal do documento.
        story.append(Paragraph("PRESTAÇÃO DE CONTAS DE ADIANTAMENTO", self.styles["TituloPrincipal"]))
        story.append(Spacer(1, 20))
        
        # Seção de informações do servidor e detalhes do adiantamento de passagem.
        adiantamento_passagem = prestacao_data.get("adiantamento_passagem")
        if not adiantamento_passagem:
            story.append(Paragraph("Não há adiantamento de passagem para esta prestação de contas.", 
                                 self.styles["TextoNormal"]))
        else:
            servidor_info = f"""
            O servidor <b>{prestacao_data['servidor']['nome']}</b> em atendimento às exigências legais, vem proceder a Prestação de Contas do 
            Adiantamento número <b>{adiantamento_passagem['numero_adiantamento']}</b>, 
            <b>{adiantamento_passagem['data_adiantamento']}</b>, para o que junta a documentação comprobatória das despesas efetuadas, e recolhimento conforme 
            discriminação abaixo:
            """
            story.append(Paragraph(servidor_info, self.styles['TextoNormal']))
            story.append(Spacer(1, 20))
            
            # Tabela detalhando o adiantamento e as despesas de passagens.
            tabela_data = [
                ["DATA", "DESCRIÇÃO", "DÉBITO/RECEBIDO", "CRÉDITO/COMPROVADO/DEVOLVIDO"],
                [adiantamento_passagem["data_adiantamento"], 
                 f"Recebi conforme Empenho nº {adiantamento_passagem["numero_empenho"]}", 
                 f"R$ {adiantamento_passagem["valor"]:.2f}".replace(".", ","), ""]
            ]
            
            # Adicionar passagens
            for passagem in prestacao_data.get('passagens', []):
                tabela_data.append(['', f"Passagem {passagem['tipo_viagem']} - BPE: {passagem['bpe']}", 
                                  '', f"R$ {passagem['valor']:.2f}".replace('.', ',')])
            
            # Adicionar linhas vazias
            for _ in range(5):
                tabela_data.append(['', '', '', ''])
            
            # Calcular totais
            total_passagens = sum(p['valor'] for p in prestacao_data.get('passagens', []))
            valor_a_devolver = adiantamento_passagem['valor'] - total_passagens
            
            tabela_data.extend([
                ['', 'KM Rodados - KM', '', ''],
                ['', f"Valor do KM Rodado: R$ -", '', ''],
                ['', f"Valor Comprovado R$ -", '', ''],
                ['', 'Anexo Notas de Combustível e Comprovantes', '', ''],
                ['', f"Anulação empenho nº {adiantamento_passagem['numero_empenho']}", 
                 f"R$ {valor_a_devolver:.2f}".replace('.', ',') if valor_a_devolver > 0 else '', ''],
                ['', '', f"R$ {adiantamento_passagem['valor']:.2f}".replace('.', ','), 
                 f"R$ {total_passagens:.2f}".replace('.', ',')]
            ])
            
            tabela = Table(tabela_data, colWidths=[2*cm, 6*cm, 3*cm, 3*cm])
            tabela.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(tabela)
        
        story.append(Spacer(1, 50))
        
        # Local e data
        story.append(Paragraph(f"Município Exemplo, {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        story.append(Spacer(1, 50))
        
        # Assinatura do responsável
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph(f"{prestacao_data['servidor']['nome']}", self.styles['Assinatura']))
        story.append(Paragraph("Responsável pelo Adiantamento", self.styles['Assinatura']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer

    def gerar_pdf_parecer(self, prestacao_data):
        """Gera um PDF de parecer técnico para prestação de contas."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, 
                              topMargin=2*cm, bottomMargin=2*cm)
        
        story = []
        
        # Adiciona o cabeçalho do documento com informações da prefeitura.
        story.append(Paragraph("PREFEITURA MUNICIPAL DE MUNICÍPIO EXEMPLO", self.styles["TituloPrincipal"]))
        story.append(Paragraph("SECRETARIA MUNICIPAL DE ADMINISTRAÇÃO, PLANEJAMENTO E FINANÇAS", 
                             self.styles["Subtitulo"]))
        story.append(Spacer(1, 30))
        
        # Adiciona a data do exame técnico da Contadoria.
        story.append(Paragraph(f"A Contadoria, para o exame técnico em {datetime.now().strftime("%d/%m/%Y")}", 
                             self.styles["TextoNormal"]))
        story.append(Spacer(1, 50))
        
        # Linha para assinatura do Secretário Municipal.
        story.append(Paragraph("_" * 60, self.styles["Assinatura"]))
        story.append(Paragraph("Secretário Municipal de Administração,", self.styles['Assinatura']))
        story.append(Paragraph("Planejamento e Finanças", self.styles['Assinatura']))
        story.append(Spacer(1, 30))
        
        # Título da seção de Parecer Técnico.
        story.append(Paragraph('"PARECER TÉCNICO"', self.styles['TituloPrincipal']))
        story.append(Spacer(1, 20))
        
        # Obtém os dados do adiantamento de diária para preencher o parecer.
        adiantamento = prestacao_data.get("adiantamento_diaria", {})
        parecer_texto = f"""
        A Contadoria, procedendo ao exame técnico de prestação de contas do(a) Sr.(a) 
        <b>{prestacao_data["servidor"]["nome"]}</b>, relativo ao Adiantamento Nº 
        <b>{adiantamento.get("numero_adiantamento", "")}</b> de 
        <b>{adiantamento.get("data_adiantamento", "")}</b> no valor de R$ 
        <b>{adiantamento.get("valor", 0):.2f}</b> encontrou a documentação em perfeita ordem quanto 
        ao aspecto aritmético e legal das despesas efetuadas.
        """
        story.append(Paragraph(parecer_texto, self.styles["TextoNormal"]))
        story.append(Spacer(1, 30))
        
        story.append(Paragraph("À consideração Superior,", self.styles['TextoNormal']))
        story.append(Spacer(1, 50))
        
        story.append(Paragraph(f"Contadoria Geral do Município, em {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        story.append(Spacer(1, 50))
        
        # Assinatura da contadora
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph("Etiane Acosta Alves", self.styles['Assinatura']))
        story.append(Paragraph("Contadora", self.styles['Assinatura']))
        story.append(Spacer(1, 30))
        
        # Termo de julgamento a ser preenchido pelo Presidente da Câmara.
        story.append(Paragraph(f"Ao Sr. Presidente da Câmara de Vereadores, para julgamento, Secretaria Municipal de", 
                             self.styles["TextoNormal"]))
        story.append(Paragraph(f"Administração, Planejamento e Finanças em {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['TextoNormal']))
        story.append(Spacer(1, 30))
        
        story.append(Paragraph('"TERMO DE JULGAMENTO"', self.styles['TituloPrincipal']))
        story.append(Spacer(1, 20))
        
        julgamento_texto = f"""
        Tendo em vista o Parecer Técnico da Contadoria, julgo boas as contas do(a) Sr.(a) 
        <b>{prestacao_data['servidor']['nome']}</b>, relativo ao Adiantamento em epígrafe. Remeta-se à 
        Contadoria, para a baixa da Responsabilidade.
        """
        story.append(Paragraph(julgamento_texto, self.styles['TextoNormal']))
        story.append(Spacer(1, 50))
        
        story.append(Paragraph(f"Câmara de Vereadores, em {datetime.now().strftime('%d/%m/%Y')}", 
                             self.styles['Assinatura']))
        story.append(Spacer(1, 50))
        
        # Assinatura do presidente
        story.append(Paragraph("_" * 50, self.styles['Assinatura']))
        story.append(Paragraph(f"{prestacao_data['presidente']['nome']}", self.styles['Assinatura']))
        story.append(Paragraph("Presidente da Câmara de Vereadores", self.styles['Assinatura']))
        
        # Verificar se é prestação do próprio presidente
        if prestacao_data['servidor']['nome'].lower() == prestacao_data['presidente']['nome'].lower():
            story.append(Spacer(1, 50))
            story.append(Paragraph("_" * 50, self.styles['Assinatura']))
            story.append(Paragraph("Membro da Mesa Diretora", self.styles['Assinatura']))
            story.append(Paragraph("(Visto)", self.styles['Assinatura']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
