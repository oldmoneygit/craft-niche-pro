import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const FinancialDashboard = () => {
  const { financialData } = mockNutriData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "status-active";
      case "Pendente": return "status-expiring";
      case "Atrasado": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTransactionColor = (type: string) => {
    return type === "Receita" ? "text-success" : "text-destructive";
  };

  const pieData = [
    { name: "Receitas", value: financialData.monthlyRevenue, color: "#22c55e" },
    { name: "Despesas", value: financialData.monthlyExpenses, color: "#ef4444" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Financeiro</h2>
          <p className="text-muted-foreground">Controle suas receitas, despesas e lucratividade</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="action-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialData.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-white/80">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialData.monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">-5%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-success/20 bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Lucro Líquido</CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {financialData.monthlyProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {((financialData.monthlyProfit / financialData.monthlyRevenue) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-warning/20 bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-warning">A Receber</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {financialData.pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData.pendingPayments.length} pendências
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas (Últimos 5 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="#22c55e" name="Receitas" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Receitas vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm">Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Contas a Receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialData.pendingPayments.map((payment) => (
              <div 
                key={payment.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  payment.overdue ? 'border-destructive/20 bg-destructive/5' : 'border-warning/20 bg-warning/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    payment.overdue ? 'bg-destructive/20' : 'bg-warning/20'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      payment.overdue ? 'text-destructive' : 'text-warning'
                    }`} />
                  </div>
                  
                  <div>
                    <div className="font-medium">{payment.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.plan} • Venc: {payment.dueDate}
                      {payment.overdue && (
                        <span className="text-destructive font-medium ml-2">• Atrasado</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold">R$ {payment.amount}</div>
                  </div>
                  <Button size="sm" className="action-success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Pago
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialData.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTransactionColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`text-right font-medium ${getTransactionColor(transaction.type)}`}>
                      R$ {Math.abs(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;