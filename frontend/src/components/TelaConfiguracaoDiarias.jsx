import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, ArrowLeft, Edit } from 'lucide-react'

function TelaConfiguracaoDiarias() {
  const navigate = useNavigate()
  const [cargos, setCargos] = useState([])
  const [novoCargo, setNovoCargo] = useState({
    nome_cargo: '',
    valor_diaria_dentro_estado: '',
    valor_diaria_fora_estado: ''
  })
  const [cargoEditando, setCargoEditando] = useState(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogEdicaoAberto, setDialogEdicaoAberto] = useState(false)

  useEffect(() => {
    carregarCargos()
  }, [])

  const carregarCargos = async () => {
    try {
      const response = await fetch('/api/cargos')
      const data = await response.json()
      setCargos(data)
    } catch (error) {
      console.error('Erro ao carregar cargos:', error)
    }
  }

  const criarCargo = async () => {
    if (!novoCargo.nome_cargo || !novoCargo.valor_diaria_dentro_estado || !novoCargo.valor_diaria_fora_estado) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    try {
      const response = await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novoCargo,
          valor_diaria_dentro_estado: parseFloat(novoCargo.valor_diaria_dentro_estado),
          valor_diaria_fora_estado: parseFloat(novoCargo.valor_diaria_fora_estado)
        })
      })
      
      if (response.ok) {
        const cargo = await response.json()
        setCargos([...cargos, cargo])
        setNovoCargo({
          nome_cargo: '',
          valor_diaria_dentro_estado: '',
          valor_diaria_fora_estado: ''
        })
        setDialogAberto(false)
      }
    } catch (error) {
      console.error('Erro ao criar cargo:', error)
    }
  }

  const editarCargo = async () => {
    if (!cargoEditando.nome_cargo || !cargoEditando.valor_diaria_dentro_estado || !cargoEditando.valor_diaria_fora_estado) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    try {
      const response = await fetch(`/api/cargos/${cargoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cargoEditando,
          valor_diaria_dentro_estado: parseFloat(cargoEditando.valor_diaria_dentro_estado),
          valor_diaria_fora_estado: parseFloat(cargoEditando.valor_diaria_fora_estado)
        })
      })
      
      if (response.ok) {
        const cargoAtualizado = await response.json()
        setCargos(cargos.map(c => c.id === cargoAtualizado.id ? cargoAtualizado : c))
        setCargoEditando(null)
        setDialogEdicaoAberto(false)
      }
    } catch (error) {
      console.error('Erro ao editar cargo:', error)
    }
  }

  const abrirEdicao = (cargo) => {
    setCargoEditando({
      ...cargo,
      valor_diaria_dentro_estado: cargo.valor_diaria_dentro_estado.toString(),
      valor_diaria_fora_estado: cargo.valor_diaria_fora_estado.toString()
    })
    setDialogEdicaoAberto(true)
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Configuração de Valores de Diárias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Cargo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Cargo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome-cargo">Nome do Cargo</Label>
                    <Input
                      id="nome-cargo"
                      value={novoCargo.nome_cargo}
                      onChange={(e) => setNovoCargo({...novoCargo, nome_cargo: e.target.value})}
                      placeholder="Ex: Vereador, Secretário, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-dentro">Valor Diária Dentro do Estado (R$)</Label>
                    <Input
                      id="valor-dentro"
                      type="number"
                      step="0.01"
                      value={novoCargo.valor_diaria_dentro_estado}
                      onChange={(e) => setNovoCargo({...novoCargo, valor_diaria_dentro_estado: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-fora">Valor Diária Fora do Estado (R$)</Label>
                    <Input
                      id="valor-fora"
                      type="number"
                      step="0.01"
                      value={novoCargo.valor_diaria_fora_estado}
                      onChange={(e) => setNovoCargo({...novoCargo, valor_diaria_fora_estado: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={criarCargo} className="w-full">
                    Cadastrar Cargo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de Cargos */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Diária Dentro do Estado</TableHead>
                  <TableHead>Diária Fora do Estado</TableHead>
                  <TableHead>Refeição Dentro do Estado (15%)</TableHead>
                  <TableHead>Refeição Fora do Estado (15%)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargos.map(cargo => (
                  <TableRow key={cargo.id}>
                    <TableCell className="font-medium">{cargo.nome_cargo}</TableCell>
                    <TableCell>{formatarMoeda(cargo.valor_diaria_dentro_estado)}</TableCell>
                    <TableCell>{formatarMoeda(cargo.valor_diaria_fora_estado)}</TableCell>
                    <TableCell>{formatarMoeda(cargo.valor_diaria_dentro_estado * 0.15)}</TableCell>
                    <TableCell>{formatarMoeda(cargo.valor_diaria_fora_estado * 0.15)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => abrirEdicao(cargo)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {cargos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cargo cadastrado. Clique em "Novo Cargo" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={dialogEdicaoAberto} onOpenChange={setDialogEdicaoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
          </DialogHeader>
          {cargoEditando && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome-cargo">Nome do Cargo</Label>
                <Input
                  id="edit-nome-cargo"
                  value={cargoEditando.nome_cargo}
                  onChange={(e) => setCargoEditando({...cargoEditando, nome_cargo: e.target.value})}
                  placeholder="Ex: Vereador, Secretário, etc."
                />
              </div>
              <div>
                <Label htmlFor="edit-valor-dentro">Valor Diária Dentro do Estado (R$)</Label>
                <Input
                  id="edit-valor-dentro"
                  type="number"
                  step="0.01"
                  value={cargoEditando.valor_diaria_dentro_estado}
                  onChange={(e) => setCargoEditando({...cargoEditando, valor_diaria_dentro_estado: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-valor-fora">Valor Diária Fora do Estado (R$)</Label>
                <Input
                  id="edit-valor-fora"
                  type="number"
                  step="0.01"
                  value={cargoEditando.valor_diaria_fora_estado}
                  onChange={(e) => setCargoEditando({...cargoEditando, valor_diaria_fora_estado: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <Button onClick={editarCargo} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TelaConfiguracaoDiarias
