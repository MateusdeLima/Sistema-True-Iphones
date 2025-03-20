import type { Cliente, Servico, Peca } from './database.types';

export interface DataContextState {
  loading: boolean;
  error: string | null;
  clientes: Cliente[];
  servicos: Servico[];
  pecas: Peca[];
}

export interface DataContextType extends DataContextState {
  carregarDados: () => Promise<void>;
  criarCliente: (cliente: Omit<Cliente, 'id' | 'created_at'>) => Promise<Cliente>;
  atualizarCliente: (id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at'>>) => Promise<Cliente>;
  deletarCliente: (id: string) => Promise<void>;
  criarServico: (servico: Omit<Servico, 'id' | 'created_at'>) => Promise<Servico>;
  atualizarServico: (id: string, servico: Partial<Omit<Servico, 'id' | 'created_at'>>) => Promise<Servico>;
  deletarServico: (id: string) => Promise<void>;
  criarPeca: (peca: Omit<Peca, 'id' | 'created_at'>) => Promise<Peca>;
  atualizarPeca: (id: string, peca: Partial<Omit<Peca, 'id' | 'created_at'>>) => Promise<Peca>;
  deletarPeca: (id: string) => Promise<void>;
}
