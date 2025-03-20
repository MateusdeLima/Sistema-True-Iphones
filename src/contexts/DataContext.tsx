import { createContext, useState, useEffect, type ReactNode } from 'react';
import { clientesApi, servicosApi, pecasApi } from '../services/api';
import type { Cliente, Servico, Peca } from '../types/database.types';
import type { DataContextType, DataContextState } from '../types/context.types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export const DataContext = createContext<DataContextType | undefined>(undefined);

const initialState: DataContextState = {
  loading: true,
  error: null,
  clientes: [],
  servicos: [],
  pecas: []
};

// Dados de exemplo para desenvolvimento local
const dadosExemplo = {
  clientes: [
    { id: '1', nome: 'João Silva', telefone: '11999887766', email: 'joao@example.com', created_at: new Date().toISOString() },
    { id: '2', nome: 'Maria Oliveira', telefone: '11988776655', email: 'maria@example.com', created_at: new Date().toISOString() }
  ],
  servicos: [
    { 
      id: '1', 
      cliente_id: '1', 
      dispositivo: 'iPhone', 
      modelo: 'XR', 
      problema: 'Tela quebrada', 
      status: 'pendente' as const, 
      valor: 350, 
      data_entrada: new Date().toISOString(), 
      created_at: new Date().toISOString() 
    },
    { 
      id: '2', 
      cliente_id: '2', 
      dispositivo: 'iPhone', 
      modelo: '11', 
      problema: 'Bateria fraca', 
      status: 'em_andamento' as const, 
      valor: 200, 
      data_entrada: new Date().toISOString(), 
      created_at: new Date().toISOString() 
    }
  ],
  pecas: [
    { id: '1', nome: 'Tela iPhone XR', quantidade: 5, preco_custo: 180, preco_venda: 300, created_at: new Date().toISOString() },
    { id: '2', nome: 'Bateria iPhone 11', quantidade: 8, preco_custo: 100, preco_venda: 180, created_at: new Date().toISOString() }
  ]
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataContextState>(initialState);
  const { user } = useAuth();

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  async function carregarDados() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Tente carregar dados do Supabase
      try {
        const [clientesData, servicosData, pecasData] = await Promise.all([
          clientesApi.listar(),
          servicosApi.listar(),
          pecasApi.listar()
        ]);

        setState(prev => ({
          ...prev,
          loading: false,
          clientes: clientesData,
          servicos: servicosData,
          pecas: pecasData
        }));
      } catch (error) {
        console.warn('Erro ao carregar dados do Supabase, usando dados de exemplo:', error);
        // Se houver erro, use dados de exemplo
        setState(prev => ({
          ...prev,
          loading: false,
          clientes: dadosExemplo.clientes,
          servicos: dadosExemplo.servicos,
          pecas: dadosExemplo.pecas
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Falha ao carregar dados. Por favor, tente novamente.' 
      }));
      
      toast.error('Erro ao carregar dados');
    }
  }

  // Funções de CRUD para Clientes
  async function criarCliente(cliente: Omit<Cliente, 'id' | 'created_at'>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const novoCliente = await clientesApi.criar(cliente);
      setState(prev => ({
        ...prev,
        loading: false,
        clientes: [...prev.clientes, novoCliente]
      }));
      toast.success('Cliente criado com sucesso!');
      return novoCliente;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao criar cliente'
      }));
      toast.error('Erro ao criar cliente');
      throw error;
    }
  }

  async function atualizarCliente(id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at'>>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const clienteAtualizado = await clientesApi.atualizar(id, cliente);
      setState(prev => ({
        ...prev,
        loading: false,
        clientes: prev.clientes.map(c => c.id === id ? clienteAtualizado : c)
      }));
      toast.success('Cliente atualizado com sucesso!');
      return clienteAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao atualizar cliente'
      }));
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  }

  async function deletarCliente(id: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await clientesApi.deletar(id);
      setState(prev => ({
        ...prev,
        loading: false,
        clientes: prev.clientes.filter(c => c.id !== id)
      }));
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao excluir cliente'
      }));
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  }

  // Funções de CRUD para Serviços
  async function criarServico(servico: Omit<Servico, 'id' | 'created_at'>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const novoServico = await servicosApi.criar(servico);
      setState(prev => ({
        ...prev,
        loading: false,
        servicos: [...prev.servicos, novoServico]
      }));
      toast.success('Serviço criado com sucesso!');
      return novoServico;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao criar serviço'
      }));
      toast.error('Erro ao criar serviço');
      throw error;
    }
  }

  async function atualizarServico(id: string, servico: Partial<Omit<Servico, 'id' | 'created_at'>>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const servicoAtualizado = await servicosApi.atualizar(id, servico);
      setState(prev => ({
        ...prev,
        loading: false,
        servicos: prev.servicos.map(s => s.id === id ? servicoAtualizado : s)
      }));
      toast.success('Serviço atualizado com sucesso!');
      return servicoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao atualizar serviço'
      }));
      toast.error('Erro ao atualizar serviço');
      throw error;
    }
  }

  async function deletarServico(id: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await servicosApi.deletar(id);
      setState(prev => ({
        ...prev,
        loading: false,
        servicos: prev.servicos.filter(s => s.id !== id)
      }));
      toast.success('Serviço excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao excluir serviço'
      }));
      toast.error('Erro ao excluir serviço');
      throw error;
    }
  }

  // Funções de CRUD para Peças
  async function criarPeca(peca: Omit<Peca, 'id' | 'created_at'>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const novaPeca = await pecasApi.criar(peca);
      setState(prev => ({
        ...prev,
        loading: false,
        pecas: [...prev.pecas, novaPeca]
      }));
      toast.success('Peça criada com sucesso!');
      return novaPeca;
    } catch (error) {
      console.error('Erro ao criar peça:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao criar peça'
      }));
      toast.error('Erro ao criar peça');
      throw error;
    }
  }

  async function atualizarPeca(id: string, peca: Partial<Omit<Peca, 'id' | 'created_at'>>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const pecaAtualizada = await pecasApi.atualizar(id, peca);
      setState(prev => ({
        ...prev,
        loading: false,
        pecas: prev.pecas.map(p => p.id === id ? pecaAtualizada : p)
      }));
      toast.success('Peça atualizada com sucesso!');
      return pecaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar peça:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao atualizar peça'
      }));
      toast.error('Erro ao atualizar peça');
      throw error;
    }
  }

  async function deletarPeca(id: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await pecasApi.deletar(id);
      setState(prev => ({
        ...prev,
        loading: false,
        pecas: prev.pecas.filter(p => p.id !== id)
      }));
      toast.success('Peça excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir peça:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao excluir peça'
      }));
      toast.error('Erro ao excluir peça');
      throw error;
    }
  }

  return (
    <DataContext.Provider
      value={{
        ...state,
        carregarDados,
        criarCliente,
        atualizarCliente,
        deletarCliente,
        criarServico,
        atualizarServico,
        deletarServico,
        criarPeca,
        atualizarPeca,
        deletarPeca
      }}
    >
      {children}
    </DataContext.Provider>
  );
}