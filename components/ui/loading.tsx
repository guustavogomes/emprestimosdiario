import { cn } from "@/src/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = "md", text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={cn(
          "animate-spin rounded-full border-blue-600 border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Loading para substituir conteúdo de página inteira
export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="lg" text="Carregando..." />
    </div>
  );
}

// Loading inline para botões
export function ButtonLoading() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}
