"use client";

import * as React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative group">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(
          "pr-10 transition-all duration-300 focus:ring-2 focus:ring-blue-400",
          className
        )}
        {...props}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showPassword ? "eye-off" : "eye"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="absolute right-2 top-0 h-full flex items-center justify-center"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-gray-100/80 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            onClick={togglePassword}
            tabIndex={-1}
          >
            <motion.div
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 