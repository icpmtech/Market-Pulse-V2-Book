import React, { useState, useEffect } from 'react';
import {
  googleSignIn,
  initAuth,
  logoutUser,
  getAccessToken,
} from '../services/authService';
import { sendEmailViaGmail, getGmailProfile, GmailProfile } from '../services/gmailService';
import { StockQuote, AnalystInsights, TechnicalIndicators, FundamentalMetrics } from '../types/finance';
import { formatCurrency, formatNumber } from '../services/storageService';
import {
  Mail,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Sparkles,
  FileText,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: StockQuote | null;
  insights: AnalystInsights | null;
  technical: TechnicalIndicators | null;
  fundamental: FundamentalMetrics | null;
}

export const GmailShareModal: React.FC<GmailShareModalProps> = ({
  isOpen,
  onClose,
  quote,
  insights,
  technical,
  fundamental,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize Auth state
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        if (token) {
          getGmailProfile(token).then(setProfile).catch(() => {});
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setProfile(null);
      }
    );

    // Pre-fill recipient with logged user email if available
    if (user?.email && !recipient) {
      setRecipient(user.email);
    }

    if (quote) {
      const isPositive = quote.regularMarketChangePercent >= 0;
      const sign = isPositive ? '+' : '';
      setSubject(
        `[Market Pulse Report] Relatório Financeiro: ${quote.symbol} - ${formatCurrency(
          quote.regularMarketPrice,
          quote.currency
        )} (${sign}${quote.regularMarketChangePercent.toFixed(2)}%)`
      );
    }

    return () => unsubscribe();
  }, [isOpen, quote]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setLoadingAuth(true);
    setSendError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        if (!recipient) setRecipient(res.user.email || '');
        const prof = await getGmailProfile(res.accessToken).catch(() => null);
        if (prof) setProfile(prof);
      }
    } catch (err: any) {
      setSendError('Falha ao autenticar com o Google. Certifique-se de permitir o acesso.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setAccessToken(null);
    setProfile(null);
  };

  // Generate plain text report
  const generateTextBody = (): string => {
    if (!quote) return 'Sem dados do ativo.';
    return `MARKET PULSE - RELATÓRIO FINANCEIRO & ANÁLISE DE ATIVO
===================================================================

Símbolo: ${quote.symbol} (${quote.shortName})
Preço Atual: ${formatCurrency(quote.regularMarketPrice, quote.currency)}
Variação do Dia: ${quote.regularMarketChangePercent >= 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%
Bolsa / Estado: ${quote.exchange} (${quote.marketState})
Máxima 52 Semanas: ${formatCurrency(quote.fiftyTwoWeekHigh, quote.currency)}
Mínima 52 Semanas: ${formatCurrency(quote.fiftyTwoWeekLow, quote.currency)}
Cap. de Mercado: $${formatNumber(quote.marketCap || 0)}

${technical ? `ANÁLISE TÉCNICA
-------------------------------------------------------------------
Sinal Geral: ${technical.summary.overallSignal} (Pontuação: ${technical.summary.score}/100)
RSI (14): ${technical.rsi14[technical.rsi14.length - 1]?.toFixed(2) || 'N/A'} (${technical.summary.rsiStatus})
Suporte (S1): ${formatCurrency(technical.pivotPoints.s1, quote.currency)}
Resistência (R1): ${formatCurrency(technical.pivotPoints.r1, quote.currency)}
` : ''}

${insights ? `CONSERSO DE ANALISTAS (Yahoo Finance)
-------------------------------------------------------------------
Recomendação Média: ${insights.recommendationKey.toUpperCase()}
Preço-Alvo Médio: $${insights.targetMeanPrice.toFixed(2)}
Potencial de Valorização (Upside): ${insights.upsidePotentialPercent.toFixed(2)}%
Total de Opiniões: ${insights.numberOfAnalystOpinions} analistas
` : ''}

Gerado via Market Pulse - Yahoo Finance & Technical Analysis Platform.
    `;
  };

  // Generate HTML report for Gmail
  const generateHtmlBody = (): string => {
    if (!quote) return '';
    const isPos = quote.regularMarketChangePercent >= 0;
    const color = isPos ? '#10b981' : '#f43f5e';

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #1e293b;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; margin: 0 0 4px 0; font-size: 20px;">⚡ Market Pulse Report</h2>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 22px; font-weight: 800; color: #ffffff;">${quote.symbol}</span>
              <span style="font-size: 13px; color: #94a3b8; margin-left: 8px;">${quote.shortName}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 800; color: #ffffff;">${formatCurrency(quote.regularMarketPrice, quote.currency)}</div>
              <div style="font-size: 13px; font-weight: 700; color: ${color};">${isPos ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Cap. Mercado</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: 600; color: #ffffff;">$${formatNumber(quote.marketCap || 0)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Máx / Mín (52 sem)</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: 600; color: #ffffff;">$${quote.fiftyTwoWeekHigh.toFixed(2)} / $${quote.fiftyTwoWeekLow.toFixed(2)}</td>
          </tr>
          ${quote.trailingPE ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155;">P/L Trailing</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: 600; color: #ffffff;">${quote.trailingPE.toFixed(2)}x</td>
          </tr>` : ''}
          ${insights ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Consenso de Analistas</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: 600; color: #38bdf8;">${insights.recommendationKey.toUpperCase()} (Alvo Média: $${insights.targetMeanPrice.toFixed(2)})</td>
          </tr>` : ''}
          ${technical ? `
          <tr>
            <td style="padding: 8px 0;">Sinal Técnico</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #10b981;">${technical.summary.overallSignal} (Score: ${technical.summary.score}/100)</td>
          </tr>` : ''}
        </table>

        <div style="font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 16px;">
          Enviado com permissão através da integração oficial Google Workspace Gmail API.
        </div>
      </div>
    `;
  };

  const handleRequestSend = () => {
    if (!recipient || !recipient.includes('@')) {
      setSendError('Por favor insira um endereço de e-mail de destino válido.');
      return;
    }
    setSendError(null);
    // Mandatory Confirmation Dialog Step
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
      }

      if (!token) {
        throw new Error('Usuário não autenticado. Por favor, faça login com o Google novamente.');
      }

      const res = await sendEmailViaGmail(token, {
        to: recipient,
        subject,
        bodyText: generateTextBody(),
        bodyHtml: generateHtmlBody(),
      });

      setSendSuccess(`E-mail enviado com sucesso via Gmail! ID da mensagem: ${res.id}`);
    } catch (err: any) {
      setSendError(err.message || 'Falha ao enviar e-mail via Gmail API.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <Mail className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Compartilhar Relatório via Gmail
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Gmail API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Envie o relatório técnico e fundamentalista diretamente do seu Gmail.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* User Auth Status / Sign-In */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-700" />
                  ) : (
                    <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white">{user.displayName || 'Usuário Google'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition text-xs flex items-center gap-1"
                  title="Sair do Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Autenticação Google Workspace
                  </div>
                  <div className="text-[11px] text-slate-400">Conecte sua conta do Google para disparar mensagens via Gmail.</div>
                </div>

                {/* Standard Google Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={loadingAuth}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs px-4 py-2 rounded-lg transition shadow-md shrink-0 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  {loadingAuth ? 'Conectando...' : 'Sign in with Google'}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail do Destinatário:</label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="ex: investidor@exemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assunto da Mensagem:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prévia do Relatório a Ser Enviado:</label>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {generateTextBody()}
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {sendError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{sendError}</div>
            </div>
          )}

          {sendSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{sendSuccess}</div>
            </div>
          )}

          {/* Mandatory Confirmation Step Modal Overlay */}
          {showConfirm && (
            <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl space-y-3">
              <div className="flex items-start gap-2 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 mb-0.5">Confirmar Envio de E-mail via Gmail</strong>
                  Tem certeza que deseja enviar o relatório de <strong>{quote?.symbol}</strong> para{' '}
                  <code className="text-white bg-slate-900 px-1 py-0.5 rounded">{recipient}</code>?
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSend}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Sim, Enviar E-mail
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Powered by Google Workspace Gmail API
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Fechar
            </button>

            {!showConfirm && (
              <button
                onClick={handleRequestSend}
                disabled={sending || !user}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-rose-600/20 transition"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {user ? 'Enviar Relatório' : 'Faça Login para Enviar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
