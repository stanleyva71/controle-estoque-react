import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ productName, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
          modal-enter
        "
      >
        {/* Botão de fechar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Fechar modal"
          >
            <X size={21} />
          </button>
        </div>

        {/* Ícone */}
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-100
            text-red-600
          "
        >
          <AlertTriangle size={32} />
        </div>

        {/* Texto */}
        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold text-slate-900">Excluir produto?</h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Você tem certeza que deseja excluir{' '}
            <span className="font-semibold text-slate-700">
              "{productName}"
            </span>
            ?
          </p>

          <p className="mt-2 text-sm text-red-500">
            Esta ação não poderá ser desfeita.
          </p>
        </div>

        {/* Botões */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-xl
              border
              border-slate-300
              bg-white
              px-4
              py-3
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              active:scale-[0.98]
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:bg-red-700
              active:scale-[0.98]
            "
          >
            <Trash2 size={18} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;