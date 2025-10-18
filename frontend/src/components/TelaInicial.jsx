import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormField, FormGroup, FormErrorSummary } from '@/components/ui/form-field'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'
import { useFormValidation } from '@/hooks/use-form-validation'
import { useResponsive } from '@/hooks/use-responsive'
import { Plus, Settings, User, UserCheck } from 'lucide-react'

function TelaInicial({ setPrestacaoId }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isMobile } = useResponsive()
  
  // Estados para dados
  const [servidores, setServidores] = useState([])
  const [presidentes, setPresidentes] = useState([])
  const [cargos, setCargos] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Estados para seleções
  const [servidorSelecionado, setServidorSelecionado] = useState('')
  const [presidenteSelecionado, setPresidenteSelecionado] = useState('')
  
  // Estados para diálogos
  const [dialogServidorAberto, setDialogServidorAberto] = useState(false)
  const [dialogPresidenteAberto, setDialogPresidenteAberto] = useState(false)

  // Validação para novo servidor
  const servidorValidation = useFormValidation(
    { nome: '', cargo: '' },
    {
      nome: { 
        required: true, 
        minLength: 2,
        maxLength: 100 
      },
      cargo: { 
        required: true 
      }
    }
  )

  // Validação para novo presidente
  const presidenteValidation = useFormValidation(
    { nome: '' },
    {
      nome: { 
        required: true, 
        minLength: 2,
        maxLength: 100 
      }
    }
  )

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [servidoresRes, presidentesRes, cargosRes] = await Promise.all([
        fetch('/api/servidores'),
        fetch('/api/presidentes'),
        fetch('/api/cargos')
      ])
      
      if (!servidoresRes.ok || !presidentesRes.ok || !cargosRes.ok) {
        throw new Error('Erro ao carregar dados do servidor')
      }
      
      setServidores(await servidoresRes.json())
      setPresidentes(await presidentesRes.json())
      setCargos(await cargosRes.json())
      
      toast.success('Dados carregados com sucesso')
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const criarServidor = async () => {
    if (!servidorValidation.validateAll()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/servidores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servidorValidation.values)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar servidor')
      }
      
      const servidor = await response.json()
      setServidores([...servidores, servidor])
      setServidorSelecionado(servidor.id.toString())
      servidorValidation.reset()
      setDialogServidorAberto(false)
      
      toast.success('Servidor cadastrado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar servidor:', error)
      toast.error('Erro ao cadastrar servidor. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const criarPresidente = async () => {
    if (!presidenteValidation.validateAll()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/presidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presidenteValidation.values)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar presidente')
      }
      
      const presidente = await response.json()
      setPresidentes([...presidentes, presidente])
      setPresidenteSelecionado(presidente.id.toString())
      presidenteValidation.reset()
      setDialogPresidenteAberto(false)
      
      toast.success('Presidente cadastrado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar presidente:', error)
      toast.error('Erro ao cadastrar presidente. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const avancar = async () => {
    console.log('Função avancar chamada')
    console.log('Servidor selecionado:', servidorSelecionado)
    console.log('Presidente selecionado:', presidenteSelecionado)
    
    if (!servidorSelecionado || !presidenteSelecionado) {
      console.log('Validação falhou: servidor ou presidente não selecionado')
      toast.error('Por favor, selecione um servidor e um presidente.')
      return
    }

    try {
      console.log('Iniciando requisição para criar prestação de contas')
      setSubmitting(true)
      
      const requestBody = {
        servidor_id: parseInt(servidorSelecionado),
        presidente_id: parseInt(presidenteSelecionado)
      }
      console.log('Dados da requisição:', requestBody)
      
      const response = await fetch('/api/prestacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Resposta recebida:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na resposta:', errorText)
        throw new Error(`Erro ao criar prestação de contas: ${response.status} - ${errorText}`)
      }
      
      const prestacao = await response.json()
      console.log('Prestação criada:', prestacao)
      
      setPrestacaoId(prestacao.id)
      toast.success('Prestação de contas iniciada!')
      
      console.log('Navegando para /adiantamentos')
      navigate('/adiantamentos')
    } catch (error) {
      console.error('Erro completo ao criar prestação de contas:', error)
      toast.error(`Erro ao iniciar prestação de contas: ${error.message}`)
    } finally {
      setSubmitting(false)
      console.log('Finalizando função avancar')
    }
  }

  const cargosUnicos = [...new Set(cargos.map(c => c.nome_cargo))]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <Loading size="lg" text="Carregando dados..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-t-lg">
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            Nova Prestação de Contas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <FormGroup 
            title="Informações Básicas"
            description="Selecione o servidor e o presidente responsável pela prestação de contas."
          >
            {/* Seleção de Servidor */}
            <FormField
              label="Servidor"
              required
              helpText="Selecione o servidor que realizará a prestação de contas"
            >
              <div className="flex gap-2">
                <Select value={servidorSelecionado} onValueChange={setServidorSelecionado}>
                  <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors hover:border-gray-400 dark:hover:border-gray-500">
                    <SelectValue placeholder="Selecione um servidor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {servidores.map(servidor => (
                      <SelectItem 
                        key={servidor.id} 
                        value={servidor.id.toString()}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {servidor.nome} - {servidor.cargo}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={dialogServidorAberto} onOpenChange={setDialogServidorAberto}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Cadastrar novo servidor"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Cadastrar Novo Servidor
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <FormErrorSummary errors={servidorValidation.errors} />
                      
                      <FormField
                        label="Nome"
                        required
                        error={servidorValidation.touched.nome && servidorValidation.errors.nome}
                        success={servidorValidation.touched.nome && !servidorValidation.errors.nome && servidorValidation.values.nome}
                      >
                        <Input
                          {...servidorValidation.getFieldProps('nome')}
                          placeholder="Nome completo do servidor"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </FormField>
                      
                      <FormField
                        label="Cargo"
                        required
                        error={servidorValidation.touched.cargo && servidorValidation.errors.cargo}
                        success={servidorValidation.touched.cargo && !servidorValidation.errors.cargo && servidorValidation.values.cargo}
                      >
                        <Select 
                          value={servidorValidation.values.cargo} 
                          onValueChange={(value) => servidorValidation.setValue('cargo', value)}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            {cargosUnicos.map(cargo => (
                              <SelectItem 
                                key={cargo} 
                                value={cargo}
                                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {cargo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                      
                      <Button 
                        onClick={criarServidor} 
                        className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <Loading size="sm" text="" />
                            Cadastrando...
                          </div>
                        ) : (
                          'Cadastrar Servidor'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </FormField>

            {/* Seleção de Presidente */}
            <FormField
              label="Presidente da Câmara"
              required
              helpText="Selecione o presidente responsável pela aprovação"
            >
              <div className="flex gap-2">
                <Select value={presidenteSelecionado} onValueChange={setPresidenteSelecionado}>
                  <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors hover:border-gray-400 dark:hover:border-gray-500">
                    <SelectValue placeholder="Selecione o presidente" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {presidentes.map(presidente => (
                      <SelectItem 
                        key={presidente.id} 
                        value={presidente.id.toString()}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          {presidente.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={dialogPresidenteAberto} onOpenChange={setDialogPresidenteAberto}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Cadastrar novo presidente"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Cadastrar Novo Presidente
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <FormErrorSummary errors={presidenteValidation.errors} />
                      
                      <FormField
                        label="Nome"
                        required
                        error={presidenteValidation.touched.nome && presidenteValidation.errors.nome}
                        success={presidenteValidation.touched.nome && !presidenteValidation.errors.nome && presidenteValidation.values.nome}
                      >
                        <Input
                          {...presidenteValidation.getFieldProps('nome')}
                          placeholder="Nome completo do presidente"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </FormField>
                      
                      <Button 
                        onClick={criarPresidente} 
                        className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <Loading size="sm" text="" />
                            Cadastrando...
                          </div>
                        ) : (
                          'Cadastrar Presidente'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </FormField>
          </FormGroup>

          {/* Botões de Ação */}
          <div className={`flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Button 
              variant="outline" 
              onClick={() => navigate('/configuracao-diarias')}
              className={`flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isMobile ? 'w-full' : ''}`}
            >
              <Settings className="h-4 w-4" />
              Configurar Valores de Diárias
            </Button>
            
            <Button 
              onClick={avancar}
              className={`bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors ${isMobile ? 'w-full' : 'flex-1'}`}
              disabled={!servidorSelecionado || !presidenteSelecionado || submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loading size="sm" text="" />
                  Iniciando...
                </div>
              ) : (
                'Avançar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TelaInicial
