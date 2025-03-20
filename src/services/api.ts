import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import type { Cliente, Servico, Peca } from '../types/database.types';

type Tables = Database['public']['Tables'];
type ClienteInsert = Tables['clientes']['Insert'];
type ClienteUpdate = Tables['clientes']['Update'];
type ServicoInsert = Tables['servicos']['Insert'];
type ServicoUpdate = Tables['servicos']['Update'];
type PecaInsert = Tables['pecas']['Insert'];
type PecaUpdate = Tables['pecas']['Update'];

// Gerador de IDs únicos simples
const gerarId = () => Math.random().toString(36).substring(2, 15);

// Armazenamento local para modo offline/desenvolvimento
const storage = {
  clientes: [
    { id: '1', nome: 'João Silva', telefone: '11999887766', email: 'joao@example.com', created_at: new Date().toISOString() },
    { id: '2', nome: 'Maria Oliveira', telefone: '11988776655', email: 'maria@example.com', created_at: new Date().toISOString() }
  ] as Cliente[],
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
  ] as Servico[],
  pecas: [
    { id: '1', nome: 'Tela iPhone XR', quantidade: 5, preco_custo: 180, preco_venda: 300, created_at: new Date().toISOString() },
    { id: '2', nome: 'Bateria iPhone 11', quantidade: 8, preco_custo: 100, preco_venda: 180, created_at: new Date().toISOString() }
  ] as Peca[]
};

// Funções auxiliares para dados mockados
const usarDadosMockados = (error: Error | unknown, operacao: string) => {
  console.warn(`Erro na operação ${operacao}:`, error);
  console.info('Usando dados mockados como fallback');
  return true; // Em produção, seria bom ter uma lógica mais sofisticada aqui
};

export const clientesApi = {
  async listar(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'listar clientes')) {
        return storage.clientes;
      }
      throw error;
    }
  },

  async criar(cliente: ClienteInsert): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'criar cliente')) {
        const novoCliente: Cliente = {
          id: gerarId(),
          created_at: new Date().toISOString(),
          ...cliente
        };
        storage.clientes.unshift(novoCliente);
        return novoCliente;
      }
      throw error;
    }
  },

  async atualizar(id: string, cliente: ClienteUpdate): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'atualizar cliente')) {
        const index = storage.clientes.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente não encontrado');
        
        const clienteAtualizado = {
          ...storage.clientes[index],
          ...cliente
        };
        storage.clientes[index] = clienteAtualizado;
        return clienteAtualizado;
      }
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      if (usarDadosMockados(error, 'deletar cliente')) {
        const index = storage.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
          storage.clientes.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }
};

export const servicosApi = {
  async listar(): Promise<Servico[]> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'listar serviços')) {
        return storage.servicos;
      }
      throw error;
    }
  },

  async criar(servico: ServicoInsert): Promise<Servico> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert(servico)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'criar serviço')) {
        const novoServico: Servico = {
          id: gerarId(),
          created_at: new Date().toISOString(),
          ...servico
        };
        storage.servicos.unshift(novoServico);
        return novoServico;
      }
      throw error;
    }
  },

  async atualizar(id: string, servico: ServicoUpdate): Promise<Servico> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'atualizar serviço')) {
        const index = storage.servicos.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Serviço não encontrado');
        
        const servicoAtualizado = {
          ...storage.servicos[index],
          ...servico
        };
        storage.servicos[index] = servicoAtualizado;
        return servicoAtualizado;
      }
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      if (usarDadosMockados(error, 'deletar serviço')) {
        const index = storage.servicos.findIndex(s => s.id === id);
        if (index !== -1) {
          storage.servicos.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }
};

export const pecasApi = {
  async listar(): Promise<Peca[]> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'listar peças')) {
        return storage.pecas;
      }
      throw error;
    }
  },

  async criar(peca: PecaInsert): Promise<Peca> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .insert(peca)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'criar peça')) {
        const novaPeca: Peca = {
          id: gerarId(),
          created_at: new Date().toISOString(),
          ...peca
        };
        storage.pecas.unshift(novaPeca);
        return novaPeca;
      }
      throw error;
    }
  },

  async atualizar(id: string, peca: PecaUpdate): Promise<Peca> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .update(peca)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      if (usarDadosMockados(error, 'atualizar peça')) {
        const index = storage.pecas.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Peça não encontrada');
        
        const pecaAtualizada = {
          ...storage.pecas[index],
          ...peca
        };
        storage.pecas[index] = pecaAtualizada;
        return pecaAtualizada;
      }
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pecas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      if (usarDadosMockados(error, 'deletar peça')) {
        const index = storage.pecas.findIndex(p => p.id === id);
        if (index !== -1) {
          storage.pecas.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  }
};
