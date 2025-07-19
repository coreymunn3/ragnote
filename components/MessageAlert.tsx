import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TriangleAlertIcon, InfoIcon } from "lucide-react";

type MessageVariant = "error" | "warning" | "info";

interface MessageAlertProps {
  variant: MessageVariant;
  title?: string;
  description: string;
}

const MessageAlert: React.FC<MessageAlertProps> = ({
  variant,
  title,
  description,
}) => {
  // Map our variants to shadcn Alert variants and appropriate icons
  const variantMap = {
    error: {
      alertVariant: "destructive" as const,
      icon: <TriangleAlertIcon className="h-4 w-4" />,
      defaultTitle: "Error",
      className:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    warning: {
      alertVariant: "default" as const,
      icon: <TriangleAlertIcon className="h-4 w-4" />,
      defaultTitle: "Warning",
      className:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    },
    info: {
      alertVariant: "default" as const,
      icon: <InfoIcon className="h-4 w-4" />,
      defaultTitle: "Information",
      className:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
  };

  const { alertVariant, icon, defaultTitle, className } = variantMap[variant];

  return (
    <Alert variant={alertVariant} className={className}>
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default MessageAlert;
