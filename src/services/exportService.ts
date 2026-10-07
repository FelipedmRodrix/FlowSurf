/**
 * Service to export surf school data to Excel/CSV and PDF formats
 */

export const exportService = {
  // Download CSV / Excel file
  downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    // Add UTF-8 BOM so Excel opens accents and special characters cleanly
    const BOM = '\uFEFF';
    const csvContent =
      BOM +
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';') +
      '\n' +
      rows
        .map((row) =>
          row
            .map((cell) => {
              const val = cell !== undefined && cell !== null ? String(cell) : '';
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(';')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export Students to Excel
  exportStudentsToExcel(students: any[], schoolName: string) {
    const headers = [
      'ID',
      'Nome Completo',
      'E-mail',
      'Telefone',
      'Status',
      'Nível de Surf',
      'Tipo de Prancha',
      'Contato de Emergência',
      'Data de Matrícula',
    ];

    const rows = students.map((s) => [
      s.id,
      s.name,
      s.email,
      s.phone || 'N/A',
      s.status === 'active' ? 'Ativo' : s.status === 'inactive' ? 'Inativo' : 'Pendente',
      s.skillLevel ? s.skillLevel.toUpperCase() : 'INICIANTE',
      s.boardType || 'Não informado',
      s.emergencyContact || 'Não informado',
      s.joinedDate,
    ]);

    this.downloadCSV(`alunos_${schoolName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  },

  // Export Financial Records to Excel
  exportFinancesToExcel(records: any[], schoolName: string) {
    const headers = [
      'ID Cobrança',
      'Aluno',
      'Plano',
      'Valor (R$)',
      'Vencimento',
      'Data Pagamento',
      'Status',
      'Forma de Pagamento',
      'Mês de Referência',
      'Observações',
    ];

    const rows = records.map((r) => [
      r.id,
      r.studentName,
      r.planName,
      r.amount.toFixed(2),
      r.dueDate,
      r.paidDate || '-',
      r.status === 'paid' ? 'Pago' : r.status === 'overdue' ? 'Atrasado' : 'Pendente',
      r.paymentMethod ? r.paymentMethod.toUpperCase() : '-',
      r.referenceMonth,
      r.notes || '',
    ]);

    this.downloadCSV(`financeiro_${schoolName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  },

  // Export Attendance / Classes to Excel
  exportClassesToExcel(classes: any[], schoolName: string) {
    const headers = [
      'ID Aula',
      'Data',
      'Horário Início',
      'Horário Fim',
      'Pico / Praia',
      'Instrutor',
      'Vagas Ocupadas',
      'Vagas Totais',
      'Nível Indicado',
      'Status da Sessão',
    ];

    const rows = classes.map((c) => [
      c.id,
      c.date,
      c.startTime,
      c.endTime,
      c.spot,
      c.instructorName || c.instructorId,
      c.enrolledCount,
      c.maxStudents,
      c.level ? c.level.toUpperCase() : 'TODOS',
      c.status === 'completed' ? 'Concluída' : c.status === 'cancelled' ? 'Cancelada' : 'Agendada',
    ]);

    this.downloadCSV(`aulas_${schoolName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  },

  // Trigger Print for PDF (renders styled printable document overlay)
  triggerPDFPrint() {
    window.print();
  },
};
