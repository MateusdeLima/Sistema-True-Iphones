import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useData } from '../hooks/useData';
import { formatCurrency } from '../utils/notifications';
import { BarChart2, Users, Package, Receipt as ReceiptIcon, Loader } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const { customers, products, receipts, loading, error } = useData();
  const [periodoAtual] = useState({
    inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    fim: new Date().toISOString()
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos para o dashboard
  const recibosUltimos30Dias = receipts.filter((r) => {
    const data = new Date(r.createdAt || r.date);
    const dataInicio = new Date(periodoAtual.inicio);
    return data >= dataInicio;
  });

  const valorTotalRecibos = recibosUltimos30Dias.reduce((acc, r) => acc + (r.totalAmount || r.totalValue), 0);

  // Cálculo dos recibos por método de pagamento
  const recibosPorMetodo = recibosUltimos30Dias.reduce((acc, recibo) => {
    const metodo = recibo.paymentMethod;
    acc[metodo] = (acc[metodo] || 0) + (recibo.totalAmount || recibo.totalValue);
    return acc;
  }, {} as Record<string, number>);

  const dadosGrafico = {
    labels: Object.keys(recibosPorMetodo).map(metodo => metodo),
    datasets: [
      {
        label: 'Valor por Método de Pagamento',
        data: Object.values(recibosPorMetodo),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card de Serviços */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <ReceiptIcon className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Últimos 30 dias</span>
          </div>
          <h3 className="text-lg font-semibold">Serviços</h3>
          <p className="text-2xl font-bold text-blue-600">{recibosUltimos30Dias.length}</p>
        </div>

        {/* Card de Clientes */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-lg font-semibold">Clientes</h3>
          <p className="text-2xl font-bold text-green-600">{customers.length}</p>
        </div>

        {/* Card de Peças */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Em Estoque</span>
          </div>
          <h3 className="text-lg font-semibold">Peças</h3>
          <p className="text-2xl font-bold text-purple-600">{products.length}</p>
        </div>

        {/* Card de Faturamento */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <BarChart2 className="w-8 h-8 text-yellow-500" />
            <span className="text-sm text-gray-500">Últimos 30 dias</span>
          </div>
          <h3 className="text-lg font-semibold">Faturamento</h3>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(valorTotalRecibos)}</p>
        </div>
      </div>

      {/* Gráfico de Status dos Serviços */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Status dos Serviços</h2>
        <div className="w-full max-w-md mx-auto">
          <Pie data={dadosGrafico} options={{
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }} />
        </div>
      </div>

      {/* Lista de Serviços Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Últimos Recibos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recibosUltimos30Dias.slice(0, 5).map((recibo) => {
                const cliente = customers.find(c => c.id === recibo.customerId);
                return (
                  <tr key={recibo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente?.name || 'Cliente não encontrado'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Recibo #{recibo.id.substring(0, 6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {recibo.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(recibo.totalAmount || recibo.totalValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;