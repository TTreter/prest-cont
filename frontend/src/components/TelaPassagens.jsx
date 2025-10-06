import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ArrowRight, Plus, Trash2, Plane } from 'lucide-react'

function TelaPassagens({ prestacaoId }) {
  const navigate = useNavigate()
  const [passagens, setPassagens] = useState([])
  const [novaPassagem, setNovaPassagem] = useState({
    bpe: '',
    valor: '',
    tipo_viagem: ''
  })
  const [adiantamentoPassagem, setAdiantamentoPassagem] = useState(null)
  const [dialogAberto, setDialogAberto] = useState(false)

  useEffect(() => {
    if (prestacaoId) {
      carregarDados()
    }
  }, [prestacaoId])

  const carregarDados = async () => {
    try {
      // Carregar passagens existentes
      const passagensRes = await fetch(`/api/prestacoes/${prestacaoId}/despesas-passagens`)
      const passagensData = await passagensRes.json()
      setPassagens(passagensData)

      // Carregar adiantamento de passagem
      const adiantamentosRes = await fetch(`/api/prestacoes/${prestacaoId}/adiantamentos`)
      const adiantamentos = await adiantamentosRes.json()
      const passagem = adiantamentos.find(a => a.tipo === 'passagem')
      setAdiantamentoPassagem(passagem)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const adicionarPassagem = async () => {
    if (!novaPassagem.bpe || !novaPassagem.valor || !novaPassagem.tipo_viagem) {
      alert('Por favor, preencha todos os campos da passagem.')
      return
    }

    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}/despesas-passagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novaPassagem,
          valor: parseFloat(novaPassagem.valor)
        })
      })
      
      if (response.ok) {
        const passagem = await response.json()
        setPassagens([...passagens, passagem])
        setNovaPassagem({
          bpe: '',
          valor: '',
          tipo_viagem: ''
        })
        setDialogAberto(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar passagem:', error)
    }
  }

  const removerPassagem = async (passagemId) => {
    if (!confirm('Tem certeza que deseja remover esta passagem?')) {
      return
    }

    try {
      const response = await fetch(`/api/despesas-passagens/${passagemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPassagens(passagens.filter(p => p.id !== passagemId))
      }
    } catch (error) {
      console.error('Erro ao remover passagem:', error)
    }
  }

  const calcularTotais = () => {
    const totalPassagens = passagens.reduce((total, passagem) => total + passagem.valor, 0)
    const valorAdiantamento = adiantamentoPassagem ? adiantamentoPassagem.valor : 0
    const valorADevolver = valorAdiantamento - totalPassagens
    
    return {
      totalPassagens,
      valorAdiantamento,
      valorADevolver
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const avancar = () => {
    // Se há adiantamento de passagem, deve ter pelo menos uma passagem
    if (adiantamentoPassagem && passagens.length === 0) {
      alert('Como há adiantamento de passagem, é necessário cadastrar pelo menos uma passagem.')
      return
    }
    
    navigate('/final')
  }

  const totais = calcularTotais()

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
          <CardTitle className="text-2xl">Prestação de Contas - Passagens</CardTitle>
          <p className="text-gray-600">
            {adiantamentoPassagem 
              ? `Adiantamento de passagem: ${formatarMoeda(adiantamentoPassagem.valor)}`
              : 'Nenhum adiantamento de passagem cadastrado.'
            }
          </p>
        </CardHeader>
        <CardContent>
          {adiantamentoPassagem ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  <p>• Cadastre todas as passagens utilizadas na viagem</p>
                  <p>• Normalmente há passagem de ida e volta</p>
                  <p>• O valor restante do adiantamento deve ser devolvido</p>
                </div>
                
                <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Passagem
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Passagem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bpe">Código BPE</Label>
                        <Input
                          id="bpe"
                          value={novaPassagem.bpe}
                          onChange={(e) => setNovaPassagem({...novaPassagem, bpe: e.target.value})}
                          placeholder="Ex: 123456789"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor-passagem">Valor (R$)</Label>
                        <Input
                          id="valor-passagem"
                          type="number"
                          step="0.01"
                          value={novaPassagem.valor}
                          onChange={(e) => setNovaPassagem({...novaPassagem, valor: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo-viagem">Tipo de Viagem</Label>
                        <Select 
                          value={novaPassagem.tipo_viagem} 
                          onValueChange={(value) => setNovaPassagem({...novaPassagem, tipo_viagem: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ida">Ida</SelectItem>
                            <SelectItem value="volta">Volta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={adicionarPassagem} className="w-full">
                        Adicionar Passagem
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabela de Passagens */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código BPE</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passagens.map(passagem => (
                      <TableRow key={passagem.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-gray-500" />
                            {passagem.bpe}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{passagem.tipo_viagem}</TableCell>
                        <TableCell>{formatarMoeda(passagem.valor)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removerPassagem(passagem.id)}
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

              {passagens.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Plane className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma passagem cadastrada.</p>
                  <p>Clique em "Adicionar Passagem" para começar.</p>
                </div>
              )}

              {/* Resumo Financeiro */}
              <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Resumo Financeiro - Passagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Total das Passagens</p>
                      <p className="text-lg font-bold text-blue-800">{formatarMoeda(totais.totalPassagens)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor do Adiantamento</p>
                      <p className="text-lg font-bold text-green-600">{formatarMoeda(totais.valorAdiantamento)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {totais.valorADevolver >= 0 ? 'Valor a Devolver' : 'Valor a Receber'}
                      </p>
                      <p className={`text-xl font-bold ${totais.valorADevolver >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatarMoeda(Math.abs(totais.valorADevolver))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nenhum Adiantamento de Passagem</h3>
              <p>Não há adiantamento de passagem cadastrado para esta prestação de contas.</p>
              <p>Você pode prosseguir para a finalização.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/documentos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          onClick={avancar}
          className="flex items-center gap-2"
        >
          Finalizar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default TelaPassagens
