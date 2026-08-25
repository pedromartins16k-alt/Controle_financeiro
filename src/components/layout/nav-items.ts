import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  PieChart,
  Target,
  Wallet,
  CalendarDays,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Itens completos — usados na sidebar desktop. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/contas", label: "Contas", icon: Landmark },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/relatorios", label: "Relatórios", icon: PieChart },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/orcamentos", label: "Orçamentos", icon: Wallet },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

/** Subconjunto usado na navegação inferior mobile (máx. 5 itens). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Transações
  NAV_ITEMS[4], // Relatórios
  NAV_ITEMS[9], // Configurações
];
