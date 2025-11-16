"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dados mockados para os gráficos
const revenueData = [
  { name: "Jan", valor: 45000, emprestimos: 125 },
  { name: "Fev", valor: 52000, emprestimos: 142 },
  { name: "Mar", valor: 48000, emprestimos: 135 },
  { name: "Abr", valor: 61000, emprestimos: 168 },
  { name: "Mai", valor: 55000, emprestimos: 152 },
  { name: "Jun", valor: 67000, emprestimos: 185 },
];

const statusData = [
  { name: "Em Dia", value: 65, color: "#10b981" },
  { name: "Atrasados", value: 20, color: "#f59e0b" },
  { name: "Quitados", value: 15, color: "#3b82f6" },
];

const topClients = [
  { name: "João Silva", valor: "R$ 15.000", status: "Em dia" },
  { name: "Maria Santos", valor: "R$ 12.500", status: "Em dia" },
  { name: "Carlos Lima", valor: "R$ 10.000", status: "Atrasado" },
  { name: "Ana Costa", valor: "R$ 8.500", status: "Em dia" },
  { name: "Pedro Alves", valor: "R$ 7.200", status: "Em dia" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do seu negócio de empréstimos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value="R$ 328.000"
          description="Acumulado de 6 meses"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatsCard
          title="Empréstimos Ativos"
          value="185"
          description="Contratos em andamento"
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="Clientes Ativos"
          value="142"
          description="Clientes cadastrados"
          icon={Users}
          trend={{ value: 5.1, isPositive: true }}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="Taxa de Inadimplência"
          value="12%"
          description="Empréstimos em atraso"
          icon={AlertCircle}
          trend={{ value: 2.3, isPositive: false }}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Receita Mensal</CardTitle>
            <CardDescription>
              Evolução da receita nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Valor (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Empréstimos Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Empréstimos por Mês
            </CardTitle>
            <CardDescription>
              Quantidade de empréstimos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="emprestimos"
                  fill="#10b981"
                  name="Empréstimos"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status and Top Clients Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Status dos Empréstimos
            </CardTitle>
            <CardDescription>Distribuição atual do portfólio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Maiores Clientes</CardTitle>
            <CardDescription>
              Top 5 clientes por valor emprestado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500">{client.valor}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === "Em dia"
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {client.status === "Em dia" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
