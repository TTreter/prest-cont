import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Download, Home } from 'lucide-react'

function TelaFinal({ prestacaoId }) {
  const navigate = useNavigate()
  const [prestacao, setPrestacao] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prestacaoId) {
      carregarPrestacao()
    }
  }, [prestacaoId])

  const carregarPrestacao = async () => {
    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}`)
      const data = await response.json()
      setPrestacao(data)
    } catch (error) {
      console.error('Erro ao carregar prestação:', error)
    }
  }

  const gerarPDF = async (tipo) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/prestacoes/${prestacaoId}/pdf/${tipo}`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${tipo}_${prestacao?.servidor?.nome || 'prestacao'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Erro ao gerar PDF. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const novaRestacao = () => {
    navigate('/')
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-600">
            Prestação de Contas Finalizada!
          </CardTitle>
          {prestacao && (
            <p className="text-center text-gray-600">
              Servidor: <strong>{prestacao.servidor?.nome}</strong> - {prestacao.servidor?.cargo}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Todos os dados foram cadastrados com sucesso. Agora você pode gerar os PDFs para impressão.
            </p>
          </div>

          {/* Botões para gerar PDFs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-medium mb-2">Prestação de Contas</h3>
                <h4 className="font-medium mb-2">de Diária</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Documento principal com detalhamento das diárias e refeições.
                </p>
                <Button 
                  onClick={() => gerarPDF('diaria')}
                  disabled={loading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-medium mb-2">Prestação de Contas</h3>
                <h4 className="font-medium mb-2">de Passagem</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Documento com detalhamento das passagens e valores a devolver.
                </p>
                <Button 
                  onClick={() => gerarPDF('passagem')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-medium mb-2">Parecer Técnico</h3>
                <h4 className="font-medium mb-2">da Contadora</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Parecer técnico e termo de julgamento para assinatura.
                </p>
                <Button 
                  onClick={() => gerarPDF('parecer')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Informações importantes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Instruções Importantes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Imprima todos os três documentos</li>
                <li>• Anexe os documentos comprobatórios originais</li>
                <li>• Colete as assinaturas necessárias</li>
                <li>• Entregue na secretaria para protocolo</li>
              </ul>
            </CardContent>
          </Card>

          {/* Resumo da prestação */}
          {prestacao && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Prestação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Servidor:</strong> {prestacao.servidor?.nome}
                  </div>
                  <div>
                    <strong>Cargo:</strong> {prestacao.servidor?.cargo}
                  </div>
                  <div>
                    <strong>Presidente:</strong> {prestacao.presidente?.nome}
                  </div>
                  <div>
                    <strong>Data:</strong> {new Date(prestacao.data_criacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/passagens')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          onClick={novaRestacao}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Nova Prestação
        </Button>
      </div>
    </div>
  )
}

export default TelaFinal
