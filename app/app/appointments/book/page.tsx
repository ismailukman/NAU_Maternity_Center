import { Suspense } from 'react'
import BookAppointmentClient from './BookAppointmentClient'

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading booking form...
        </div>
      )}
    >
      <BookAppointmentClient />
    </Suspense>
  )
}
