import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AlertBox({ type, message }) {
  const configs = {
    success: {
      bg: "bg-emerald-900/30 border-emerald-500/50",
      text: "text-emerald-300",
      icon: CheckCircle
    },
    warning: {
      bg: "bg-yellow-900/30 border-yellow-500/50", 
      text: "text-yellow-300",
      icon: AlertTriangle
    },
    error: {
      bg: "bg-red-900/30 border-red-500/50",
      text: "text-red-300", 
      icon: XCircle
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bg} flex items-center gap-3`}>
      <Icon className={`w-5 h-5 ${config.text}`} />
      <span className={`${config.text} font-medium`}>{message}</span>
    </div>
  );
}
