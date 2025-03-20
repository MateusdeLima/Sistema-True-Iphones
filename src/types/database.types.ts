export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  created_at: string;
}

export interface Servico {
  id: string;
  cliente_id: string;
  dispositivo: string;
  modelo: string;
  problema: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  valor: number;
  observacoes?: string | null;
  data_entrada: string;
  data_conclusao?: string | null;
  created_at: string;
}

export interface Peca {
  id: string;
  nome: string;
  quantidade: number;
  preco_custo: number;
  preco_venda: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: Cliente;
        Insert: Omit<Cliente, 'id' | 'created_at'>;
        Update: Partial<Omit<Cliente, 'id' | 'created_at'>>;
      };
      servicos: {
        Row: Servico;
        Insert: Omit<Servico, 'id' | 'created_at'>;
        Update: Partial<Omit<Servico, 'id' | 'created_at'>>;
      };
      pecas: {
        Row: Peca;
        Insert: Omit<Peca, 'id' | 'created_at'>;
        Update: Partial<Omit<Peca, 'id' | 'created_at'>>;
      };
    };
  };
}
