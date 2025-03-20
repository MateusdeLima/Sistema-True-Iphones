import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from './notifications';
import type { Receipt } from '../contexts/DataContext';

const COMPANY_INFO = {
  name: 'True Iphones',
  cnpj: '45.272.057/0001-88', // CNPJ formatado
  address: 'Rua Bom Pastor, 2100 - Ipiranga', // Endereço
  city: 'São Paulo - SP', // Cidade
  phone: '(11) 97851-3496', // Telefone formatado
};

// Função para obter o próximo número de recibo
function getNextReceiptNumber() {
  let lastReceiptNumber = localStorage.getItem('lastReceiptNumber');
  if (!lastReceiptNumber) {
    lastReceiptNumber = '0';
  }
  const nextReceiptNumber = parseInt(lastReceiptNumber, 10) + 1;
  localStorage.setItem('lastReceiptNumber', nextReceiptNumber.toString());
  return nextReceiptNumber;
}

export function generateReceiptPDF(
  receipt: Receipt,
  customerName: string,
  products: Array<{ name: string; quantity: number; price: number }>,
  employeeName: string
) {
  const doc = new jsPDF();

  // Adicionar marca d'água com a logo da Apple
const appleLogo = new Image();
appleLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'; // URL da logo da Apple

appleLogo.onload = () => {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      doc.addImage(appleLogo, 'PNG', 20 + i * 40, 20 + j * 40, 30, 30); // Ajuste os valores conforme necessário
    }
  }
};

  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);

  // Cabeçalho
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102); // Azul escuro
  doc.text('TRUE IPHONES', 105, 20, { align: 'center' });

  // Informações da empresa
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102); // Cinza escuro
  doc.text(`CNPJ: ${COMPANY_INFO.cnpj}`, 105, 30, { align: 'center' });
  doc.text(COMPANY_INFO.address, 105, 35, { align: 'center' });
  doc.text(COMPANY_INFO.city, 105, 40, { align: 'center' });
  doc.text(`Telefone: ${COMPANY_INFO.phone}`, 105, 45, { align: 'center' });

  // Título do recibo
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102); // Azul escuro
  doc.text('Recibo de Venda', 105, 60, { align: 'center' });

  // Informações do cliente
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Preto
  doc.text(`Cliente: ${customerName}`, 20, 80);
  doc.text(`Data: ${formatDate(receipt.createdAt)}`, 20, 90); // Usar a data do recibo
  doc.text(`Recibo Nº: ${getNextReceiptNumber()}`, 20, 100); // Número do recibo em ordem crescente
  doc.text(`Vendedor: ${employeeName}`, 20, 110);

  // Tabela de itens
  let y = 130;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, y);
  doc.text('Qtd', 120, y);
  doc.text('Preço', 150, y);
  doc.text('Total', 180, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  products.forEach((item) => {
    doc.text(item.name, 20, y);
    doc.text(item.quantity.toString(), 120, y);
    doc.text(formatCurrency(item.price), 150, y);
    doc.text(formatCurrency(item.price * item.quantity), 180, y);
    y += 10;
  });

  // Informações de pagamento
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Forma de Pagamento: ${receipt.paymentMethod}`, 20, y);
  y += 10;
  if (receipt.installments > 1) {
    doc.text(
      `Parcelamento: ${receipt.installments}x de ${formatCurrency(
        receipt.installmentValue
      )}`,
      20,
      y
    );
    y += 10;
  }
  doc.text(`Valor Total: ${formatCurrency(receipt.totalAmount)}`, 20, y);

  // Informações da garantia
  if (receipt.warranty) {
    y += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Azul escuro
    doc.text('Informações da Garantia', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Preto
    doc.text(
      `Duração: ${receipt.warranty.durationMonths} meses`,
      20,
      y
    );
    y += 10;
    doc.text(
      `Válida até: ${formatDate(receipt.warranty.expiresAt)}`,
      20,
      y
    );
  }

 // Assinaturas alinhadas
y += 30;
doc.setFontSize(12);
doc.setTextColor(0, 0, 0); // Preto

// Definir posições centrais
const centerVendedor = 60; // Posição centralizada para o vendedor
const centerCliente = 150; // Posição centralizada para o cliente
const lineWidth = 70; // Largura das linhas de assinatura

// Assinatura do vendedor
doc.setFont('helvetica', 'italic');
doc.text('True Iphones', centerVendedor, y - 5, { align: 'center' });
doc.line(centerVendedor - lineWidth / 2, y, centerVendedor + lineWidth / 2, y);
doc.setFont('helvetica', 'normal');
doc.text('Assinatura do Vendedor', centerVendedor, y + 10, { align: 'center' });

// Assinatura do cliente
doc.line(centerCliente - lineWidth / 2, y, centerCliente + lineWidth / 2, y);
doc.text('Assinatura do Cliente', centerCliente, y + 10, { align: 'center' });


  // Rodapé
  y += 30;
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102); // Cinza escuro
  doc.text('Obrigado por escolher a True Iphones!', 105, y, { align: 'center' });
  doc.text('Para dúvidas, entre em contato: (11) 97851-3496', 105, y + 10, { align: 'center' });

  return doc;
}