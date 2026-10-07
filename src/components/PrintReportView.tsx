import React from 'react';
import { SurfSchool, User, StudentEvaluation, FinancialRecord, Booking } from '../types';

interface PrintReportViewProps {
  currentSchool?: SurfSchool;
  currentUser: User;
  evaluations: StudentEvaluation[];
  financialRecords: FinancialRecord[];
  bookings: Booking[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  currentSchool,
  currentUser,
  evaluations,
  financialRecords,
  bookings,
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const userEvals = evaluations.filter((e) => e.studentId === currentUser.id);

  return (
    <div className="print-only text-black bg-white p-8 max-w-4xl mx-auto font-sans leading-relaxed">
      {/* Official Document Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🌊</span>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">
                {currentSchool?.name || 'Escola de Surf'}
              </h1>
              <p className="text-xs text-gray-600">
                {currentSchool?.beachSpot} • {currentSchool?.city}/{currentSchool?.state} • Tel: {currentSchool?.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-gray-500">
          <div>Emissão: <strong>{currentDate}</strong></div>
          <div>Documento Oficial de Desempenho</div>
        </div>
      </div>

      {/* Student Profile Overview */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-300">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-300 pb-1">
          Dados do Aluno
        </h2>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><strong>Nome:</strong> {currentUser.name}</div>
          <div><strong>Status:</strong> {currentUser.status === 'active' ? 'ATIVO' : 'INATIVO'}</div>
          <div><strong>Nível:</strong> {(currentUser.skillLevel || 'Iniciante').toUpperCase()}</div>
          <div><strong>Prancha:</strong> {currentUser.boardType || 'Softboard'}</div>
          <div><strong>E-mail:</strong> {currentUser.email}</div>
          <div><strong>Telefone:</strong> {currentUser.phone || 'N/A'}</div>
        </div>
      </div>

      {/* Technical Surf Skills Evolution */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-300 pb-1">
          Dossiê de Evolução Técnica no Mar
        </h2>
        {userEvals.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">Nenhuma avaliação técnica lançada para este período.</p>
        ) : (
          <div className="space-y-4">
            {userEvals.map((ev, index) => (
              <div key={ev.id} className="border border-gray-200 rounded p-3 text-xs bg-gray-50">
                <div className="flex items-center justify-between font-bold mb-2">
                  <span>Sessão #{index + 1} - Data: {ev.date}</span>
                  <span>Nota Geral: {ev.overallRating} / 5.0 ★</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center mb-2 font-mono text-[11px] bg-white p-2 border">
                  <div>Remada: {ev.skills.paddling}/5</div>
                  <div>Drop: {ev.skills.popupDrop}/5</div>
                  <div>Equilíbrio: {ev.skills.balance}/5</div>
                  <div>Leitura: {ev.skills.waveReading}/5</div>
                  <div>Segurança: {ev.skills.seaSafety}/5</div>
                </div>
                <p className="text-gray-700"><strong>Parecer do Instrutor:</strong> {ev.notes}</p>
                {ev.coachTips && (
                  <p className="text-gray-900 mt-1 font-semibold">
                    <strong>Dica de Ouro:</strong> {ev.coachTips}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="mt-16 pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-2"></div>
          <p className="font-bold">{currentSchool?.ownerName || 'Coordenação Técnica'}</p>
          <p className="text-gray-500">Direção da Escolinha de Surf</p>
        </div>
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-2"></div>
          <p className="font-bold">{currentUser.name}</p>
          <p className="text-gray-500">Aluno Matriculado</p>
        </div>
      </div>
    </div>
  );
};
