import React, { useState, useEffect } from 'react';
import { useExtendedData } from '../hooks/useExtendedData';
import { Search, PlusCircle, FileText, Trash2, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../utils/notifications';
import { generateReceiptPDF } from '../utils/pdf';
import toast from 'react-hot-toast';

function Receipts() {
  const {
    receipts,
    customers,
    products,
    employees,
    addReceipt,
    deleteReceipt,
    searchReceipts,
    searchProducts,
    searchCustomers,
    searchEmployees,
    getCustomerById,
    getProductById,
    getEmployeeById,
  } = useExtendedData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [formData, setFormData] = useState({
    customerId: '',
    employeeId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
    paymentMethod: 'Dinheiro',
    installments: 1,
    warranty: { durationMonths: 0 },
    date: new Date().toISOString().split('T')[0], // Campo de data adicionado
  });

  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>([]);

  useEffect(() => {
    if (productSearchQuery) {
      const results = searchProducts(productSearchQuery);
      setFilteredProducts(results);
    } else {
      setFilteredProducts(products.filter(p => !p.deleted));
    }
  }, [productSearchQuery, products, searchProducts]);

  useEffect(() => {
    if (customerSearchQuery) {
      const results = searchCustomers(customerSearchQuery);
      setFilteredCustomers(results);
    } else {
      setFilteredCustomers(customers.filter(c => !c.deleted));
    }
  }, [customerSearchQuery, customers, searchCustomers]);

  useEffect(() => {
    if (employeeSearchQuery) {
      const results = searchEmployees(employeeSearchQuery);
      setFilteredEmployees(results);
    } else {
      setFilteredEmployees(employees.filter(e => !e.deleted));
    }
  }, [employeeSearchQuery, employees, searchEmployees]);

  const filteredReceipts = searchQuery ? searchReceipts(searchQuery) : receipts.filter(r => !r.deleted);

  const calculateTotals = () => {
    const total = formData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const installmentValue = formData.installments > 0 ? total / formData.installments : total;
    return { total, installmentValue };
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Validar a data (deve ser a partir de 01/01/2024)
  const selectedDate = new Date(formData.date);
  const minDate = new Date('2024-01-01');
  if (selectedDate < minDate) {
    toast.error('A data do recibo deve ser a partir de 01/01/2024.');
    return;
  }

  try {
    const { total, installmentValue } = calculateTotals();
    addReceipt({
      ...formData,
      totalAmount: total,
      installmentValue,
      createdAt: formData.date, // Usar a data selecionada no formulário
    });
    toast.success('Recibo criado com sucesso!');
    setShowAddModal(false);
    setFormData({
      customerId: '',
      employeeId: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
      paymentMethod: 'Dinheiro',
      installments: 1,
      warranty: { durationMonths: 0 },
      date: new Date().toISOString().split('T')[0], // Resetar a data ao fechar o modal
    });
    setSelectedCustomerName('');
    setSelectedEmployeeName('');
    setSelectedProductNames([]);
  } catch (error) {
    toast.error('Erro ao criar recibo');
  }
};

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este recibo?')) {
      deleteReceipt(id);
      toast.success('Recibo excluído com sucesso!');
    }
  };

  const handlePrint = (receipt: typeof receipts[0]) => {
  const customer = getCustomerById(receipt.customerId);
  const employee = getEmployeeById(receipt.employeeId);
  if (!customer) {
    toast.error('Cliente não encontrado');
    return;
  }
  if (!employee) {
    toast.error('Funcionário não encontrado');
    return;
  }

  const receiptProducts = receipt.items.map(item => {
    const product = getProductById(item.productId);
    return {
      name: product?.name || 'Produto não encontrado',
      quantity: item.quantity,
      price: item.price,
    };
  });

  const formattedDate = new Date(receipt.createdAt).toLocaleDateString('pt-BR'); // Formatar a data do recibo
  const fileName = `recibo ${customer.fullName}-${formattedDate}.pdf`; // Nome do arquivo

  const doc = generateReceiptPDF(receipt, customer.fullName, receiptProducts, employee.fullName);
  doc.save(fileName); // Salvar com o nome formatado
  toast.success('PDF gerado com sucesso!');
};

  const handleWhatsApp = (receipt: typeof receipts[0]) => {
    const customer = getCustomerById(receipt.customerId);
    if (!customer?.phone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    const phone = customer.phone.replace(/\D/g, '');
    const message = `Olá ${customer.fullName}, segue o recibo da sua compra:`;
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isFormValid = () => {
    return (
      formData.customerId &&
      formData.employeeId &&
      formData.items.every(item => item.productId && item.quantity > 0 && item.price > 0)
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Recibos</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Recibo
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar recibos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-none focus:ring-0 text-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Garantia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => {
                const customer = getCustomerById(receipt.customerId);
                const employee = getEmployeeById(receipt.employeeId);
                return (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer?.fullName || 'Cliente não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee?.fullName || 'Vendedor não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(receipt.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {receipt.items.map((item, index) => {
                          const product = getProductById(item.productId);
                          return (
                            <div key={index} className="text-xs">
                              <div className="font-medium">{product?.name}</div>
                              <div className="text-gray-400">
                                {product?.memory && `${product.memory} - `}
                                {product?.color && `${product.color} - `}
                                {item.quantity}x {formatCurrency(item.price)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.paymentMethod}
                      {receipt.installments > 1 && ` (${receipt.installments}x)`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.warranty
                        ? `${receipt.warranty.durationMonths} meses`
                        : 'Sem garantia'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrint(receipt)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                        title="Gerar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(receipt)}
                        className="text-green-600 hover:text-green-900 mr-4 transition-colors duration-200"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(receipt.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Novo Recibo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {customerSearchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              setFormData({ ...formData, customerId: customer.id });
                              setSelectedCustomerName(customer.fullName);
                              setCustomerSearchQuery('');
                            }}
                          >
                            <div className="font-medium">{customer.fullName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedCustomerName && (
                    <div className="mt-2 text-sm text-gray-700">
                      Cliente selecionado: <strong>{selectedCustomerName}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendedor</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar vendedor..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {employeeSearchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              setFormData({ ...formData, employeeId: employee.id });
                              setSelectedEmployeeName(employee.fullName);
                              setEmployeeSearchQuery('');
                            }}
                          >
                            <div className="font-medium">{employee.fullName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedEmployeeName && (
                    <div className="mt-2 text-sm text-gray-700">
                      Vendedor selecionado: <strong>{selectedEmployeeName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Itens</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {productSearchQuery && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                              onClick={() => {
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...item,
                                  productId: product.id,
                                  price: product.defaultPrice,
                                };
                                setFormData({ ...formData, items: newItems });
                                setSelectedProductNames((prev) => {
                                  const newNames = [...prev];
                                  newNames[index] = product.name;
                                  return newNames;
                                });
                                setProductSearchQuery('');
                              }}
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.memory && `${product.memory} - `}
                                {product.color && `${product.color} - `}
                                {formatCurrency(product.defaultPrice)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedProductNames[index] && (
                      <div className="mt-2 text-sm text-gray-700">
                        Produto selecionado: <strong>{selectedProductNames[index]}</strong>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index] = {
                            ...item,
                            quantity: parseInt(e.target.value),
                          };
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Qtd"
                      />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index] = {
                            ...item,
                            price: parseFloat(e.target.value),
                          };
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Preço"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.items.filter((_, i) => i !== index);
                          setFormData({ ...formData, items: newItems });
                          setSelectedProductNames((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="px-2 py-1 text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      items: [...formData.items, { productId: '', quantity: 1, price: 0 }],
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  + Adicionar item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Forma de Pagamento
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>

                {formData.paymentMethod === 'Cartão de Crédito' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de Parcelas
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.installments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installments: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data do Recibo
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min="2024-01-01" // Data mínima permitida
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Garantia (meses)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.warranty.durationMonths}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warranty: { durationMonths: parseInt(e.target.value) },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotals().total)}</span>
                </div>
                {formData.installments > 1 && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{formData.installments}x de:</span>
                    <span>{formatCurrency(calculateTotals().installmentValue)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Criar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipts;