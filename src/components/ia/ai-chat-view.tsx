"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingDown,
  Target,
  PieChart,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { askFinancialAI, type ChatMessage } from "@/lib/supabase/ai-actions";

const INITIAL_SUGGESTIONS = [
  "Como posso economizar este mês?",
  "Quais foram meus maiores gastos?",
  "Como estão minhas metas financeiras?",
  "Qual o saldo previsto até o fim do mês?",
];

function FormattedMessage({ content }: { content: string }) {
  const parseLine = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            className="text-brand hover:underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="whitespace-pre-wrap">
      {content.split("\n").map((line, idx) => (
        <span key={idx}>
          {parseLine(line)}
          {idx < content.split("\n").length - 1 && "\n"}
        </span>
      ))}
    </div>
  );
}

export function AiChatView({ userName }: { userName: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá, ${userName}! Sou o seu Assistente Financeiro Inteligente 🤖✨\n\nAnaliso suas receitas, despesas, cartões, metas e orçamentos em tempo real para te ajudar a economizar e tomar melhores decisões.\n\nComo posso te ajudar hoje?`,
      timestamp: "Agora",
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await askFinancialAI(prompt, history);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Erro no chat IA:", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro temporário ao analisar seus dados. Tente novamente.",
        timestamp: "Agora",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Olá, ${userName}! Chat reiniciado. Como posso te ajudar com suas finanças agora?`,
        timestamp: "Agora",
        suggestions: INITIAL_SUGGESTIONS,
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)] min-h-[550px]">
      {/* Coluna Esquerda: Cards de Insights Rápidos */}
      <div className="hidden lg:flex flex-col gap-4">
        <Card className="p-4 bg-brand/5 border-brand/20">
          <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Consultoria 100% Gratuita</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Seu assistente combina inteligência de dados com insights personalizados para suas contas, metas e orçamentos.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Perguntas Frequentes
          </p>
          <div className="space-y-1.5">
            {INITIAL_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="w-full text-left rounded-xl border border-border bg-paper-raised/50 p-2.5 text-xs text-text-secondary hover:border-brand hover:text-text-primary transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        </Card>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetChat}
          className="gap-1.5 text-xs h-9 mt-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar Conversa
        </Button>
      </div>

      {/* Coluna Direita / Principal: Área do Chat */}
      <Card className="lg:col-span-3 flex flex-col h-full overflow-hidden border-border-strong bg-paper shadow-md">
        {/* Header do Chat */}
        <div className="flex items-center justify-between border-b border-border bg-paper-raised/40 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-paper-raised">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-text-primary">
                Assistente Financeiro IA
              </h2>
              <p className="text-[11px] text-text-muted">
                Análise em tempo real dos seus lançamentos
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            className="lg:hidden text-xs h-8"
          >
            Limpar
          </Button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? "items-start" : "items-end justify-end"}`}
              >
                {isAI && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isAI
                        ? "bg-paper-raised border border-border text-text-primary shadow-xs"
                        : "bg-brand text-paper-raised rounded-br-none"
                    }`}
                  >
                    <FormattedMessage content={msg.content} />
                  </div>

                  {/* Sugestões de Respostas Rápidas */}
                  {isAI && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleSend(sug)}
                          disabled={loading}
                          className="rounded-full border border-border-strong bg-paper px-3 py-1 text-[11px] font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`block text-[10px] text-text-muted ${isAI ? "text-left pl-1" : "text-right pr-1"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isAI && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong dark:text-brand font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-paper-raised border border-border px-4 py-3 text-xs text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                <span>Analisando suas contas e transações...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-border bg-paper p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre seus gastos, metas, orçamentos ou como economizar..."
              disabled={loading}
              className="flex-1 rounded-full border border-border-strong bg-paper-raised px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="h-10 w-10 rounded-full p-0 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
