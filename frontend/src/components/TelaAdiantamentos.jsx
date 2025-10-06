import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react'

function TelaAdiantamentos({ prestacaoId }) {
  const navigate = useNavigate()
  const [adiantamentoDiaria, setAdiantamentoDiaria] = useState({
    numero_adiantamento: '',
    numero_empenho: '',
    valor: '',
    data_adiantamento: ''
  })
  const [adiantamentoPassagem, setAdiantamentoPassagem] = useState({
    numero_adiantamento: '',
    numero_empenho: '',
    valor: '',
    data_adiantamento: ''
  })
  const [despesasDiarias, setDespesasDiarias] = useState({
    diarias_dentro_estado: 0,
    refeicoes_dentro_estado: 0,
    diarias_fora_estado: 0,
    refeicoes_fora_estado: 0
  })
  const [totais, setTotais] = useState(null)
  const [prestacao, setPrestacao] = useState(null)

  useEffect(() => {
    if (prestacaoId) {
      carregarDados()
    }
  }, [prestacaoId])

  const carregarDados = async () => {
    try {
      // Carregar dados da prestação
      const prestacaoRes = await fetch(`/api/prestacoes/${prestacaoId}`)
      const prestacaoData = await prestacaoRes.json()
      setPrestacao(prestacaoData)

      // Carregar adiantamentos existentes
      const adiantamentosRes = await fetch(`/api/prestacoes/${prestacaoId}/adiantamentos`)
      const adiantamentos = await adiantamentosRes.json()
      
      const diaria = adiantamentos.find(a => a.tipo === 'diaria')
      const passagem = adiantamentos.find(a => a.tipo === 'passagem')
      
      if (diaria) {
        setAdiantamentoDiaria({
          numero_adiantamento: diaria.numero_adiantamento,
          numero_empenho: diaria.numero_empenho,
          valor: diaria.valor.toString(),
          data_adiantamento: diaria.data_adiantamento
        })
      }
      
      if (passagem) {
        setAdiantamentoPassagem({
          numero_adiantamento: passagem.numero_adiantamento,
          numero_empenho: passagem.numero_empenho,
          valor: passagem.valor.toString(),
          data_adiantamento: passagem.data_adiantamento
        })
      }

      // Carregar despesas de diárias
      const despesasRes = await fetch(`/api/prestacoes/${prestacaoId}/despesas-diarias`)
      if (despesasRes.ok) {
        const despesas = await despesasRes.json()
        setDespesasDiarias(despesas)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const calcularTotais = async () => {
    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}/calcular-totais`)
      const data = await response.json()
      setTotais(data)
    } catch (error) {
      console.error('Erro ao calcular totais:', error)
    }
  }

  const salvarAdiantamentos = async () => {
    try {
      // Salvar adiantamento de diária
      if (adiantamentoDiaria.numero_adiantamento && adiantamentoDiaria.valor) {
        await fetch(`/api/prestacoes/${prestacaoId}/adiantamentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...adiantamentoDiaria,
            tipo: 'diaria',
            valor: parseFloat(adiantamentoDiaria.valor)
          })
        })
      }

      // Salvar adiantamento de passagem
      if (adiantamentoPassagem.numero_adiantamento && adiantamentoPassagem.valor) {
        await fetch(`/api/prestacoes/${prestacaoId}/adiantamentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...adiantamentoPassagem,
            tipo: 'passagem',
            valor: parseFloat(adiantamentoPassagem.valor)
          })
        })
      }

      // Salvar despesas de diárias
      await fetch(`/api/prestacoes/${prestacaoId}/despesas-diarias`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despesasDiarias)
      })

      calcularTotais()
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
    }
  }

  const avancar = () => {
    if (!adiantamentoDiaria.numero_adiantamento || !adiantamentoDiaria.valor) {
      alert('Por favor, preencha os dados do adiantamento de diária.')
      return
    }
    navigate('/documentos')
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
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
      {prestacao && (
        <Card>
          <CardHeader>
            <CardTitle>Prestação de Contas - {prestacao.servidor?.nome}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adiantamento de Diária */}
        <Card>
          <CardHeader>
            <CardTitle>Adiantamento de Diária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="num-adiantamento-diaria">Número do Adiantamento</Label>
              <Input
                id="num-adiantamento-diaria"
                value={adiantamentoDiaria.numero_adiantamento}
                onChange={(e) => setAdiantamentoDiaria({...adiantamentoDiaria, numero_adiantamento: e.target.value})}
                placeholder="Ex: 566"
              />
            </div>
            <div>
              <Label htmlFor="num-empenho-diaria">Número do Empenho</Label>
              <Input
                id="num-empenho-diaria"
                value={adiantamentoDiaria.numero_empenho}
                onChange={(e) => setAdiantamentoDiaria({...adiantamentoDiaria, numero_empenho: e.target.value})}
                placeholder="Ex: 6706"
              />
            </div>
            <div>
              <Label htmlFor="valor-diaria">Valor (R$)</Label>
              <Input
                id="valor-diaria"
                type="number"
                step="0.01"
                value={adiantamentoDiaria.valor}
                onChange={(e) => setAdiantamentoDiaria({...adiantamentoDiaria, valor: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="data-diaria">Data do Adiantamento</Label>
              <Input
                id="data-diaria"
                type="date"
                value={adiantamentoDiaria.data_adiantamento}
                onChange={(e) => setAdiantamentoDiaria({...adiantamentoDiaria, data_adiantamento: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Adiantamento de Passagem */}
        <Card>
          <CardHeader>
            <CardTitle>Adiantamento de Passagem (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="num-adiantamento-passagem">Número do Adiantamento</Label>
              <Input
                id="num-adiantamento-passagem"
                value={adiantamentoPassagem.numero_adiantamento}
                onChange={(e) => setAdiantamentoPassagem({...adiantamentoPassagem, numero_adiantamento: e.target.value})}
                placeholder="Ex: 567"
              />
            </div>
            <div>
              <Label htmlFor="num-empenho-passagem">Número do Empenho</Label>
              <Input
                id="num-empenho-passagem"
                value={adiantamentoPassagem.numero_empenho}
                onChange={(e) => setAdiantamentoPassagem({...adiantamentoPassagem, numero_empenho: e.target.value})}
                placeholder="Ex: 6707"
              />
            </div>
            <div>
              <Label htmlFor="valor-passagem">Valor (R$)</Label>
              <Input
                id="valor-passagem"
                type="number"
                step="0.01"
                value={adiantamentoPassagem.valor}
                onChange={(e) => setAdiantamentoPassagem({...adiantamentoPassagem, valor: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="data-passagem">Data do Adiantamento</Label>
              <Input
                id="data-passagem"
                type="date"
                value={adiantamentoPassagem.data_adiantamento}
                onChange={(e) => setAdiantamentoPassagem({...adiantamentoPassagem, data_adiantamento: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Despesas de Diárias */}
      <Card>
        <CardHeader>
          <CardTitle>Quantidade de Diárias e Refeições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="diarias-dentro">Diárias Dentro do Estado</Label>
              <Input
                id="diarias-dentro"
                type="number"
                min="0"
                value={despesasDiarias.diarias_dentro_estado}
                onChange={(e) => setDespesasDiarias({...despesasDiarias, diarias_dentro_estado: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="refeicoes-dentro">Refeições Dentro do Estado</Label>
              <Input
                id="refeicoes-dentro"
                type="number"
                min="0"
                value={despesasDiarias.refeicoes_dentro_estado}
                onChange={(e) => setDespesasDiarias({...despesasDiarias, refeicoes_dentro_estado: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="diarias-fora">Diárias Fora do Estado</Label>
              <Input
                id="diarias-fora"
                type="number"
                min="0"
                value={despesasDiarias.diarias_fora_estado}
                onChange={(e) => setDespesasDiarias({...despesasDiarias, diarias_fora_estado: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="refeicoes-fora">Refeições Fora do Estado</Label>
              <Input
                id="refeicoes-fora"
                type="number"
                min="0"
                value={despesasDiarias.refeicoes_fora_estado}
                onChange={(e) => setDespesasDiarias({...despesasDiarias, refeicoes_fora_estado: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totais */}
      {totais && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Diárias</p>
                <p className="text-lg font-bold text-blue-800">{formatarMoeda(totais.total_diarias)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Refeições</p>
                <p className="text-lg font-bold text-blue-800">{formatarMoeda(totais.total_refeicoes)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Geral</p>
                <p className="text-lg font-bold text-blue-800">{formatarMoeda(totais.total_geral)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adiantamento</p>
                <p className="text-lg font-bold text-green-600">{formatarMoeda(totais.valor_adiantamento_diaria)}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Diferença</p>
              <p className={`text-xl font-bold ${totais.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(Math.abs(totais.diferenca))} 
                {totais.diferenca >= 0 ? ' (A receber)' : ' (A devolver)'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={salvarAdiantamentos}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcular Totais
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
    </div>
  )
}

export default TelaAdiantamentos
