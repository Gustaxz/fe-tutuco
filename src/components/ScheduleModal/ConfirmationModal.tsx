import { Button } from '../ui/button'

interface ConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-400 text-white hover:bg-blue-500 rounded-lg"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

