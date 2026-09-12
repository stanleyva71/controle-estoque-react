import { useEffect } from 'react';

import {
  CheckCircle2,
  X,
  XCircle,
} from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

function Toast({
  message,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const isError =
    message.includes('não foi possível') ||
    message.includes('não tem permissão') ||
    message.includes('inválido') ||
    message.includes('obrigatório') ||
    message.includes('não encontrado') ||
    message.includes('Já existe') ||
    message.includes('Não é possível') ||
    message.includes('não pode');

  return (
    <div
      className={`fixed right-5 top-5 z-50 flex w-[calc(100%-2.5rem)] max-w-md items-center gap-3 rounded-xl border bg-white p-4 shadow-xl toast-enter ${
        isError
          ? 'border-red-200'
          : 'border-green-200'
      }`}
    >
      {isError ? (
        <XCircle
          size={25}
          className="shrink-0 text-red-600"
        />
      ) : (
        <CheckCircle2
          size={25}
          className="shrink-0 text-green-600"
        />
      )}

      <div className="flex-1">
        <p className="font-semibold text-slate-800">
          {isError
            ? 'Operação não realizada!'
            : 'Operação realizada!'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Fechar notificação"
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default Toast;