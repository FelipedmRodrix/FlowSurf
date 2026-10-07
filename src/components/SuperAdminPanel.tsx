import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Shield,
  Users,
  Waves,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { SurfSchool, User, Instructor } from '../types';
import { storageService } from '../services/storageService';

interface SuperAdminPanelProps {
  schools: SurfSchool[];
  users: User[];
  instructors: Instructor[];
  onSelectSchool: (school: SurfSchool) => void;
  onImpersonateOwner: (user: User) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  schools,
  users,
  instructors,
  onSelectSchool,
  onImpersonateOwner,
}) => {
  const [activeTab, setActiveTab] = useState<'schools' | 'users' | 'overview'>('schools');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Form State for new school + owner
  const [schoolName, setSchoolName] = useState('');
  const [beachSpot, setBeachSpot] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [maxStudents, setMaxStudents] = useState(5);
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('123456');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !beachSpot || !ownerEmail || !ownerName) {
      alert('Preencha os campos obrigatórios da escolinha e do proprietário.');
      return;
    }

    // 1. Create the Owner User first
    const newOwner = storageService.createUser({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: 'school_owner',
      phone: ownerPhone || schoolPhone,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Create the Surf School
    const slug = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newSchool = storageService.createSchool({
      name: schoolName,
      slug,
      logo: '🏄',
      coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
      beachSpot,
      city,
      state,
      phone: schoolPhone,
      email: schoolEmail,
      ownerId: newOwner.id,
      ownerName: newOwner.name,
      ownerEmail: newOwner.email,
      description: description || 'Escola de surf credenciada pela plataforma SurfFlow.',
      active: true,
      maxStudentsPerClass: Number(maxStudents),
    });

    // 3. Link schoolId to the new owner
    storageService.updateUser(newOwner.id, { schoolId: newSchool.id });

    // Reset Form
    setSchoolName('');
    setBeachSpot('');
    setCity('');
    setSchoolPhone('');
    setSchoolEmail('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('123456');
    setOwnerPhone('');
    setDescription('');
    setIsModalOpen(false);

    setSuccessMessage(`Escolinha "${newSchool.name}" e Dono "${newOwner.name}" criados com sucesso!`);
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  const toggleSchoolActive = (school: SurfSchool) => {
    storageService.updateSchool(school.id, { active: !school.active });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner - Beach & Ocean Atmosphere */}
      <div className="bg-gradient-to-r from-blue-900/90 via-sky-900/80 to-indigo-950/40 border border-sky-700/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-sky-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Painel Master Super Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestão de Escolinhas & Usuários da Rede
            </h1>
            <p className="text-sky-200/90 text-sm mt-1 max-w-2xl">
              Cadastre novas escolinhas de surf, defina as credenciais do proprietário para que ele organize turmas e professores, e audite todas as operações da plataforma.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Cadastrar Nova Escolinha</span>
          </button>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-sky-800/80">
          <div className="bg-sky-950/70 rounded-2xl p-4 border border-sky-800/80">
            <span className="text-xs text-sky-300 font-semibold">Escolas Ativas</span>
            <div className="text-2xl font-black text-white mt-1">
              {schools.filter((s) => s.active).length} <span className="text-xs text-sky-400 font-normal">/ {schools.length}</span>
            </div>
          </div>
          <div className="bg-sky-950/70 rounded-2xl p-4 border border-sky-800/80">
            <span className="text-xs text-sky-300 font-semibold">Alunos Matriculados</span>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {users.filter((u) => u.role === 'student').length}
            </div>
          </div>
          <div className="bg-sky-950/70 rounded-2xl p-4 border border-sky-800/80">
            <span className="text-xs text-sky-300 font-semibold">Instrutores Homologados</span>
            <div className="text-2xl font-black text-emerald-300 mt-1">{instructors.length}</div>
          </div>
          <div className="bg-sky-950/70 rounded-2xl p-4 border border-sky-800/80">
            <span className="text-xs text-sky-300 font-semibold">Total de Usuários</span>
            <div className="text-2xl font-black text-sky-100 mt-1">{users.length}</div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-sky-900/80 border border-amber-400/60 text-amber-200 px-4 py-3 rounded-2xl flex items-center space-x-3 text-sm animate-fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sky-800/80 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schools'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Escolinhas de Surf ({schools.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>Gestão Global de Usuários ({users.length})</span>
        </button>
      </div>

      {/* Tab: Schools List */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schools.map((school) => {
            const schoolOwner = users.find((u) => u.id === school.ownerId);
            const schoolInstructors = instructors.filter((i) => i.schoolId === school.id);
            const schoolStudents = users.filter((u) => u.schoolId === school.id && u.role === 'student');

            return (
              <div
                key={school.id}
                className="bg-sky-950/80 border border-sky-800/80 hover:border-amber-400/50 rounded-3xl p-6 transition-all shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-900 border border-amber-400/60 flex items-center justify-center text-2xl shadow-md">
                        {school.logo}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                          {school.name}
                        </h3>
                        <p className="text-xs text-sky-300/80 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{school.beachSpot} • {school.city}/{school.state}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSchoolActive(school)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors cursor-pointer ${
                        school.active
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {school.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>

                  <p className="text-xs text-sky-200/80 mt-4 line-clamp-2 leading-relaxed">
                    {school.description}
                  </p>

                  {/* Credentials / Owner Box */}
                  <div className="mt-4 p-3.5 bg-sky-900/40 border border-sky-800/80 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-sky-300">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dono da Escolinha:</span>
                      </span>
                      {schoolOwner && (
                        <button
                          onClick={() => onImpersonateOwner(schoolOwner)}
                          className="text-amber-300 hover:text-amber-200 underline font-semibold text-[11px] cursor-pointer"
                        >
                          Acessar como Dono
                        </button>
                      )}
                    </div>
                    <div className="text-amber-300 font-bold">{school.ownerName}</div>
                    <div className="text-sky-300/80 flex items-center space-x-2 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-sky-400" />
                        <span>{school.ownerEmail}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-sky-400" />
                        <span>{school.phone}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                      <span className="text-[10px] text-sky-300/80">Instrutores</span>
                      <div className="font-bold text-white text-sm">{schoolInstructors.length}</div>
                    </div>
                    <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                      <span className="text-[10px] text-sky-300/80">Alunos</span>
                      <div className="font-black text-amber-300 text-sm">{schoolStudents.length}</div>
                    </div>
                    <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                      <span className="text-[10px] text-sky-300/80">Capacidade</span>
                      <div className="font-bold text-sky-100 text-sm">{school.maxStudentsPerClass} / aula</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-sky-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onSelectSchool(school)}
                    className="w-full flex items-center justify-center space-x-2 bg-sky-900 hover:bg-sky-850 text-amber-300 hover:text-amber-200 font-bold text-xs py-2.5 rounded-xl border border-sky-700 transition-colors cursor-pointer"
                  >
                    <span>Abrir Gestão desta Escola</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-sky-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar usuário por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-sky-900 border border-sky-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-sky-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-sky-100 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Todos os Papéis</option>
                <option value="super_admin">Super Admins</option>
                <option value="school_owner">Donos de Escolinha</option>
                <option value="instructor">Instrutores</option>
                <option value="student">Alunos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-sky-200">
              <thead className="bg-sky-900/60 text-sky-300 font-bold border-b border-sky-800">
                <tr>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Papel</th>
                  <th className="py-3 px-4">Escola Vinculada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-800/60">
                {filteredUsers.map((u) => {
                  const linkedSchool = schools.find((s) => s.id === u.schoolId);
                  return (
                    <tr key={u.id} className="hover:bg-sky-900/40 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-sky-700"
                        />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-sky-300/80">{u.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'super_admin'
                              ? 'bg-blue-500/20 text-sky-200 border-blue-400/40'
                              : u.role === 'school_owner'
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : u.role === 'instructor'
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          }`}
                        >
                          {u.role === 'super_admin'
                            ? 'Super Admin'
                            : u.role === 'school_owner'
                            ? 'Dono'
                            : u.role === 'instructor'
                            ? 'Instrutor'
                            : 'Aluno'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sky-200">
                        {linkedSchool ? linkedSchool.name : <span className="text-sky-400/70">Global</span>}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            storageService.updateUser(u.id, {
                              status: u.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.status === 'active' ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sky-300/80">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onImpersonateOwner(u)}
                          className="text-amber-300 hover:text-amber-200 underline font-bold text-[11px] cursor-pointer"
                        >
                          Simular Acesso
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Nova Escolinha + Dono */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sky-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cadastrar Nova Escolinha de Surf</h3>
                  <p className="text-xs text-sky-300/80">
                    Defina a escola e crie o usuário e senha do dono para acesso ao sistema.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sky-300 hover:text-white p-1 text-sm rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-6">
              {/* Seção 1: Dados da Escolinha */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>1. Dados da Escolinha de Surf</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      Nome da Escolinha *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ubatuba Surf Experience"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      Pico / Praia Principal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Praia de Itamambuca"
                      value={beachSpot}
                      onChange={(e) => setBeachSpot(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Ubatuba"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-sky-200 mb-1">Estado</label>
                      <input
                        type="text"
                        placeholder="SP"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-sky-200 mb-1">Capacidade / Turma</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(Number(e.target.value))}
                        className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">Telefone da Escola</label>
                    <input
                      type="text"
                      placeholder="(12) 99999-8888"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">Email da Escola</label>
                    <input
                      type="email"
                      placeholder="contato@ubatubasurf.com.br"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Credenciais do Dono da Escolinha */}
              <div className="pt-4 border-t border-sky-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>2. Credenciais de Acesso do Dono da Escolinha</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      Nome do Dono / Coordenador *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rodrigo Siqueira"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      Email de Acesso (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rodrigo@ubatubasurf.com.br"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      Senha Inicial *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Defina a senha"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sky-200 mb-1">
                      WhatsApp do Dono
                    </label>
                    <input
                      type="text"
                      placeholder="(12) 99888-7777"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-sky-300 hover:text-white hover:bg-sky-900 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
                >
                  Criar Escolinha e Liberar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
