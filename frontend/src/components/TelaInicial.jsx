import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Settings } from 'lucide-react'

function TelaInicial({ setPrestacaoId }) {
  const navigate = useNavigate()
  const [servidores, setServidores] = useState([])
  const [presidentes, setPresidentes] = useState([])
  const [servidorSelecionado, setServidorSelecionado] = useState('')
  const [presidenteSelecionado, setPresidenteSelecionado] = useState('')
  const [novoServidor, setNovoServidor] = useState({ nome: '', cargo: '' })
  const [novoPresidente, setNovoPresidente] = useState({ nome: '' })
  const [cargos, setCargos] = useState([])
  const [dialogServidorAberto, setDialogServidorAberto] = useState(false)
  const [dialogPresidenteAberto, setDialogPresidenteAberto] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [servidoresRes, presidentesRes, cargosRes] = await Promise.all([
        fetch('/api/servidores'),
        fetch('/api/presidentes'),
        fetch('/api/cargos')
      ])
      
      setServidores(await servidoresRes.json())
      setPresidentes(await presidentesRes.json())
      setCargos(await cargosRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const criarServidor = async () => {
    try {
      const response = await fetch('/api/servidores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoServidor)
      })
      
      if (response.ok) {
        const servidor = await response.json()
        setServidores([...servidores, servidor])
        setServidorSelecionado(servidor.id.toString())
        setNovoServidor({ nome: '', cargo: '' })
        setDialogServidorAberto(false)
      }
    } catch (error) {
      console.error('Erro ao criar servidor:', error)
    }
  }

  const criarPresidente = async () => {
    try {
      const response = await fetch('/api/presidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPresidente)
      })
      
      if (response.ok) {
        const presidente = await response.json()
        setPresidentes([...presidentes, presidente])
        setPresidenteSelecionado(presidente.id.toString())
        setNovoPresidente({ nome: '' })
        setDialogPresidenteAberto(false)
      }
    } catch (error) {
      console.error('Erro ao criar presidente:', error)
    }
  }

  const avancar = async () => {
    if (!servidorSelecionado || !presidenteSelecionado) {
      alert('Por favor, selecione um servidor e um presidente.')
      return
    }

    try {
      const response = await fetch('/api/prestacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servidor_id: parseInt(servidorSelecionado),
          presidente_id: parseInt(presidenteSelecionado)
        })
      })
      
      if (response.ok) {
        const prestacao = await response.json()
        setPrestacaoId(prestacao.id)
        navigate('/adiantamentos')
      }
    } catch (error) {
      console.error('Erro ao criar prestação de contas:', error)
    }
  }

  const cargosUnicos = [...new Set(cargos.map(c => c.nome_cargo))]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Nova Prestação de Contas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Servidor */}
          <div className="space-y-2">
            <Label htmlFor="servidor">Servidor</Label>
            <div className="flex gap-2">
              <Select value={servidorSelecionado} onValueChange={setServidorSelecionado}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {servidores.map(servidor => (
                    <SelectItem key={servidor.id} value={servidor.id.toString()}>
                      {servidor.nome} - {servidor.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={dialogServidorAberto} onOpenChange={setDialogServidorAberto}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Servidor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome-servidor">Nome</Label>
                      <Input
                        id="nome-servidor"
                        value={novoServidor.nome}
                        onChange={(e) => setNovoServidor({...novoServidor, nome: e.target.value})}
                        placeholder="Nome do servidor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cargo-servidor">Cargo</Label>
                      <Select 
                        value={novoServidor.cargo} 
                        onValueChange={(value) => setNovoServidor({...novoServidor, cargo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {cargosUnicos.map(cargo => (
                            <SelectItem key={cargo} value={cargo}>
                              {cargo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={criarServidor} className="w-full">
                      Cadastrar Servidor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Seleção de Presidente */}
          <div className="space-y-2">
            <Label htmlFor="presidente">Presidente da Câmara</Label>
            <div className="flex gap-2">
              <Select value={presidenteSelecionado} onValueChange={setPresidenteSelecionado}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o presidente" />
                </SelectTrigger>
                <SelectContent>
                  {presidentes.map(presidente => (
                    <SelectItem key={presidente.id} value={presidente.id.toString()}>
                      {presidente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={dialogPresidenteAberto} onOpenChange={setDialogPresidenteAberto}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Presidente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome-presidente">Nome</Label>
                      <Input
                        id="nome-presidente"
                        value={novoPresidente.nome}
                        onChange={(e) => setNovoPresidente({...novoPresidente, nome: e.target.value})}
                        placeholder="Nome do presidente"
                      />
                    </div>
                    <Button onClick={criarPresidente} className="w-full">
                      Cadastrar Presidente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/configuracao-diarias')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurar Valores de Diárias
            </Button>
            
            <Button 
              onClick={avancar}
              className="flex-1"
              disabled={!servidorSelecionado || !presidenteSelecionado}
            >
              Avançar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TelaInicial
