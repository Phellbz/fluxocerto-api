export type DefaultCategory = {
  name: string;
  groupName: string;
  flowType: 'expense' | 'income' | 'transfer';
  affectsCash: boolean;
  isActive: boolean;
};

// Lista padrão (UTF-8)
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Despesas Administrativas
  { name: 'Advogados', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Água e Esgoto', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Aluguel', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Auditorias', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Contabilidade', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Energia Elétrica', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'IPTU', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Limpeza', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Manutenção de Imobilizado', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Material de Escritório', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Seguros', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Softwares de gestão adm', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Telefonia', groupName: 'Despesas Administrativas', flowType: 'expense', affectsCash: true, isActive: true },

  // Despesas com Pessoal
  { name: '13º Salário', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Adiantamento', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Assistência Médica', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Custos Viagens', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Diárias Viagem', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Férias', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'FGTS', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Horas Extras', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Hospedagem', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'INSS', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'IRRF', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Outros Benefícios', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Pagamento de Colaboradores Terceirizados', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Pensão Alimentícia', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Rescisões', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Salários', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Seguro de Vida', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Treinamentos', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Vale Refeição', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Vale Transporte', groupName: 'Despesas com Pessoal', flowType: 'expense', affectsCash: true, isActive: true },

  // Despesas Diretas
  { name: 'Comissões', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: "Compra de EPI's", groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Compra de Ferramentas', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Compras de Materiais', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Compras de Mercadorias para Revenda', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Frete / Transporte de materiais', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Locação', groupName: 'Despesas Diretas', flowType: 'expense', affectsCash: true, isActive: true },

  // Despesas Financeiras / Bancos
  { name: 'IOF Banco', groupName: 'Despesas Financeiras / Bancos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Juros sobre Empréstimos', groupName: 'Despesas Financeiras / Bancos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Multas Bancárias', groupName: 'Despesas Financeiras / Bancos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Pagamento de Empréstimos', groupName: 'Despesas Financeiras / Bancos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Tarifas Bancárias', groupName: 'Despesas Financeiras / Bancos', flowType: 'expense', affectsCash: true, isActive: true },

  // Impostos e Taxas
  { name: 'Contribuição Social', groupName: 'Impostos e Taxas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'ISS', groupName: 'Impostos e Taxas', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Simples Nacional (DAS)', groupName: 'Impostos e Taxas', flowType: 'expense', affectsCash: true, isActive: true },

  // Investimento
  { name: 'Compra de Máquinas e Equipamentos', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Compra de Veículos', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Comunicação', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Equipamentos de Informática', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Móveis e Utensílios', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Reforma em Instalações', groupName: 'Investimento', flowType: 'expense', affectsCash: true, isActive: true },

  // Outras Despesas
  { name: 'Pró-labore', groupName: 'Outras Despesas', flowType: 'expense', affectsCash: true, isActive: true },

  // Veículos
  { name: 'Combustível Geral', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Estacionamento', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Manutenção Veículos', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Multas Veículos', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Reembolso Deslocamento (Uber)', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },
  { name: 'Taxas Detran', groupName: 'Veículos', flowType: 'expense', affectsCash: true, isActive: true },

  // Devoluções / Entradas / Receitas
  { name: 'Devoluções de Compra de Material de Consumo', groupName: 'Devoluções', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Demais Entradas', groupName: 'Outras Entradas', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Empréstimos Bancários', groupName: 'Outras Entradas', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Venda de Ativos', groupName: 'Outras Entradas', flowType: 'income', affectsCash: true, isActive: true },

  { name: 'Clientes - Revenda de Mercadoria', groupName: 'Receitas Diretas', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Contrato Fixo', groupName: 'Receitas Diretas', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Obra - Serviços Prestados', groupName: 'Receitas Diretas', flowType: 'income', affectsCash: true, isActive: true },
  { name: 'Serviços Spot', groupName: 'Receitas Diretas', flowType: 'income', affectsCash: true, isActive: true },

  { name: 'Rendimentos de Aplicações', groupName: 'Receitas Indiretas', flowType: 'income', affectsCash: true, isActive: true },

  // Transferências
  { name: 'Transf Entre Contas', groupName: 'Outras Despesas', flowType: 'transfer', affectsCash: false, isActive: true },
  { name: 'Movimentação Entre Contas', groupName: 'Outras Entradas', flowType: 'transfer', affectsCash: false, isActive: true },
];
