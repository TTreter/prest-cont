import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Componente de gráfico de barras para visualizar dados de diárias por mês.
 */
export function DiariasChart({ data, className }) {
  const chartData = data || [
    { mes: 'Jan', valor: 2400 },
    { mes: 'Fev', valor: 1398 },
    { mes: 'Mar', valor: 9800 },
    { mes: 'Abr', valor: 3908 },
    { mes: 'Mai', valor: 4800 },
    { mes: 'Jun', valor: 3800 }
  ]

  return (
    <Card className={cn("hover-lift", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-blue-600" />
          Diárias por Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="mes" 
              className="text-sm"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="valor" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de gráfico de pizza para distribuição de gastos por categoria.
 */
export function GastosDistribuicaoChart({ data, className }) {
  const chartData = data || [
    { name: 'Diárias', value: 45, color: '#3b82f6' },
    { name: 'Passagens', value: 30, color: '#10b981' },
    { name: 'Hospedagem', value: 15, color: '#f59e0b' },
    { name: 'Outros', value: 10, color: '#ef4444' }
  ]

  return (
    <Card className={cn("hover-lift", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-green-600" />
          Distribuição de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentual']}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legenda personalizada */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de gráfico de linha para tendência de gastos ao longo do tempo.
 */
export function TendenciaGastosChart({ data, className }) {
  const chartData = data || [
    { periodo: 'Jan', valor: 4000, meta: 5000 },
    { periodo: 'Fev', valor: 3000, meta: 5000 },
    { periodo: 'Mar', valor: 5000, meta: 5000 },
    { periodo: 'Abr', valor: 2780, meta: 5000 },
    { periodo: 'Mai', valor: 1890, meta: 5000 },
    { periodo: 'Jun', valor: 2390, meta: 5000 }
  ]

  return (
    <Card className={cn("hover-lift", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Tendência de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="periodo" 
              className="text-sm"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${value.toLocaleString()}`, 
                name === 'valor' ? 'Gasto Real' : 'Meta'
              ]}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="meta" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de cards de estatísticas resumidas.
 */
export function StatsCards({ stats, className }) {
  const defaultStats = [
    {
      title: "Total de Diárias",
      value: "R$ 12.450",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "blue"
    },
    {
      title: "Prestações Ativas",
      value: "8",
      change: "+2",
      trend: "up",
      icon: FileText,
      color: "green"
    },
    {
      title: "Servidores",
      value: "24",
      change: "0",
      trend: "neutral",
      icon: Users,
      color: "purple"
    },
    {
      title: "Este Mês",
      value: "R$ 3.200",
      change: "-5%",
      trend: "down",
      icon: Calendar,
      color: "orange"
    }
  ]

  const statsData = stats || defaultStats

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
    }
    return colors[color] || colors.blue
  }

  const getTrendIcon = (trend) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(stat.trend)}
                      <span className={cn(
                        "text-sm font-medium",
                        stat.trend === "up" && "text-green-600 dark:text-green-400",
                        stat.trend === "down" && "text-red-600 dark:text-red-400",
                        stat.trend === "neutral" && "text-gray-600 dark:text-gray-400"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-full",
                  getColorClasses(stat.color)
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/**
 * Componente de gráfico de área para comparação de períodos.
 */
export function ComparacaoPeríodosChart({ data, className }) {
  const chartData = data || [
    { mes: 'Jan', atual: 4000, anterior: 2400 },
    { mes: 'Fev', atual: 3000, anterior: 1398 },
    { mes: 'Mar', atual: 2000, anterior: 9800 },
    { mes: 'Abr', atual: 2780, anterior: 3908 },
    { mes: 'Mai', atual: 1890, anterior: 4800 },
    { mes: 'Jun', atual: 2390, anterior: 3800 }
  ]

  return (
    <Card className={cn("hover-lift", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AreaChart className="h-5 w-5 text-indigo-600" />
          Comparação de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="mes" 
              className="text-sm"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${value.toLocaleString()}`, 
                name === 'atual' ? 'Período Atual' : 'Período Anterior'
              ]}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="anterior"
              stackId="1"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="atual"
              stackId="2"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
