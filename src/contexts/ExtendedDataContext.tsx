import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Tipos para o contexto
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  fullName?: string;
  deleted?: boolean;
  // Compatibilidade com o tipo Cliente
  nome?: string;
  telefone?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  deleted?: boolean;
  // Compatibilidade com o tipo Peca
  nome?: string;
  quantidade?: number;
  preco_custo?: number;
  preco_venda?: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  fullName?: string;
  deleted?: boolean;
  whatsapp?: string;
  age?: string;
}

interface Receipt {
  id: string;
  customerId: string;
  employeeId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalValue: number;
  date: string;
  paymentMethod: string;
  notes?: string;
  deleted?: boolean;
  createdAt?: string;
  totalAmount?: number;
  installmentValue?: number;
  installments?: number;
  warranty?: {
    durationMonths: number;
  };
}

interface ExtendedDataContextType {
  loading: boolean;
  error: string | null;
  receipts: Receipt[];
  customers: Customer[];
  products: Product[];
  employees: Employee[];
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<Receipt>;
  deleteReceipt: (id: string) => Promise<void>;
  searchReceipts: (query: string) => Receipt[];
  searchProducts: (query: string) => Product[];
  searchCustomers: (query: string) => Customer[];
  searchEmployees: (query: string) => Employee[];
  getCustomerById: (id: string) => Customer | undefined;
  getProductById: (id: string) => Product | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id'>>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<Employee>;
  updateEmployee: (id: string, employee: Partial<Omit<Employee, 'id'>>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  generateReport: (startDate: string, endDate: string) => {
    period: string;
    totalReceipts: number;
    totalAmount: number;
    averageWarrantyMonths: number;
    paymentMethodTotals: Record<string, number>;
    sales: {
      totalSales: number;
      totalValue: number;
      byProduct: Array<{
        productId: string;
        productName: string;
        quantity: number;
        totalValue: number;
      }>;
      byPaymentMethod: Record<string, { count: number; value: number }>;
    };
    topCustomers: Array<{
      customerId: string;
      customerName: string;
      purchases: number;
      totalValue: number;
    }>;
    topEmployees: Array<{
      employeeId: string;
      employeeName: string;
      sales: number;
      totalValue: number;
    }>;
  };
}

// Dados de exemplo
const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', fullName: 'João Silva', email: 'joao@example.com', phone: '11999887766', deleted: false },
  { id: '2', name: 'Maria Oliveira', fullName: 'Maria Oliveira', email: 'maria@example.com', phone: '11988776655', deleted: false }
];

const mockProducts: Product[] = [
  { id: '1', name: 'Tela iPhone XR', price: 300, stock: 5, deleted: false },
  { id: '2', name: 'Bateria iPhone 11', price: 180, stock: 8, deleted: false }
];

const mockEmployees: Employee[] = [
  { id: '1', name: 'Carlos Souza', fullName: 'Carlos Souza', email: 'carlos@trueiphones.com', role: 'Técnico', deleted: false },
  { id: '2', name: 'Ana Lima', fullName: 'Ana Lima', email: 'ana@trueiphones.com', role: 'Vendedor', deleted: false }
];

const mockReceipts: Receipt[] = [
  {
    id: '1',
    customerId: '1',
    employeeId: '1',
    items: [{ productId: '1', quantity: 1, price: 300 }],
    totalValue: 300,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cartão de Crédito',
    createdAt: new Date().toISOString(),
    deleted: false,
    installments: 1,
    warranty: { durationMonths: 3 }
  },
  {
    id: '2',
    customerId: '2',
    employeeId: '2',
    items: [{ productId: '2', quantity: 1, price: 180 }],
    totalValue: 180,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Dinheiro',
    createdAt: new Date().toISOString(),
    deleted: false,
    installments: 1,
    warranty: { durationMonths: 1 }
  }
];

// Criação do contexto
export const ExtendedDataContext = createContext<ExtendedDataContextType | undefined>(undefined);

