import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Booking {
  id: string
  studentId: string
  classId: string
  className: string
  coachId: string
  coachName: string
  locationId: string
  locationName: string
  bookingDate: string
  classDate: string
  classTime: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'pending' | 'failed'
  amount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingDTO {
  studentId: string
  classId: string
  locationId: string
  notes?: string
}

export interface UpdateBookingDTO {
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus?: 'paid' | 'pending' | 'failed'
  notes?: string
}

export interface BookingListResponse {
  success: boolean
  data: {
    bookings: Booking[]
    total: number
    page: number
    limit: number
  }
}

export interface BookingDetailResponse {
  success: boolean
  data: Booking
}

// Alias for compatibility
export type BookingResponse = BookingDetailResponse

export interface BookingStatsResponse {
  success: boolean
  data: {
    totalBookings: number
    confirmedBookings: number
    pendingBookings: number
    cancelledBookings: number
    completedBookings: number
    totalRevenue: number
    averageBookingValue: number
    bookingsByStatus: Record<string, number>
    bookingsByLocation: Record<string, number>
  }
}

class BookingService {
  private readonly MODULE_NAME = 'booking'

  async getBookings(filters?: {
    page?: number
    limit?: number
    studentId?: string
    classId?: string
    status?: string
    locationId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<BookingListResponse> {
    try {
      const response = await apiClient.get<BookingListResponse>(
        '/bookings',
        { params: filters }
      )
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async createBooking(data: any): Promise<BookingResponse> {
    try {
      const response = await apiClient.post<BookingResponse>('/bookings', data)
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async updateBooking(id: string, data: UpdateBookingDTO): Promise<BookingResponse> {
    try {
      const response = await apiClient.put<BookingResponse>(`/bookings/${id}`, data)
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async cancelBooking(id: string, reason?: string): Promise<BookingResponse> {
    try {
      const response = await apiClient.put<BookingResponse>(`/bookings/${id}/cancel`, { reason })
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async getStudentBookings(studentId: string): Promise<BookingListResponse> {
    try {
      const response = await apiClient.get<BookingListResponse>(
        `/bookings/student/${studentId}`
      )
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async getCoachBookings(coachId: string): Promise<BookingListResponse> {
    try {
      const response = await apiClient.get<BookingListResponse>(
        `/bookings/coach/${coachId}`
      )
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<BookingListResponse> {
    try {
      const response = await apiClient.get<BookingListResponse>(
        '/bookings/date-range',
        { params: { startDate, endDate } }
      )
      return response
    } catch (error) {
      const appError = ErrorHandler.classifyError(error)
      ErrorHandler.logError(appError, this.MODULE_NAME)
      throw error
    }
  }
}

export const bookingService = new BookingService()
export default BookingService
