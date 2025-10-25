import { Button } from '../ui/button'
import type { Booking, Room } from '../../api/ScheduleMock'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  room: Room | null
  centerName: string
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  room,
  centerName,
}: BookingDetailsModalProps) {
  if (!isOpen || !booking || !room) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">"{booking.title}"</h2>
              <p className="text-blue-100 text-sm">ID: {booking.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Duration Calculation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Tempo Previsto</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {(() => {
                  const [startH, startM] = booking.start.split(':').map(Number)
                  const [endH, endM] = booking.end.split(':').map(Number)
                  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                  const hours = Math.floor(durationMinutes / 60)
                  const minutes = durationMinutes % 60
                  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
                })()}
              </span>
            </div>
          </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient and Doctor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-semibold uppercase">Paciente</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{booking.patientName}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-semibold uppercase">Médico</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{booking.doctorName}</p>
            </div>
          </div>

          {/* Surgery Type and Urgency */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm font-medium">Tipo de Cirurgia</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{booking.surgeryType}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium">Urgência</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                    booking.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                    booking.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {booking.urgency === 'emergency' ? '🚨 Emergência' :
                     booking.urgency === 'high' ? '⚠️ Alta' :
                     booking.urgency === 'medium' ? '📋 Média' :
                     '✓ Baixa'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Data e Horário</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Data</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{new Date(booking.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Início</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{booking.start}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Término</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{booking.end}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Localização</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium">Centro Cirúrgico</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{centerName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-sm font-medium">Sala</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{room.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-white text-gray-700 cursor-pointer hover:bg-gray-100 border border-gray-300 rounded-lg"
          >
            Fechar
          </Button>
          {/* <Button
            onClick={onClose}
            className="px-6 py-2 bg-blue-400 text-white hover:bg-blue-500 rounded-lg"
          >
            Editar
          </Button> */}
        </div>
      </div>
    </div>
  )
}

