"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  Send,
  Clock,
  Users,
  Zap,
  Plus,
  Edit2,
  X,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Copy,
  Eye,
  FileText,
  ToggleLeft,
  ToggleRight,
  Search,
  RefreshCw,
  Hash,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// --- Types ---
interface Template {
  id: string;
  nome: string;
  texto: string;
  tipo: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AutomacaoConfig {
  id: string;
  tipo: string;
  ativo: boolean;
}

interface MensagemLog {
  id: string;
  telefone: string;
  mensagem: string;
  tipo: string;
  status: string;
  createdAt: string;
  cliente: { nome: string };
  template: { nome: string } | null;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  whatsapp?: string;
}

interface MensagemGerada {
  clienteId: string;
  clienteNome: string;
  telefone: string;
  mensagem: string;
  whatsappLink: string;
}

// --- Constants ---
const AVAILABLE_VARS = [
  { var: "{nome}", desc: "Nome do cliente" },
  { var: "{servico}", desc: "Nome do servico" },
  { var: "{data}", desc: "Data do servico/vencimento" },
  { var: "{hora}", desc: "Hora do servico" },
  { var: "{valor}", desc: "Valor monetario" },
  { var: "{tecnico}", desc: "Nome do tecnico" },
  { var: "{empresa}", desc: "Nome da empresa" },
  { var: "{chave}", desc: "Chave PIX" },
  { var: "{segmento}", desc: "Segmento da empresa" },
];

const AUTOMACAO_LABELS: Record<string, { label: string; desc: string }> = {
  lembrete_1dia: {
    label: "Enviar lembrete 1 dia antes do servico",
    desc: "Envia automaticamente um lembrete via WhatsApp para o cliente 1 dia antes do servico agendado.",
  },
  confirmacao_agendamento: {
    label: "Enviar confirmacao ao agendar",
    desc: "Envia automaticamente uma mensagem de confirmacao quando um servico e agendado.",
  },
  pesquisa_pos_servico: {
    label: "Enviar pesquisa pos-servico",
    desc: "Envia automaticamente uma pesquisa de satisfacao apos a conclusao do servico.",
  },
  cobranca_3dias: {
    label: "Enviar cobranca 3 dias antes do vencimento",
    desc: "Envia automaticamente um lembrete de cobranca 3 dias antes do vencimento da fatura.",
  },
  boas_vindas_cadastro: {
    label: "Enviar boas-vindas ao cadastrar cliente",
    desc: "Envia automaticamente uma mensagem de boas-vindas quando um novo cliente e cadastrado.",
  },
};

const TIPO_LABELS: Record<string, string> = {
  lembrete: "Lembrete",
  confirmacao: "Confirmacao",
  pos_servico: "Pos-Servico",
  cobranca: "Cobranca",
  renovacao: "Renovacao",
  boas_vindas: "Boas-vindas",
  custom: "Personalizado",
};

const TIPO_COLORS: Record<string, string> = {
  lembrete: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmacao: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pos_servico: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  cobranca: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  renovacao: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  boas_vindas: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  custom: "bg-dark-700 text-dark-300 border-dark-600",
};

// --- Component ---
export default function ComunicacaoPage() {
  const { data: session } = useSession();

  // Tab state
  const [activeTab, setActiveTab] = useState<"templates" | "envio" | "automacoes">("templates");

  // Data state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [automacoes, setAutomacoes] = useState<AutomacaoConfig[]>([]);
  const [logs, setLogs] = useState<MensagemLog[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ nome: "", texto: "", tipo: "custom" });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Envio em massa state
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<"todos" | "selecionados" | "vencendo">("todos");
  const [selectedClienteIds, setSelectedClienteIds] = useState<string[]>([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [customVars, setCustomVars] = useState<Record<string, string>>({
    servico: "",
    data: "",
    hora: "",
    valor: "",
    tecnico: "",
    chave: "",
  });
  const [mensagensGeradas, setMensagensGeradas] = useState<MensagemGerada[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/comunicacao", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.templates || []);
        setAutomacoes(json.automacoes || []);
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch("/api/clientes?page=1&search=&status=ativo", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setClientes(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchClientes();
  }, [fetchData, fetchClientes]);

  // --- Template Handlers ---
  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ nome: "", texto: "", tipo: "custom" });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({ nome: template.nome, texto: template.texto, tipo: template.tipo });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.nome || !templateForm.texto) {
      showAlert("error", "Nome e texto sao obrigatorios.");
      return;
    }
    try {
      setSavingTemplate(true);
      const res = await fetch("/api/comunicacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(editingTemplate ? { id: editingTemplate.id } : {}),
          nome: templateForm.nome,
          texto: templateForm.texto,
          tipo: templateForm.tipo,
        }),
      });
      if (res.ok) {
        showAlert("success", editingTemplate ? "Template atualizado!" : "Template criado!");
        setShowTemplateModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showAlert("error", err.error || "Erro ao salvar template.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const insertVariable = (varName: string) => {
    setTemplateForm((prev) => ({
      ...prev,
      texto: prev.texto + varName,
    }));
  };

  // --- Automacao Handlers ---
  const handleToggleAutomacao = async (tipo: string, ativo: boolean) => {
    try {
      const res = await fetch("/api/comunicacao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tipo, ativo }),
      });
      if (res.ok) {
        setAutomacoes((prev) =>
          prev.map((a) => (a.tipo === tipo ? { ...a, ativo } : a))
        );
        showAlert("success", `Automacao ${ativo ? "ativada" : "desativada"}!`);
      }
    } catch {
      showAlert("error", "Erro ao atualizar automacao.");
    }
  };

  // --- Envio Handlers ---
  const handleGerarMensagens = async () => {
    if (!selectedTemplateId) {
      showAlert("error", "Selecione um template.");
      return;
    }
    try {
      setEnviando(true);
      const payload: any = {
        templateId: selectedTemplateId,
        filtro: recipientFilter,
        variaveis: customVars,
      };
      if (recipientFilter === "selecionados") {
        payload.clienteIds = selectedClienteIds;
      }
      const res = await fetch("/api/comunicacao/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setMensagensGeradas(json.mensagens || []);
        setShowPreview(true);
        showAlert("success", `${json.total} mensagen(s) gerada(s)!`);
        fetchData(); // Refresh logs
      } else {
        const err = await res.json();
        showAlert("error", err.error || "Erro ao gerar mensagens.");
      }
    } catch {
      showAlert("error", "Erro de conexao.");
    } finally {
      setEnviando(false);
    }
  };

  const handleOpenWhatsApp = (link: string) => {
    window.open(link, "_blank");
  };

  const handleOpenAllWhatsApp = () => {
    mensagensGeradas.forEach((m, i) => {
      setTimeout(() => window.open(m.whatsappLink, "_blank"), i * 800);
    });
  };

  const toggleClienteSelection = (id: string) => {
    setSelectedClienteIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
      (c.telefone && c.telefone.includes(clienteSearch))
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // --- Render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border ${
            alert.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {alert.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-400" />
            Comunicacao via WhatsApp
          </h2>
          <p className="text-sm text-dark-400 mt-1">
            Gerencie templates, envie mensagens em massa e configure automacoes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-900 rounded-xl border border-dark-800 w-fit">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
              : "text-dark-400 hover:text-white hover:bg-dark-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab("envio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "envio"
              ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
              : "text-dark-400 hover:text-white hover:bg-dark-800"
          }`}
        >
          <Send className="w-4 h-4" />
          Envio em Massa
        </button>
        <button
          onClick={() => setActiveTab("automacoes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "automacoes"
              ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
              : "text-dark-400 hover:text-white hover:bg-dark-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          Automacoes
        </button>
      </div>

      {/* ==================== TEMPLATES TAB ==================== */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Templates de Mensagem</h3>
            <button onClick={openCreateTemplate} className="btn-primary">
              <Plus className="w-4 h-4" /> Novo Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="card-hover p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{template.nome}</h4>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${
                        TIPO_COLORS[template.tipo] || TIPO_COLORS.custom
                      }`}
                    >
                      {TIPO_LABELS[template.tipo] || template.tipo}
                    </span>
                  </div>
                  {!template.ativo && (
                    <span className="px-2 py-0.5 rounded text-xs bg-dark-700 text-dark-400">
                      Inativo
                    </span>
                  )}
                </div>

                <p className="text-sm text-dark-400 line-clamp-3 leading-relaxed">
                  {template.texto}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-dark-800">
                  <button
                    onClick={() => openEditTemplate(template)}
                    className="btn-ghost text-xs py-1.5 px-3"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setActiveTab("envio");
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Variables Sidebar Info */}
          <div className="card p-5">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-400" />
              Variaveis Disponiveis
            </h4>
            <p className="text-xs text-dark-500 mb-3">
              Use estas variaveis nos seus templates. Elas serao substituidas automaticamente ao enviar.
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARS.map((v) => (
                <div
                  key={v.var}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700"
                  title={v.desc}
                >
                  <code className="text-xs text-brand-400 font-mono">{v.var}</code>
                  <span className="text-xs text-dark-500">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ENVIO EM MASSA TAB ==================== */}
      {activeTab === "envio" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Envio em Massa</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select Template */}
              <div className="card p-5 space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  1. Selecione o Template
                </h4>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Selecione um template...</option>
                  {templates.filter((t) => t.ativo).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({TIPO_LABELS[t.tipo] || t.tipo})
                    </option>
                  ))}
                </select>

                {selectedTemplate && (
                  <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                    <p className="text-xs text-dark-500 mb-1">Preview do template:</p>
                    <p className="text-sm text-dark-300">{selectedTemplate.texto}</p>
                  </div>
                )}
              </div>

              {/* Custom Variables */}
              <div className="card p-5 space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-brand-400" />
                  2. Preencha as Variaveis
                </h4>
                <p className="text-xs text-dark-500">
                  Preencha os campos abaixo para substituir as variaveis no template. O campo nome sera preenchido automaticamente com o nome de cada cliente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Servico</label>
                    <input
                      type="text"
                      value={customVars.servico}
                      onChange={(e) => setCustomVars({ ...customVars, servico: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: Dedetizacao"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Data</label>
                    <input
                      type="text"
                      value={customVars.data}
                      onChange={(e) => setCustomVars({ ...customVars, data: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: 15/03/2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Hora</label>
                    <input
                      type="text"
                      value={customVars.hora}
                      onChange={(e) => setCustomVars({ ...customVars, hora: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: 14:00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Tecnico</label>
                    <input
                      type="text"
                      value={customVars.tecnico}
                      onChange={(e) => setCustomVars({ ...customVars, tecnico: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: Joao Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Valor (R$)</label>
                    <input
                      type="text"
                      value={customVars.valor}
                      onChange={(e) => setCustomVars({ ...customVars, valor: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: 250,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Chave PIX</label>
                    <input
                      type="text"
                      value={customVars.chave}
                      onChange={(e) => setCustomVars({ ...customVars, chave: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: email@empresa.com"
                    />
                  </div>
                </div>
              </div>

              {/* Select Recipients */}
              <div className="card p-5 space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  3. Selecione os Destinatarios
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRecipientFilter("todos")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      recipientFilter === "todos"
                        ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                        : "text-dark-400 border-dark-700 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    Todos os Clientes
                  </button>
                  <button
                    onClick={() => setRecipientFilter("selecionados")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      recipientFilter === "selecionados"
                        ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                        : "text-dark-400 border-dark-700 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    Clientes Especificos
                  </button>
                  <button
                    onClick={() => setRecipientFilter("vencendo")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      recipientFilter === "vencendo"
                        ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                        : "text-dark-400 border-dark-700 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    Contrato Vencendo
                  </button>
                </div>

                {recipientFilter === "selecionados" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={clienteSearch}
                        onChange={(e) => setClienteSearch(e.target.value)}
                        className="input-field pl-10 w-full"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-dark-700 p-2 bg-dark-900">
                      {filteredClientes.length === 0 ? (
                        <p className="text-xs text-dark-500 text-center py-4">Nenhum cliente encontrado.</p>
                      ) : (
                        filteredClientes.map((c) => (
                          <label
                            key={c.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedClienteIds.includes(c.id)}
                              onChange={() => toggleClienteSelection(c.id)}
                              className="accent-brand-500 w-4 h-4"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-white">{c.nome}</span>
                              <span className="text-xs text-dark-500 ml-2">
                                {c.whatsapp || c.telefone || "Sem telefone"}
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedClienteIds.length > 0 && (
                      <p className="text-xs text-brand-400">
                        {selectedClienteIds.length} cliente(s) selecionado(s)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGerarMensagens}
                  disabled={!selectedTemplateId || enviando}
                  className="btn-primary"
                >
                  {enviando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Gerar e Enviar via WhatsApp
                </button>
              </div>
            </div>

            {/* Right: Preview & History */}
            <div className="space-y-4">
              {/* Generated Messages Preview */}
              {showPreview && mensagensGeradas.length > 0 && (
                <div className="card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-brand-400" />
                      Mensagens Geradas ({mensagensGeradas.length})
                    </h4>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-dark-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleOpenAllWhatsApp}
                    className="btn-primary w-full text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Todos no WhatsApp Web
                  </button>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {mensagensGeradas.map((m, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{m.clienteNome}</span>
                          <span className="text-xs text-dark-500">{m.telefone}</span>
                        </div>
                        <p className="text-xs text-dark-400 leading-relaxed">{m.mensagem}</p>
                        <button
                          onClick={() => handleOpenWhatsApp(m.whatsappLink)}
                          className="btn-ghost text-xs py-1 px-2 w-full justify-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir no WhatsApp
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Logs */}
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    Historico Recente
                  </h4>
                  <button
                    onClick={fetchData}
                    className="text-dark-500 hover:text-white transition-colors"
                    title="Atualizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {logs.length === 0 ? (
                  <p className="text-xs text-dark-500 text-center py-6">
                    Nenhuma mensagem enviada ainda.
                  </p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {logs.slice(0, 20).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-dark-800/30 border border-dark-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">{log.cliente?.nome}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              log.status === "enviado"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <p className="text-xs text-dark-500 truncate">{log.mensagem}</p>
                        <div className="flex items-center justify-between text-xs text-dark-600">
                          <span>{log.template?.nome || TIPO_LABELS[log.tipo] || log.tipo}</span>
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Logs Table */}
          {logs.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-700">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  Historico Completo de Envios
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left p-3 text-dark-400 font-medium">Cliente</th>
                      <th className="text-left p-3 text-dark-400 font-medium hidden md:table-cell">Telefone</th>
                      <th className="text-left p-3 text-dark-400 font-medium hidden lg:table-cell">Template</th>
                      <th className="text-left p-3 text-dark-400 font-medium hidden xl:table-cell">Mensagem</th>
                      <th className="text-center p-3 text-dark-400 font-medium">Status</th>
                      <th className="text-right p-3 text-dark-400 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors">
                        <td className="p-3 text-white">{log.cliente?.nome}</td>
                        <td className="p-3 text-dark-300 hidden md:table-cell">{log.telefone}</td>
                        <td className="p-3 text-dark-300 hidden lg:table-cell">
                          {log.template?.nome || "-"}
                        </td>
                        <td className="p-3 text-dark-400 hidden xl:table-cell max-w-xs truncate">
                          {log.mensagem}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              log.status === "enviado"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-dark-400">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== AUTOMACOES TAB ==================== */}
      {activeTab === "automacoes" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Automacoes de Mensagens</h3>
            <p className="text-sm text-dark-400 mt-1">
              Configure o envio automatico de mensagens via WhatsApp para seus clientes.
            </p>
          </div>

          <div className="space-y-3">
            {automacoes.map((automacao) => {
              const config = AUTOMACAO_LABELS[automacao.tipo];
              if (!config) return null;
              return (
                <div
                  key={automacao.id}
                  className="card-hover p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          automacao.ativo
                            ? "bg-brand-500/10 text-brand-400"
                            : "bg-dark-800 text-dark-500"
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white">{config.label}</h4>
                        <p className="text-xs text-dark-500 mt-0.5">{config.desc}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleAutomacao(automacao.tipo, !automacao.ativo)}
                    className="flex-shrink-0 transition-colors"
                    title={automacao.ativo ? "Desativar" : "Ativar"}
                  >
                    {automacao.ativo ? (
                      <ToggleRight className="w-10 h-10 text-brand-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-dark-600" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card p-5 bg-dark-800/30 border-dark-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-400">Como funciona?</h4>
                <p className="text-xs text-dark-400 mt-1 leading-relaxed">
                  As automacoes geram links de WhatsApp Web automaticamente nos momentos configurados.
                  Quando um evento e disparado (ex: agendamento criado, servico concluido), o sistema
                  gera a mensagem personalizada e disponibiliza o link para envio. Como o envio e feito
                  via WhatsApp Web (wa.me), nao ha custos adicionais de API.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TEMPLATE MODAL ==================== */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTemplateModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Nome do Template *</label>
                <input
                  type="text"
                  value={templateForm.nome}
                  onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ex: Lembrete de Pagamento"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Tipo</label>
                <select
                  value={templateForm.tipo}
                  onChange={(e) => setTemplateForm({ ...templateForm, tipo: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="custom">Personalizado</option>
                  <option value="lembrete">Lembrete</option>
                  <option value="confirmacao">Confirmacao</option>
                  <option value="pos_servico">Pos-Servico</option>
                  <option value="cobranca">Cobranca</option>
                  <option value="renovacao">Renovacao</option>
                  <option value="boas_vindas">Boas-vindas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">Texto da Mensagem *</label>
                <textarea
                  value={templateForm.texto}
                  onChange={(e) => setTemplateForm({ ...templateForm, texto: e.target.value })}
                  className="input-field w-full h-32 resize-none"
                  placeholder="Ola {nome}! ..."
                />
              </div>

              {/* Variable Buttons */}
              <div>
                <p className="text-xs text-dark-500 mb-2">Clique para inserir uma variavel:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARS.map((v) => (
                    <button
                      key={v.var}
                      type="button"
                      onClick={() => insertVariable(v.var)}
                      className="px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-xs text-brand-400 hover:bg-dark-700 hover:border-brand-500/30 transition-colors font-mono"
                      title={v.desc}
                    >
                      {v.var}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {templateForm.texto && (
                <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                  <p className="text-xs text-dark-500 mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Preview
                  </p>
                  <p className="text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">
                    {templateForm.texto}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateForm.nome || !templateForm.texto}
                className="btn-primary"
              >
                {savingTemplate && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingTemplate ? "Salvar Alteracoes" : "Criar Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
