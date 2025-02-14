import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { type ReactNode } from "react";

interface CustomToastProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string | ReactNode;
  onClose?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "text-[#34D399]",
  error: "text-[#EF4444]",
  warning: "text-[#FBBF24]",
  info: "text-[#3B82F6]",
};

const progressColors = {
  success: "bg-[#34D399]",
  error: "bg-[#EF4444]",
  warning: "bg-[#FBBF24]",
  info: "bg-[#3B82F6]",
};

export function CustomToast({ type, title, description, onClose }: CustomToastProps) {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative bg-white rounded-lg shadow-lg overflow-hidden min-w-[300px] max-w-[400px] border border-gray-100"
    >
      <div className="flex items-start gap-3 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="flex-shrink-0"
        >
          <Icon className={`h-5 w-5 ${colors[type]}`} />
        </motion.div>
        <div className="flex-1 pt-0.5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-gray-900 mb-1"
          >
            {title}
          </motion.div>
          {description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-600"
            >
              {description}
            </motion.div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <motion.div
        className={`h-0.5 ${progressColors[type]}`}
        initial={{ width: "0%", opacity: 0.5 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{
          duration: 3,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
} 