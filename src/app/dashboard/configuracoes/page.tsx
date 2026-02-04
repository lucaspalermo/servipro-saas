"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Wrench,
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Save,
  Gift,
  Copy,
  Share2,
  Crown,
  CreditCard,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Empresa {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  recorrenciaPadrao: number;
  comissaoPadrao: number;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  precoBase: number;
  duracaoMin: number;
  recorrenciaDias: number;
}

interface Segmento {
  id: string;
  nome: string;
}

const emptyEmpresa: Empresa = {
  nome: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  recorrenciaPadrao: 30,
  comissaoPadrao: 10,
};

const emptyServico: Omit<Servico, "id"> = {
  nome: "",
  descricao: "",
  precoBase: 0,
  duracaoMin: 60,
  recorrenciaDias: 30,
};

interface Indicacao {
  id: string;
  indicadoEmail: string;
  indicadoNome?: string;
  status: string;
  recompensa?: string;
  createdAt: string;
}

interface PlanoInfo {
  plano: string;
  periodo: string;
  codigoIndicacao: string;
}

interface PagamentoConfig {
  mp_access_token: string;
  mp_access_token_masked: string;
  mp_access_token_configurado: string;
  mp_public_key: string;
  pix_chave: string;
  gateway_ativo: string;
}

type Tab = "empresa" | "servicos" | "segmentos" | "indicacao" | "plano" | "pagamentos";

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("empresa");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Empresa
  const [empresa, setEmpresa] = useState<Empresa>(emptyEmpresa);

  // Servicos
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [servicoForm, setServicoForm] = useState(emptyServico);

  // Segmentos
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [novoSegmento, setNovoSegmento] = useState("");

  // Indicacao
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [codigoIndicacao, setCodigoIndicacao] = useState("");

  // Plano
  const [planoInfo, setPlanoInfo] = useState<PlanoInfo>({ plano: "starter", periodo: "mensal", codigoIndicacao: "" });

  // Pagamentos
  const [pagamentoConfig, setPagamentoConfig] = useState<PagamentoConfig>({
    mp_access_token: "",
    mp_access_token_masked: "",
    mp_access_token_configurado: "false",
    mp_public_key: "",
    pix_chave: "",
    gateway_ativo: "false",
  });
  const [showToken, setShowToken] = useState(false);
  const [savingPagamento, setSavingPagamento] = useState(false);

  const showAlertMsg = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchEmpresa = useCallback(async () => {
    try {
      const res = await fetch("/api/configuracoes/empresa", {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setEmpresa({
          nome: json.nome || "",
          cnpj: json.cnpj || "",
          telefone: json.telefone || "",
          email: json.email || "",
          endereco: json.endereco || "",
          recorrenciaPadrao: json.recorrenciaPadrao || 30,
          comissaoPadrao: json.comissaoPadrao || 10,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchServicos = useCallback(async () => {
    try {
      const res = await fetch("/api/servicos", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setServicos(json.data || json.servicos || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSegmentos = useCallback(async () => {
    try {
      const res = await fetch("/api/configuracoes/segmentos", {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setSegmentos(json.data || json.segmentos || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchIndicacoes = useCallback(async () => {
    try {
      const res = await fetch("/api/indicacao", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setIndicacoes(json.indicacoes || []);
        setCodigoIndicacao(json.codigoIndicacao || "");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPlano = useCallback(async () => {
    try {
      const res = await fetch("/api/planos", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setPlanoInfo({
          plano: json.plano || "starter",
          periodo: json.periodo || "mensal",
          codigoIndicacao: json.codigoIndicacao || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPagamentoConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/configuracoes/pagamentos", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setPagamentoConfig({
          mp_access_token: "",
          mp_access_token_masked: json.mp_access_token_masked || "",
          mp_access_token_configurado: json.mp_access_token_configurado || "false",
          mp_public_key: json.mp_public_key || "",
          pix_chave: json.pix_chave || "",
          gateway_ativo: json.gateway_ativo || "false",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchEmpresa(), fetchServicos(), fetchSegmentos(), fetchIndicacoes(), fetchPlano(), fetchPagamentoConfig()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchEmpresa, fetchServicos, fetchSegmentos, fetchIndicacoes, fetchPlano, fetchPagamentoConfig]);

  // Empresa handlers
  const handleSaveEmpresa = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/configuracoes/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(empresa),
      });
      if (res.ok) {
        showAlertMsg("success", "Dados da empresa salvos!");
      } else {
        showAlertMsg("error", "Erro ao salvar dados da empresa.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  // Servico handlers
  const openCreateServico = () => {
    setEditingServico(null);
    setServicoForm(emptyServico);
    setShowServicoModal(true);
  };

  const openEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setServicoForm({
      nome: servico.nome,
      descricao: servico.descricao,
      precoBase: servico.precoBase,
      duracaoMin: servico.duracaoMin,
      recorrenciaDias: servico.recorrenciaDias,
    });
    setShowServicoModal(true);
  };

  const handleSaveServico = async () => {
    try {
      setSaving(true);
      const method = editingServico ? "PUT" : "POST";
      const url = editingServico
        ? `/api/servicos/${editingServico.id}`
        : "/api/servicos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(servicoForm),
      });
      if (res.ok) {
        showAlertMsg(
          "success",
          editingServico ? "Servico atualizado!" : "Servico criado!"
        );
        setShowServicoModal(false);
        fetchServicos();
      } else {
        const err = await res.json();
        showAlertMsg("error", err.error || "Erro ao salvar servico.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteServico = async (id: string) => {
    if (!confirm("Excluir este servico?")) return;
    try {
      const res = await fetch(`/api/servicos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlertMsg("success", "Servico excluido!");
        fetchServicos();
      } else {
        showAlertMsg("error", "Erro ao excluir servico.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  // Segmento handlers
  const handleAddSegmento = async () => {
    if (!novoSegmento.trim()) return;
    try {
      const res = await fetch("/api/configuracoes/segmentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome: novoSegmento.trim() }),
      });
      if (res.ok) {
        showAlertMsg("success", "Segmento adicionado!");
        setNovoSegmento("");
        fetchSegmentos();
      } else {
        showAlertMsg("error", "Erro ao adicionar segmento.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const handleDeleteSegmento = async (id: string) => {
    if (!confirm("Excluir este segmento?")) return;
    try {
      const res = await fetch(`/api/configuracoes/segmentos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showAlertMsg("success", "Segmento excluido!");
        fetchSegmentos();
      } else {
        showAlertMsg("error", "Erro ao excluir segmento.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    }
  };

  const handleChangePlano = async (periodo: string) => {
    try {
      setSaving(true);
      const res = await fetch("/api/planos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ periodo }),
      });
      if (res.ok) {
        showAlertMsg("success", "Plano atualizado!");
        fetchPlano();
      } else {
        showAlertMsg("error", "Erro ao alterar plano.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/registro?ref=${codigoIndicacao}`;
    navigator.clipboard.writeText(link);
    showAlertMsg("success", "Link copiado!");
  };

  const shareReferral = () => {
    const link = `${window.location.origin}/registro?ref=${codigoIndicacao}`;
    const text = `Experimente o ServiPro! Use meu codigo de indicacao e ganhe beneficios: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSavePagamento = async () => {
    try {
      setSavingPagamento(true);
      const payload: any = {
        mp_public_key: pagamentoConfig.mp_public_key,
        pix_chave: pagamentoConfig.pix_chave,
        gateway_ativo: pagamentoConfig.gateway_ativo,
      };
      // Somente enviar token se o usuario digitou um novo
      if (pagamentoConfig.mp_access_token && !pagamentoConfig.mp_access_token.startsWith("****")) {
        payload.mp_access_token = pagamentoConfig.mp_access_token;
      }
      const res = await fetch("/api/configuracoes/pagamentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showAlertMsg("success", "Configuracoes de pagamento salvas!");
        fetchPagamentoConfig();
        setShowToken(false);
      } else {
        const err = await res.json();
        showAlertMsg("error", err.error || "Erro ao salvar configuracoes.");
      }
    } catch {
      showAlertMsg("error", "Erro de conexao.");
    } finally {
      setSavingPagamento(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: "empresa", label: "Empresa", icon: Building2 },
    { key: "servicos", label: "Servicos", icon: Wrench },
    { key: "segmentos", label: "Segmentos", icon: Tag },
    { key: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { key: "indicacao", label: "Indicacao", icon: Gift },
    { key: "plano", label: "Plano", icon: Crown },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-dark-800/50 p-1 rounded-xl border border-dark-700 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-500/10 text-brand-400"
                : "text-dark-400 hover:text-white hover:bg-dark-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empresa Tab */}
      {activeTab === "empresa" && (
        <div className="card max-w-2xl">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            Dados da Empresa
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={empresa.nome}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, nome: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={empresa.cnpj}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, cnpj: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={empresa.telefone}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, telefone: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={empresa.email}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, email: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">
                Endereco
              </label>
              <input
                type="text"
                value={empresa.endereco}
                onChange={(e) =>
                  setEmpresa({ ...empresa, endereco: e.target.value })
                }
                className="input-field w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Recorrencia Padrao (dias)
                </label>
                <input
                  type="number"
                  value={empresa.recorrenciaPadrao}
                  onChange={(e) =>
                    setEmpresa({
                      ...empresa,
                      recorrenciaPadrao: parseInt(e.target.value) || 30,
                    })
                  }
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Comissao Padrao (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={empresa.comissaoPadrao}
                  onChange={(e) =>
                    setEmpresa({
                      ...empresa,
                      comissaoPadrao: parseFloat(e.target.value) || 10,
                    })
                  }
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-dark-700">
              <button
                onClick={handleSaveEmpresa}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Alteracoes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Servicos Tab */}
      {activeTab === "servicos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-400" />
              Servicos Cadastrados
            </h3>
            <button onClick={openCreateServico} className="btn-primary">
              <Plus className="w-4 h-4" /> Novo Servico
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left p-3 text-dark-400 font-medium">
                      Nome
                    </th>
                    <th className="text-left p-3 text-dark-400 font-medium hidden sm:table-cell">
                      Descricao
                    </th>
                    <th className="text-right p-3 text-dark-400 font-medium">
                      Preco Base
                    </th>
                    <th className="text-center p-3 text-dark-400 font-medium hidden md:table-cell">
                      Duracao (min)
                    </th>
                    <th className="text-center p-3 text-dark-400 font-medium hidden md:table-cell">
                      Recorrencia (dias)
                    </th>
                    <th className="text-right p-3 text-dark-400 font-medium">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-dark-500"
                      >
                        Nenhum servico cadastrado.
                      </td>
                    </tr>
                  ) : (
                    servicos.map((servico) => (
                      <tr
                        key={servico.id}
                        className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                      >
                        <td className="p-3 text-white font-medium">
                          {servico.nome}
                        </td>
                        <td className="p-3 text-dark-300 hidden sm:table-cell truncate max-w-[200px]">
                          {servico.descricao || "-"}
                        </td>
                        <td className="p-3 text-right text-brand-400 font-medium">
                          {formatCurrency(servico.precoBase)}
                        </td>
                        <td className="p-3 text-center text-dark-300 hidden md:table-cell">
                          {servico.duracaoMin}
                        </td>
                        <td className="p-3 text-center text-dark-300 hidden md:table-cell">
                          {servico.recorrenciaDias}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditServico(servico)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-dark-800 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteServico(servico.id)
                              }
                              className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Segmentos Tab */}
      {activeTab === "segmentos" && (
        <div className="max-w-lg space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-400" />
            Segmentos de Atuacao
          </h3>

          {/* Add new */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={novoSegmento}
              onChange={(e) => setNovoSegmento(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSegmento();
              }}
              placeholder="Nome do segmento"
              className="input-field flex-1"
            />
            <button
              onClick={handleAddSegmento}
              disabled={!novoSegmento.trim()}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          {/* List */}
          <div className="card">
            {segmentos.length === 0 ? (
              <p className="text-dark-500 text-sm text-center py-4">
                Nenhum segmento cadastrado.
              </p>
            ) : (
              <div className="space-y-1">
                {segmentos.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-dark-500" />
                      <span className="text-sm text-white">{seg.nome}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSegmento(seg.id)}
                      className="p-1 rounded text-dark-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicacao Tab */}
      {activeTab === "indicacao" && (
        <div className="space-y-6 max-w-2xl">
          <div className="card">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-400" />
              Programa de Indicacao
            </h3>
            <p className="text-sm text-dark-400 mb-6">
              Indique novos clientes e ganhe <span className="text-brand-400 font-semibold">1 mes gratis</span> para cada indicacao que se converter!
            </p>

            <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-6">
              <p className="text-xs text-dark-400 mb-2">Seu codigo de indicacao:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-dark-900 px-4 py-2.5 rounded-lg text-brand-400 font-mono text-lg font-bold border border-dark-700">
                  {codigoIndicacao || "—"}
                </code>
                <button onClick={copyReferralLink} className="btn-ghost p-2.5" title="Copiar link">
                  <Copy className="w-5 h-5" />
                </button>
                <button onClick={shareReferral} className="btn-primary p-2.5" title="Compartilhar via WhatsApp">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Indicacoes list */}
            <h4 className="text-sm font-medium text-white mb-3">Suas Indicacoes</h4>
            {indicacoes.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-6">
                Nenhuma indicacao ainda. Compartilhe seu link!
              </p>
            ) : (
              <div className="space-y-2">
                {indicacoes.map((ind) => (
                  <div key={ind.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-dark-700">
                    <div>
                      <p className="text-sm text-white font-medium">{ind.indicadoNome || ind.indicadoEmail}</p>
                      <p className="text-xs text-dark-500">{new Date(ind.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={`badge text-[10px] ${
                      ind.status === "convertida"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : ind.status === "pendente"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-dark-700 text-dark-400 border-dark-600"
                    }`}>
                      {ind.status === "convertida" ? "Convertida" : ind.status === "pendente" ? "Pendente" : ind.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plano Tab */}
      {activeTab === "plano" && (
        <div className="space-y-6 max-w-2xl">
          <div className="card">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-brand-400" />
              Seu Plano
            </h3>
            <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white capitalize">{planoInfo.plano}</p>
                  <p className="text-sm text-dark-400">
                    Periodo: <span className="text-brand-400 capitalize">{planoInfo.periodo}</span>
                  </p>
                </div>
                <Crown className="w-8 h-8 text-brand-400" />
              </div>
            </div>

            <h4 className="text-sm font-medium text-white mb-3">Alterar Periodo</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleChangePlano("mensal")}
                disabled={saving}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  planoInfo.periodo === "mensal"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-dark-700 bg-dark-800/30 hover:border-dark-600"
                }`}
              >
                <p className="text-white font-semibold">Mensal</p>
                <p className="text-xs text-dark-400 mt-1">Cobranca mensal recorrente</p>
              </button>
              <button
                onClick={() => handleChangePlano("anual")}
                disabled={saving}
                className={`p-4 rounded-xl border text-left transition-colors relative ${
                  planoInfo.periodo === "anual"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-dark-700 bg-dark-800/30 hover:border-dark-600"
                }`}
              >
                <span className="absolute -top-2 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  2 MESES GRATIS
                </span>
                <p className="text-white font-semibold">Anual</p>
                <p className="text-xs text-dark-400 mt-1">Economize 2 meses por ano</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagamentos Tab */}
      {activeTab === "pagamentos" && (
        <div className="space-y-6 max-w-2xl">
          <div className="card">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-400" />
              Gateway de Pagamento - MercadoPago
            </h3>
            <p className="text-sm text-dark-400 mb-6">
              Integre com o MercadoPago para gerar cobranças PIX e Boleto automaticamente.
              Seus clientes poderao pagar diretamente pelo link gerado.
            </p>

            {/* Status do gateway */}
            <div className={`rounded-xl p-4 border mb-6 ${
              pagamentoConfig.mp_access_token_configurado === "true"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-amber-500/5 border-amber-500/20"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  pagamentoConfig.mp_access_token_configurado === "true"
                    ? "bg-emerald-400 shadow-lg shadow-emerald-500/30"
                    : "bg-amber-400 shadow-lg shadow-amber-500/30"
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    pagamentoConfig.mp_access_token_configurado === "true"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}>
                    {pagamentoConfig.mp_access_token_configurado === "true"
                      ? "Gateway configurado e ativo"
                      : "Gateway nao configurado (modo simulado)"}
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    {pagamentoConfig.mp_access_token_configurado === "true"
                      ? `Token: ${pagamentoConfig.mp_access_token_masked}`
                      : "Configure seu Access Token do MercadoPago para ativar cobranças reais"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Access Token */}
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Access Token (MercadoPago) *
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={pagamentoConfig.mp_access_token || (pagamentoConfig.mp_access_token_configurado === "true" ? pagamentoConfig.mp_access_token_masked : "")}
                    onChange={(e) =>
                      setPagamentoConfig({ ...pagamentoConfig, mp_access_token: e.target.value })
                    }
                    className="input-field w-full pr-10"
                    placeholder="APP_USR-xxxx-xxxx-xxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">
                  Encontre em:{" "}
                  <a
                    href="https://www.mercadopago.com.br/developers/panel/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    MercadoPago Developers <ExternalLink className="w-3 h-3" />
                  </a>
                  {" "}→ Suas aplicacoes → Credenciais de producao
                </p>
              </div>

              {/* Public Key */}
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Public Key (opcional)
                </label>
                <input
                  type="text"
                  value={pagamentoConfig.mp_public_key}
                  onChange={(e) =>
                    setPagamentoConfig({ ...pagamentoConfig, mp_public_key: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="APP_USR-xxxx"
                />
              </div>

              {/* Chave PIX fallback */}
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Chave PIX (fallback)
                </label>
                <input
                  type="text"
                  value={pagamentoConfig.pix_chave}
                  onChange={(e) =>
                    setPagamentoConfig({ ...pagamentoConfig, pix_chave: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="email@empresa.com.br ou CPF/CNPJ"
                />
                <p className="text-xs text-dark-500 mt-1">
                  Usada quando o gateway nao esta configurado (modo manual)
                </p>
              </div>

              {/* Ativar/Desativar */}
              <div className="flex items-center justify-between py-3 border-t border-dark-700">
                <div>
                  <p className="text-sm text-white font-medium">Cobranças automaticas</p>
                  <p className="text-xs text-dark-500">Gerar PIX/Boleto real via MercadoPago ao criar cobranca</p>
                </div>
                <button
                  onClick={() =>
                    setPagamentoConfig({
                      ...pagamentoConfig,
                      gateway_ativo: pagamentoConfig.gateway_ativo === "true" ? "false" : "true",
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pagamentoConfig.gateway_ativo === "true"
                      ? "bg-brand-500"
                      : "bg-dark-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      pagamentoConfig.gateway_ativo === "true"
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-dark-700">
                <button
                  onClick={handleSavePagamento}
                  disabled={savingPagamento}
                  className="btn-primary"
                >
                  {savingPagamento ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Configuracoes
                </button>
              </div>
            </div>
          </div>

          {/* Guia rapido */}
          <div className="card">
            <h4 className="text-white font-semibold mb-3 text-sm">Como configurar</h4>
            <ol className="text-dark-400 text-xs space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-brand-500/10 text-brand-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Crie uma conta no <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">MercadoPago Developers</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-500/10 text-brand-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Va em "Suas aplicacoes" e crie uma nova aplicacao</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-500/10 text-brand-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Copie o "Access Token" de producao e cole acima</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-500/10 text-brand-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Configure o webhook de notificacao para: <code className="bg-dark-800 px-1.5 py-0.5 rounded text-brand-400">{typeof window !== "undefined" ? window.location.origin : "https://seudominio.com"}/api/webhooks/mercadopago</code></span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Servico Modal */}
      {showServicoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowServicoModal(false)}
          />
          <div className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {editingServico ? "Editar Servico" : "Novo Servico"}
              </h2>
              <button
                onClick={() => setShowServicoModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={servicoForm.nome}
                  onChange={(e) =>
                    setServicoForm({
                      ...servicoForm,
                      nome: e.target.value,
                    })
                  }
                  className="input-field w-full"
                  placeholder="Ex: Dedetizacao Residencial"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  Descricao
                </label>
                <textarea
                  value={servicoForm.descricao}
                  onChange={(e) =>
                    setServicoForm({
                      ...servicoForm,
                      descricao: e.target.value,
                    })
                  }
                  className="input-field w-full h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Preco Base (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={servicoForm.precoBase}
                    onChange={(e) =>
                      setServicoForm({
                        ...servicoForm,
                        precoBase: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Duracao (min)
                  </label>
                  <input
                    type="number"
                    value={servicoForm.duracaoMin}
                    onChange={(e) =>
                      setServicoForm({
                        ...servicoForm,
                        duracaoMin: parseInt(e.target.value) || 60,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Recorrencia (dias)
                  </label>
                  <input
                    type="number"
                    value={servicoForm.recorrenciaDias}
                    onChange={(e) =>
                      setServicoForm({
                        ...servicoForm,
                        recorrenciaDias: parseInt(e.target.value) || 30,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowServicoModal(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveServico}
                disabled={saving || !servicoForm.nome || !servicoForm.precoBase}
                className="btn-primary"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingServico ? "Salvar" : "Criar Servico"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
