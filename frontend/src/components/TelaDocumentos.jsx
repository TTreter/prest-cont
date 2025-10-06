import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText } from 'lucide-react'

function TelaDocumentos({ prestacaoId }) {
  const navigate = useNavigate()
  const [documentos, setDocumentos] = useState([])
  const [novoDocumento, setNovoDocumento] = useState({
    tipo_documento: '',
    descricao: '',
    data_documento: '',
    valor: ''
  })
  const [dialogAberto, setDialogAberto] = useState(false)

  const tiposDocumento = [
    { value: 'nota_fiscal', label: 'Nota Fiscal' },
    { value: 'nota_hotel', label: 'Nota de Hotel' },
    { value: 'curso', label: 'Nota de Curso' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'relatorio', label: 'Relatório de Viagem' },
    { value: 'atestado', label: 'Atestado de Presença' },
    { value: 'outros', label: 'Outros' }
  ]

  useEffect(() => {
    if (prestacaoId) {
      carregarDocumentos()
    }
  }, [prestacaoId])

  const carregarDocumentos = async () => {
    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}/documentos`)
      const data = await response.json()
      setDocumentos(data)
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    }
  }

  const adicionarDocumento = async () => {
    if (!novoDocumento.tipo_documento || !novoDocumento.descricao) {
      alert('Por favor, preencha pelo menos o tipo e a descrição do documento.')
      return
    }

    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novoDocumento,
          valor: novoDocumento.valor ? parseFloat(novoDocumento.valor) : null
        })
      })
      
      if (response.ok) {
        const documento = await response.json()
        setDocumentos([...documentos, documento])
        setNovoDocumento({
          tipo_documento: '',
          descricao: '',
          data_documento: '',
          valor: ''
        })
        setDialogAberto(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error)
    }
  }

  const removerDocumento = async (documentoId) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) {
      return
    }

    try {
      const response = await fetch(`/api/documentos/${documentoId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDocumentos(documentos.filter(d => d.id !== documentoId))
      }
    } catch (error) {
      console.error('Erro ao remover documento:', error)
    }
  }

  const formatarMoeda = (valor) => {
    if (!valor) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getTipoLabel = (tipo) => {
    const tipoObj = tiposDocumento.find(t => t.value === tipo)
    return tipoObj ? tipoObj.label : tipo
  }

  const avancar = () => {
    // Verificar se há pelo menos uma nota fiscal
    const temNotaFiscal = documentos.some(d => d.tipo_documento === 'nota_fiscal')
    const temNotaHotel = documentos.some(d => d.tipo_documento === 'nota_hotel')
    
    if (!temNotaFiscal || !temNotaHotel) {
      alert('É necessário cadastrar pelo menos uma nota fiscal e uma nota de hotel.')
      return
    }
    
    navigate('/passagens')
  }

  if (!prestacaoId) {
    return (
      <div className="text-center py-8">
        <p>Nenhuma prestação de contas selecionada.</p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Documentos de Comprovação</CardTitle>
          <p className="text-gray-600">
            Cadastre as notas fiscais e outros documentos comprobatórios da viagem.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              <p>• É obrigatório pelo menos 1 nota fiscal para cada diária</p>
              <p>• É obrigatório 1 nota de hotel</p>
              <p>• Outros documentos são opcionais</p>
            </div>
            
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipo-documento">Tipo de Documento</Label>
                    <Select 
                      value={novoDocumento.tipo_documento} 
                      onValueChange={(value) => setNovoDocumento({...novoDocumento, tipo_documento: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumento.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="descricao-documento">Descrição</Label>
                    <Input
                      id="descricao-documento"
                      value={novoDocumento.descricao}
                      onChange={(e) => setNovoDocumento({...novoDocumento, descricao: e.target.value})}
                      placeholder="Ex: PARADOURO BORTOLINI, SESC CENTRO HISTÓRICO"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-documento">Data do Documento</Label>
                    <Input
                      id="data-documento"
                      type="date"
                      value={novoDocumento.data_documento}
                      onChange={(e) => setNovoDocumento({...novoDocumento, data_documento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-documento">Valor (R$) - Opcional</Label>
                    <Input
                      id="valor-documento"
                      type="number"
                      step="0.01"
                      value={novoDocumento.valor}
                      onChange={(e) => setNovoDocumento({...novoDocumento, valor: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={adicionarDocumento} className="w-full">
                    Adicionar Documento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de Documentos */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map(documento => (
                  <TableRow key={documento.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {getTipoLabel(documento.tipo_documento)}
                      </div>
                    </TableCell>
                    <TableCell>{documento.descricao}</TableCell>
                    <TableCell>{formatarData(documento.data_documento)}</TableCell>
                    <TableCell>{formatarMoeda(documento.valor)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removerDocumento(documento.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {documentos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum documento cadastrado.</p>
              <p>Clique em "Adicionar Documento" para começar.</p>
            </div>
          )}

          {/* Resumo por tipo */}
          {documentos.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Resumo dos Documentos:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {tiposDocumento.map(tipo => {
                  const count = documentos.filter(d => d.tipo_documento === tipo.value).length
                  if (count === 0) return null
                  return (
                    <div key={tipo.value} className="flex justify-between">
                      <span>{tipo.label}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/adiantamentos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          onClick={avancar}
          className="flex items-center gap-2"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default TelaDocumentos
