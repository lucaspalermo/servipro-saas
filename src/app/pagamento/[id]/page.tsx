"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PagamentoData {
  descricao: string;
  valor: number;
  tipo: "pix" | "boleto";
  status: string;
  dataVencimento: string | null;
  dataPagamento: string | null;
  chavePix: string | null;
  qrCode: string | null;
  codigoBoleto: string | null;
  linkPagamento: string | null;
  empresa: string;
  empresaTelefone: string | null;
  empresaEmail: string | null;
  clienteNome: string;
}

export default function PagamentoPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<PagamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Polling para atualizar status automaticamente quando pendente
  useEffect(() => {
    if (data?.status !== "pendente") return;
    setPolling(true);
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000); // Verifica a cada 10 segundos
    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [data?.status]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/pagamento/${id}`);
      if (!res.ok) {
        setError("Cobranca nao encontrada ou link invalido.");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Erro ao carregar dados do pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback para navegadores antigos
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Pagamento nao encontrado</h1>
          <p className="text-gray-400 text-sm">{error || "Este link de pagamento e invalido ou expirou."}</p>
        </div>
      </div>
    );
  }

  const isPago = data.status === "pago";
  const isCancelado = data.status === "cancelado";
  const isPendente = data.status === "pendente";

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header / Empresa */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">{data.empresa}</h1>
          <p className="text-gray-500 text-xs mt-0.5">Pagamento seguro</p>
        </div>

        {/* Card principal */}
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Status banner */}
          {isPago && (
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-emerald-400 font-semibold text-sm">Pagamento Confirmado!</span>
            </div>
          )}
          {isCancelado && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-semibold text-sm">Pagamento Cancelado</span>
            </div>
          )}

          {/* Detalhes */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Para: {data.clienteNome}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isPago ? "bg-emerald-500/10 text-emerald-400" :
                isCancelado ? "bg-red-500/10 text-red-400" :
                "bg-amber-500/10 text-amber-400"
              }`}>
                {isPago ? "Pago" : isCancelado ? "Cancelado" : "Pendente"}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-1">{data.descricao}</p>

            <div className="text-3xl font-bold text-white mt-3 mb-4">
              {formatCurrency(data.valor)}
            </div>

            {data.dataVencimento && (
              <p className="text-gray-500 text-xs mb-4">
                Vencimento: {formatDate(data.dataVencimento)}
              </p>
            )}
            {isPago && data.dataPagamento && (
              <p className="text-emerald-400/70 text-xs mb-4">
                Pago em: {formatDate(data.dataPagamento)}
              </p>
            )}

            {/* ── PIX Section ──────────────────────────────────────────── */}
            {isPendente && data.tipo === "pix" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.152 1.633l3.84 3.84a2.18 2.18 0 010 3.083l-1.29 1.29a.436.436 0 01-.617 0L11.4 6.161a.436.436 0 010-.617l1.29-1.29a.218.218 0 00.064-.155.218.218 0 00-.064-.155l-1.29-1.29a2.18 2.18 0 010-3.083l.669-.669a.218.218 0 01.309 0l.774.731zm-2.304 9.894l3.685 3.685a.436.436 0 010 .617l-1.29 1.29a2.18 2.18 0 01-3.083 0l-3.84-3.84a.218.218 0 010-.309l.669-.669a2.18 2.18 0 013.083 0l1.29 1.29a.218.218 0 00.155.064.218.218 0 00.155-.064l1.29-1.29a.436.436 0 01.617 0l-2.731-2.774zm9.519-2.774l-3.685-3.685a.436.436 0 010-.617l1.29-1.29a2.18 2.18 0 013.083 0l3.84 3.84a.218.218 0 010 .309l-.669.669a2.18 2.18 0 01-3.083 0l-1.29-1.29a.218.218 0 00-.309 0l-1.29 1.29a.436.436 0 01-.617 0l2.73 2.774zm-9.894 2.304L6.788 7.372a.436.436 0 010-.617l1.29-1.29a.218.218 0 00.064-.155.218.218 0 00-.064-.155L6.788 3.865a2.18 2.18 0 010-3.083L7.457.113a.218.218 0 01.309 0l.774.731-3.84 3.84a2.18 2.18 0 000 3.083l3.84 3.84a2.18 2.18 0 003.083 0l3.84-3.84-.731-.774a.218.218 0 010-.309l.669-.669a2.18 2.18 0 013.083 0l1.29 1.29a.218.218 0 00.155.064.218.218 0 00.155-.064l1.29-1.29a.436.436 0 01.617 0l-3.685 3.685" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm">Pagar com PIX</span>
                </div>

                {/* QR Code (se tiver base64 do MercadoPago) */}
                {data.qrCode && data.qrCode.startsWith("data:") && (
                  <div className="flex justify-center p-4 bg-white rounded-xl">
                    <img
                      src={data.qrCode}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                )}

                {/* Codigo PIX copia e cola */}
                {data.chavePix && (
                  <div>
                    <p className="text-gray-400 text-xs mb-2">Codigo PIX (copia e cola):</p>
                    <div className="bg-gray-900/80 border border-gray-600 rounded-xl p-3 flex items-start gap-2">
                      <code className="text-emerald-400 text-xs break-all flex-1 font-mono leading-relaxed">
                        {data.chavePix}
                      </code>
                      <button
                        onClick={() => handleCopy(data.chavePix!)}
                        className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Copiar"
                      >
                        {copied ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-emerald-400 text-xs mt-1.5 text-center font-medium">
                        Codigo copiado!
                      </p>
                    )}
                  </div>
                )}

                {/* Instrucoes */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs font-medium mb-2">Como pagar:</p>
                  <ol className="text-gray-500 text-xs space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500/10 text-emerald-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                      Abra o app do seu banco
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500/10 text-emerald-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                      Escolha pagar via PIX (copia e cola)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500/10 text-emerald-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                      Cole o codigo acima e confirme
                    </li>
                  </ol>
                </div>

                {/* Polling indicator */}
                {polling && (
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border border-emerald-500 border-t-transparent" />
                    Aguardando confirmacao do pagamento...
                  </div>
                )}
              </div>
            )}

            {/* ── Boleto Section ────────────────────────────────────────── */}
            {isPendente && data.tipo === "boleto" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm">Pagar com Boleto</span>
                </div>

                {/* Linha digitavel */}
                {data.codigoBoleto && (
                  <div>
                    <p className="text-gray-400 text-xs mb-2">Linha digitavel:</p>
                    <div className="bg-gray-900/80 border border-gray-600 rounded-xl p-3 flex items-start gap-2">
                      <code className="text-blue-400 text-xs break-all flex-1 font-mono leading-relaxed">
                        {data.codigoBoleto}
                      </code>
                      <button
                        onClick={() => handleCopy(data.codigoBoleto!)}
                        className="flex-shrink-0 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Copiar"
                      >
                        {copied ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-blue-400 text-xs mt-1.5 text-center font-medium">
                        Codigo copiado!
                      </p>
                    )}
                  </div>
                )}

                {/* Link do boleto PDF */}
                {data.linkPagamento && data.linkPagamento.startsWith("http") && (
                  <a
                    href={data.linkPagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
                  >
                    Abrir Boleto (PDF)
                  </a>
                )}

                {polling && (
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent" />
                    Aguardando confirmacao do pagamento...
                  </div>
                )}
              </div>
            )}

            {/* ── Pago - Sucesso ────────────────────────────────────────── */}
            {isPago && (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-emerald-400 font-semibold text-lg">Pagamento confirmado!</p>
                <p className="text-gray-500 text-sm mt-1">Obrigado, {data.clienteNome}.</p>
              </div>
            )}
          </div>

          {/* Footer com contato da empresa */}
          <div className="border-t border-gray-700 px-6 py-4">
            <p className="text-gray-500 text-xs text-center">
              Duvidas? Entre em contato com {data.empresa}
              {data.empresaTelefone && (
                <a
                  href={`https://wa.me/55${data.empresaTelefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline ml-1"
                >
                  via WhatsApp
                </a>
              )}
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-gray-600 text-[10px] mt-4">
          Pagamento processado por ServiPro
        </p>
      </div>
    </div>
  );
}