// Provedor do contexto
export function ExtendedDataProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      // Dados já estão carregados com os mocks
    }
  }, [user]);

  // Funções para gerenciar recibos
  const addReceipt = async (receipt: Omit<Receipt, 'id'>): Promise<Receipt> => {
    try {
      setLoading(true);
      // Gerar ID único
      const id = Math.random().toString(36).substring(2, 15);
      const date = receipt.date || new Date().toISOString().split('T')[0];
      const createdAt = receipt.createdAt || date;
      
      const newReceipt: Receipt = { 
        ...receipt, 
        id,
        date,
        createdAt,
        totalValue: receipt.totalAmount || receipt.totalValue || 0
      };
      
      setReceipts(prev => [newReceipt, ...prev]);
      toast.success('Recibo criado com sucesso!');
      return newReceipt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao criar recibo');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReceipt = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setReceipts(prev => prev.filter(receipt => receipt.id !== id));
      toast.success('Recibo excluído com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao excluir recibo');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar clientes
  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const id = Math.random().toString(36).substring(2, 15);
    const newCustomer: Customer = { ...customer, id, deleted: false };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'id'>>): Promise<Customer> => {
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }
    
    const updatedCustomer = { ...customers[index], ...customer };
    const newCustomers = [...customers];
    newCustomers[index] = updatedCustomer;
    setCustomers(newCustomers);
    
    return updatedCustomer;
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Funções para gerenciar produtos
  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const id = Math.random().toString(36).substring(2, 15);
    const newProduct: Product = { ...product, id, deleted: false };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado');
    }
    
    const updatedProduct = { ...products[index], ...product };
    const newProducts = [...products];
    newProducts[index] = updatedProduct;
    setProducts(newProducts);
    
    return updatedProduct;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Funções para gerenciar funcionários
  const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    const id = Math.random().toString(36).substring(2, 15);
    const newEmployee: Employee = { ...employee, id, deleted: false };
    setEmployees(prev => [newEmployee, ...prev]);
    return newEmployee;
  };

  const updateEmployee = async (id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<Employee> => {
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Funcionário não encontrado');
    }
    
    const updatedEmployee = { ...employees[index], ...employee };
    const newEmployees = [...employees];
    newEmployees[index] = updatedEmployee;
    setEmployees(newEmployees);
    
    return updatedEmployee;
  };

  const deleteEmployee = async (id: string): Promise<void> => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
  };

  // Funções de busca
  const searchReceipts = (query: string): Receipt[] => {
    if (!query) return receipts;
    const lowerQuery = query.toLowerCase();
    return receipts.filter(receipt => 
      getCustomerById(receipt.customerId)?.name.toLowerCase().includes(lowerQuery) || 
      receipt.id.toLowerCase().includes(lowerQuery)
    );
  };

  const searchProducts = (query: string): Product[] => {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery)
    );
  };

  const searchCustomers = (query: string): Customer[] => {
    if (!query) return customers;
    const lowerQuery = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) || 
      customer.email.toLowerCase().includes(lowerQuery) || 
      customer.phone.includes(lowerQuery)
    );
  };

  const searchEmployees = (query: string): Employee[] => {
    if (!query) return employees;
    const lowerQuery = query.toLowerCase();
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(lowerQuery) || 
      employee.email.toLowerCase().includes(lowerQuery)
    );
  };

  // Funções auxiliares para obter entidades por ID
  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(employee => employee.id === id);
  };

  // Função para gerar relatórios
  const generateReport = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Fim do dia

    // Filtrar recibos pelo período
    const periodReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.createdAt || receipt.date);
      return receiptDate >= start && receiptDate <= end && !receipt.deleted;
    });

    // Relatório de vendas
    const sales = {
      totalSales: periodReceipts.length,
      totalValue: periodReceipts.reduce((sum, receipt) => sum + (receipt.totalAmount || receipt.totalValue || 0), 0),
      byProduct: [] as Array<{
        productId: string;
        productName: string;
        quantity: number;
        totalValue: number;
      }>,
      byPaymentMethod: {} as Record<string, { count: number; value: number }>
    };

    // Agrupar vendas por produto
    const productSales = new Map<string, { quantity: number; value: number }>();
    periodReceipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const product = getProductById(item.productId);
        if (product) {
          const productId = product.id;
          const existing = productSales.get(productId) || { quantity: 0, value: 0 };
          productSales.set(productId, {
            quantity: existing.quantity + item.quantity,
            value: existing.value + (item.price * item.quantity)
          });
        }
      });
    });

    // Converter para array
    productSales.forEach((data, productId) => {
      const product = getProductById(productId);
      if (product) {
        sales.byProduct.push({
          productId,
          productName: product.name,
          quantity: data.quantity,
          totalValue: data.value
        });
      }
    });

    // Ordenar por valor total (decrescente)
    sales.byProduct.sort((a, b) => b.totalValue - a.totalValue);

    // Agrupar por método de pagamento
    periodReceipts.forEach(receipt => {
      const method = receipt.paymentMethod;
      if (!sales.byPaymentMethod[method]) {
        sales.byPaymentMethod[method] = { count: 0, value: 0 };
      }
      sales.byPaymentMethod[method].count += 1;
      sales.byPaymentMethod[method].value += (receipt.totalAmount || receipt.totalValue || 0);
    });

    // Converter byPaymentMethod para paymentMethodTotals (apenas os valores)
    const paymentMethodTotals: Record<string, number> = {};
    Object.entries(sales.byPaymentMethod).forEach(([method, data]) => {
      paymentMethodTotals[method] = data.value;
    });

    // Top clientes
    const customerSales = new Map<string, { purchases: number; value: number }>();
    periodReceipts.forEach(receipt => {
      const customerId = receipt.customerId;
      const existing = customerSales.get(customerId) || { purchases: 0, value: 0 };
      customerSales.set(customerId, {
        purchases: existing.purchases + 1,
        value: existing.value + (receipt.totalAmount || receipt.totalValue || 0)
      });
    });

    const topCustomers = Array.from(customerSales.entries()).map(([customerId, data]) => {
      const customer = getCustomerById(customerId);
      return {
        customerId,
        customerName: customer ? (customer.fullName || customer.name) : 'Cliente desconhecido',
        purchases: data.purchases,
        totalValue: data.value
      };
    });
    
    // Ordenar por valor total (decrescente)
    topCustomers.sort((a, b) => b.totalValue - a.totalValue);

    // Top funcionários
    const employeeSales = new Map<string, { sales: number; value: number }>();
    periodReceipts.forEach(receipt => {
      const employeeId = receipt.employeeId;
      const existing = employeeSales.get(employeeId) || { sales: 0, value: 0 };
      employeeSales.set(employeeId, {
        sales: existing.sales + 1,
        value: existing.value + (receipt.totalAmount || receipt.totalValue || 0)
      });
    });

    const topEmployees = Array.from(employeeSales.entries()).map(([employeeId, data]) => {
      const employee = getEmployeeById(employeeId);
      return {
        employeeId,
        employeeName: employee ? (employee.fullName || employee.name) : 'Funcionário desconhecido',
        sales: data.sales,
        totalValue: data.value
      };
    });
    
    // Ordenar por valor total (decrescente)
    topEmployees.sort((a, b) => b.totalValue - a.totalValue);

    // Calcular média de garantia (em meses)
    const totalMonths = periodReceipts.reduce((sum, receipt) => sum + (receipt.warranty?.durationMonths || 0), 0);
    const averageWarrantyMonths = periodReceipts.length > 0 ? totalMonths / periodReceipts.length : 0;

    return {
      period: `${startDate} - ${endDate}`,
      totalReceipts: periodReceipts.length,
      totalAmount: sales.totalValue,
      averageWarrantyMonths: averageWarrantyMonths,
      paymentMethodTotals,
      sales,
      topCustomers,
      topEmployees
    };
  };

  return (
    <ExtendedDataContext.Provider
      value={{
        loading,
        error,
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
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        generateReport
      }}
    >
      {children}
    </ExtendedDataContext.Provider>
  );
} 