import { apiClient } from '../api/client';

// ============================================================================
// COMMON INTERFACES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// USER INTERFACES
// ============================================================================

export type UserRole =
  | 'super_admin'
  | 'hq_admin'
  | 'manager'
  | 'location_manager'
  | 'staff'
  | 'trainer'
  | 'parent'
  | 'user';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersParams extends PaginationParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  status?: UserStatus;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

// ============================================================================
// BUSINESS CONFIG (BCMS) INTERFACES
// ============================================================================

export interface BusinessUnit {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  currency?: string;
  timezone?: string;
  businessUnitId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  _id: string;
  name: string;
  code: string;
  countryId?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  _id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  regionId?: string;
  countryId?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  name: string;
  locationId: string;
  capacity?: number;
  type?: string;
  amenities?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayCalendar {
  _id: string;
  name: string;
  date: string;
  locationId?: string;
  countryId?: string;
  recurring?: boolean;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessUnitPayload {
  name: string;
  code: string;
  description?: string;
}

export interface CreateCountryPayload {
  name: string;
  code: string;
  currency?: string;
  timezone?: string;
  businessUnitId?: string;
}

export interface CreateRegionPayload {
  name: string;
  code: string;
  countryId?: string;
  description?: string;
}

export interface CreateLocationPayload {
  name: string;
  code: string;
  address?: string;
  city?: string;
  regionId?: string;
  countryId?: string;
  phone?: string;
  email?: string;
  capacity?: number;
}

export interface CreateRoomPayload {
  name: string;
  locationId: string;
  capacity?: number;
  type?: string;
  amenities?: string[];
}

export interface CreateTermPayload {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface CreateHolidayCalendarPayload {
  name: string;
  date: string;
  locationId?: string;
  countryId?: string;
  recurring?: boolean;
  description?: string;
}

// ============================================================================
// PROGRAM INTERFACES
// ============================================================================

export type ProgramType = 'class' | 'course' | 'workshop' | 'camp' | 'event';
export type ProgramLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type ProgramStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface Program {
  _id: string;
  name: string;
  description?: string;
  type: ProgramType;
  level: ProgramLevel;
  status: ProgramStatus;
  duration?: number;
  maxCapacity?: number;
  minAge?: number;
  maxAge?: number;
  price?: number;
  locationId?: string;
  categoryId?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProgramsParams extends PaginationParams {
  type?: ProgramType;
  level?: ProgramLevel;
  status?: ProgramStatus;
  search?: string;
}

export interface CreateProgramPayload {
  name: string;
  description?: string;
  type: ProgramType;
  level: ProgramLevel;
  duration?: number;
  maxCapacity?: number;
  minAge?: number;
  maxAge?: number;
  price?: number;
  locationId?: string;
  categoryId?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateProgramPayload extends Partial<CreateProgramPayload> {
  status?: ProgramStatus;
}

export interface ProgramStatistics {
  totalPrograms: number;
  activePrograms: number;
  totalEnrollments: number;
  averageCapacityUtilization: number;
  programsByType: Record<string, number>;
  programsByLevel: Record<string, number>;
}

export interface ProgramCategory {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// ============================================================================
// SCHEDULING INTERFACES
// ============================================================================

export interface Schedule {
  _id: string;
  programId: string;
  locationId?: string;
  roomId?: string;
  trainerId?: string;
  startTime: string;
  endTime: string;
  recurrence?: string;
  status: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateSchedulePayload {
  programId: string;
  locationId?: string;
  roomId?: string;
  trainerId?: string;
  startDate: string;
  endDate: string;
  recurrence?: string;
  timeSlots?: Array<{ day: string; startTime: string; endTime: string }>;
}

export interface UpdateSchedulePayload {
  programId?: string;
  locationId?: string;
  roomId?: string;
  trainerId?: string;
  startTime?: string;
  endTime?: string;
  recurrence?: string;
  status?: string;
}

export interface ScheduleConflict {
  scheduleId: string;
  conflictType: string;
  conflictingScheduleId?: string;
  message: string;
}

// ============================================================================
// BOOKING INTERFACES
// ============================================================================

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  _id: string;
  userId: string;
  scheduleId: string;
  programId?: string;
  status: BookingStatus;
  bookingDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetBookingsParams extends PaginationParams {
  userId?: string;
  scheduleId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateBookingPayload {
  userId: string;
  scheduleId: string;
  programId?: string;
  notes?: string;
}

export interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  noShowCount: number;
  bookingsByDate: Record<string, number>;
}

// ============================================================================
// STAFF INTERFACES
// ============================================================================

export interface Staff {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  specializations?: string[];
  locationIds?: string[];
  availability?: Record<string, any>;
  hireDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetStaffParams extends PaginationParams {
  role?: string;
  locationId?: string;
  status?: string;
  search?: string;
}

export interface CreateStaffPayload {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  specializations?: string[];
  locationIds?: string[];
  availability?: Record<string, any>;
  hireDate?: string;
}

export interface UpdateStaffPayload extends Partial<CreateStaffPayload> {
  status?: string;
}

export interface StaffStatisticsOverview {
  totalStaff: number;
  activeStaff: number;
  staffByRole: Record<string, number>;
  staffByLocation: Record<string, number>;
}

// ============================================================================
// ATTENDANCE INTERFACES
// ============================================================================

export interface AttendanceRecord {
  _id: string;
  userId: string;
  scheduleId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  method?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInPayload {
  userId: string;
  scheduleId: string;
  method?: string;
  notes?: string;
}

export interface GetAttendanceParams extends PaginationParams {
  userId?: string;
  scheduleId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AttendanceStatistics {
  totalCheckIns: number;
  averageAttendanceRate: number;
  attendanceByDate: Record<string, number>;
  attendanceByProgram: Record<string, number>;
}

// ============================================================================
// FEATURE FLAG INTERFACES
// ============================================================================

export interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  rolloutPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagPayload {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  rolloutPercentage?: number;
}

export interface UpdateFeatureFlagPayload extends Partial<CreateFeatureFlagPayload> {}

// ============================================================================
// USER SERVICE
// ============================================================================

class UserService {
  private basePath = '/users';

  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    try {
      return await apiClient.get<PaginatedResponse<User>>(this.basePath, { params });
    } catch (error) {
      console.error('[UserService] Failed to fetch users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      return await apiClient.get<ApiResponse<User>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[UserService] Failed to fetch user ${id}:`, error);
      throw error;
    }
  }

  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    try {
      return await apiClient.post<ApiResponse<User>>(this.basePath, payload);
    } catch (error) {
      console.error('[UserService] Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    try {
      return await apiClient.put<ApiResponse<User>>(`${this.basePath}/${id}`, payload);
    } catch (error) {
      console.error(`[UserService] Failed to update user ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[UserService] Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  async updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<ApiResponse<User>> {
    try {
      return await apiClient.patch<ApiResponse<User>>(`${this.basePath}/${id}/status`, payload);
    } catch (error) {
      console.error(`[UserService] Failed to update user status ${id}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// BCMS (Business Configuration Management) SERVICE
// ============================================================================

class BCMSService {
  // ---- Business Units ----

  async getBusinessUnits(params?: PaginationParams): Promise<PaginatedResponse<BusinessUnit>> {
    try {
      return await apiClient.get<PaginatedResponse<BusinessUnit>>('/business-units', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch business units:', error);
      throw error;
    }
  }

  async getBusinessUnitById(id: string): Promise<ApiResponse<BusinessUnit>> {
    try {
      return await apiClient.get<ApiResponse<BusinessUnit>>(`/business-units/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch business unit ${id}:`, error);
      throw error;
    }
  }

  async createBusinessUnit(payload: CreateBusinessUnitPayload): Promise<ApiResponse<BusinessUnit>> {
    try {
      return await apiClient.post<ApiResponse<BusinessUnit>>('/business-units', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create business unit:', error);
      throw error;
    }
  }

  async updateBusinessUnit(id: string, payload: Partial<CreateBusinessUnitPayload>): Promise<ApiResponse<BusinessUnit>> {
    try {
      return await apiClient.put<ApiResponse<BusinessUnit>>(`/business-units/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update business unit ${id}:`, error);
      throw error;
    }
  }

  async deleteBusinessUnit(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/business-units/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete business unit ${id}:`, error);
      throw error;
    }
  }

  // ---- Countries ----

  async getCountries(params?: PaginationParams): Promise<PaginatedResponse<Country>> {
    try {
      return await apiClient.get<PaginatedResponse<Country>>('/countries', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch countries:', error);
      throw error;
    }
  }

  async getCountryById(id: string): Promise<ApiResponse<Country>> {
    try {
      return await apiClient.get<ApiResponse<Country>>(`/countries/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch country ${id}:`, error);
      throw error;
    }
  }

  async createCountry(payload: CreateCountryPayload): Promise<ApiResponse<Country>> {
    try {
      return await apiClient.post<ApiResponse<Country>>('/countries', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create country:', error);
      throw error;
    }
  }

  async updateCountry(id: string, payload: Partial<CreateCountryPayload>): Promise<ApiResponse<Country>> {
    try {
      return await apiClient.put<ApiResponse<Country>>(`/countries/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update country ${id}:`, error);
      throw error;
    }
  }

  async deleteCountry(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/countries/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete country ${id}:`, error);
      throw error;
    }
  }

  // ---- Regions ----

  async getRegions(params?: PaginationParams): Promise<PaginatedResponse<Region>> {
    try {
      return await apiClient.get<PaginatedResponse<Region>>('/regions', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch regions:', error);
      throw error;
    }
  }

  async getRegionById(id: string): Promise<ApiResponse<Region>> {
    try {
      return await apiClient.get<ApiResponse<Region>>(`/regions/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch region ${id}:`, error);
      throw error;
    }
  }

  async createRegion(payload: CreateRegionPayload): Promise<ApiResponse<Region>> {
    try {
      return await apiClient.post<ApiResponse<Region>>('/regions', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create region:', error);
      throw error;
    }
  }

  async updateRegion(id: string, payload: Partial<CreateRegionPayload>): Promise<ApiResponse<Region>> {
    try {
      return await apiClient.put<ApiResponse<Region>>(`/regions/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update region ${id}:`, error);
      throw error;
    }
  }

  async deleteRegion(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/regions/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete region ${id}:`, error);
      throw error;
    }
  }

  // ---- Locations ----

  async getLocations(params?: PaginationParams): Promise<PaginatedResponse<Location>> {
    try {
      return await apiClient.get<PaginatedResponse<Location>>('/locations', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch locations:', error);
      throw error;
    }
  }

  async getLocationById(id: string): Promise<ApiResponse<Location>> {
    try {
      return await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch location ${id}:`, error);
      throw error;
    }
  }

  async createLocation(payload: CreateLocationPayload): Promise<ApiResponse<Location>> {
    try {
      return await apiClient.post<ApiResponse<Location>>('/locations', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create location:', error);
      throw error;
    }
  }

  async updateLocation(id: string, payload: Partial<CreateLocationPayload>): Promise<ApiResponse<Location>> {
    try {
      return await apiClient.put<ApiResponse<Location>>(`/locations/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update location ${id}:`, error);
      throw error;
    }
  }

  async deleteLocation(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/locations/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete location ${id}:`, error);
      throw error;
    }
  }

  // ---- Rooms ----

  async getRooms(params?: PaginationParams): Promise<PaginatedResponse<Room>> {
    try {
      return await apiClient.get<PaginatedResponse<Room>>('/rooms', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch rooms:', error);
      throw error;
    }
  }

  async getRoomById(id: string): Promise<ApiResponse<Room>> {
    try {
      return await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch room ${id}:`, error);
      throw error;
    }
  }

  async createRoom(payload: CreateRoomPayload): Promise<ApiResponse<Room>> {
    try {
      return await apiClient.post<ApiResponse<Room>>('/rooms', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create room:', error);
      throw error;
    }
  }

  async updateRoom(id: string, payload: Partial<CreateRoomPayload>): Promise<ApiResponse<Room>> {
    try {
      return await apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update room ${id}:`, error);
      throw error;
    }
  }

  async deleteRoom(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/rooms/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete room ${id}:`, error);
      throw error;
    }
  }

  // ---- Terms ----

  async getTerms(params?: PaginationParams): Promise<PaginatedResponse<Term>> {
    try {
      return await apiClient.get<PaginatedResponse<Term>>('/terms', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch terms:', error);
      throw error;
    }
  }

  async getTermById(id: string): Promise<ApiResponse<Term>> {
    try {
      return await apiClient.get<ApiResponse<Term>>(`/terms/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch term ${id}:`, error);
      throw error;
    }
  }

  async createTerm(payload: CreateTermPayload): Promise<ApiResponse<Term>> {
    try {
      return await apiClient.post<ApiResponse<Term>>('/terms', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create term:', error);
      throw error;
    }
  }

  async updateTerm(id: string, payload: Partial<CreateTermPayload>): Promise<ApiResponse<Term>> {
    try {
      return await apiClient.put<ApiResponse<Term>>(`/terms/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update term ${id}:`, error);
      throw error;
    }
  }

  async deleteTerm(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/terms/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete term ${id}:`, error);
      throw error;
    }
  }

  // ---- Holiday Calendars ----

  async getHolidayCalendars(params?: PaginationParams): Promise<PaginatedResponse<HolidayCalendar>> {
    try {
      return await apiClient.get<PaginatedResponse<HolidayCalendar>>('/holiday-calendars', { params });
    } catch (error) {
      console.error('[BCMSService] Failed to fetch holiday calendars:', error);
      throw error;
    }
  }

  async getHolidayCalendarById(id: string): Promise<ApiResponse<HolidayCalendar>> {
    try {
      return await apiClient.get<ApiResponse<HolidayCalendar>>(`/holiday-calendars/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to fetch holiday calendar ${id}:`, error);
      throw error;
    }
  }

  async createHolidayCalendar(payload: CreateHolidayCalendarPayload): Promise<ApiResponse<HolidayCalendar>> {
    try {
      return await apiClient.post<ApiResponse<HolidayCalendar>>('/holiday-calendars', payload);
    } catch (error) {
      console.error('[BCMSService] Failed to create holiday calendar:', error);
      throw error;
    }
  }

  async updateHolidayCalendar(id: string, payload: Partial<CreateHolidayCalendarPayload>): Promise<ApiResponse<HolidayCalendar>> {
    try {
      return await apiClient.put<ApiResponse<HolidayCalendar>>(`/holiday-calendars/${id}`, payload);
    } catch (error) {
      console.error(`[BCMSService] Failed to update holiday calendar ${id}:`, error);
      throw error;
    }
  }

  async deleteHolidayCalendar(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/holiday-calendars/${id}`);
    } catch (error) {
      console.error(`[BCMSService] Failed to delete holiday calendar ${id}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// PROGRAM SERVICE
// ============================================================================

class ProgramService {
  private basePath = '/programs';

  async getPrograms(params?: GetProgramsParams): Promise<PaginatedResponse<Program>> {
    try {
      return await apiClient.get<PaginatedResponse<Program>>(this.basePath, { params });
    } catch (error) {
      console.error('[ProgramService] Failed to fetch programs:', error);
      throw error;
    }
  }

  async getProgramById(id: string): Promise<ApiResponse<Program>> {
    try {
      return await apiClient.get<ApiResponse<Program>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[ProgramService] Failed to fetch program ${id}:`, error);
      throw error;
    }
  }

  async createProgram(payload: CreateProgramPayload): Promise<ApiResponse<Program>> {
    try {
      return await apiClient.post<ApiResponse<Program>>(this.basePath, payload);
    } catch (error) {
      console.error('[ProgramService] Failed to create program:', error);
      throw error;
    }
  }

  async updateProgram(id: string, payload: UpdateProgramPayload): Promise<ApiResponse<Program>> {
    try {
      return await apiClient.put<ApiResponse<Program>>(`${this.basePath}/${id}`, payload);
    } catch (error) {
      console.error(`[ProgramService] Failed to update program ${id}:`, error);
      throw error;
    }
  }

  async deleteProgram(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[ProgramService] Failed to delete program ${id}:`, error);
      throw error;
    }
  }

  async updateProgramStatus(id: string, status: ProgramStatus): Promise<ApiResponse<Program>> {
    try {
      return await apiClient.patch<ApiResponse<Program>>(`${this.basePath}/${id}/status`, { status });
    } catch (error) {
      console.error(`[ProgramService] Failed to update program status ${id}:`, error);
      throw error;
    }
  }

  async duplicateProgram(id: string): Promise<ApiResponse<Program>> {
    try {
      return await apiClient.post<ApiResponse<Program>>(`${this.basePath}/${id}/duplicate`);
    } catch (error) {
      console.error(`[ProgramService] Failed to duplicate program ${id}:`, error);
      throw error;
    }
  }

  async getStatistics(): Promise<ApiResponse<ProgramStatistics>> {
    try {
      return await apiClient.get<ApiResponse<ProgramStatistics>>(`${this.basePath}/statistics`);
    } catch (error) {
      console.error('[ProgramService] Failed to fetch program statistics:', error);
      throw error;
    }
  }

  async getCategories(): Promise<ApiResponse<ProgramCategory[]>> {
    try {
      return await apiClient.get<ApiResponse<ProgramCategory[]>>(`${this.basePath}/categories`);
    } catch (error) {
      console.error('[ProgramService] Failed to fetch program categories:', error);
      throw error;
    }
  }
}

// ============================================================================
// SCHEDULING SERVICE
// ============================================================================

class SchedulingService {
  private basePath = '/scheduling';

  async generateSchedule(payload: GenerateSchedulePayload): Promise<ApiResponse<Schedule>> {
    try {
      return await apiClient.post<ApiResponse<Schedule>>(`${this.basePath}/generate`, payload);
    } catch (error) {
      console.error('[SchedulingService] Failed to generate schedule:', error);
      throw error;
    }
  }

  async getSchedules(params?: PaginationParams & { programId?: string; locationId?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Schedule>> {
    try {
      return await apiClient.get<PaginatedResponse<Schedule>>(this.basePath, { params });
    } catch (error) {
      console.error('[SchedulingService] Failed to fetch schedules:', error);
      throw error;
    }
  }

  async getScheduleById(id: string): Promise<ApiResponse<Schedule>> {
    try {
      return await apiClient.get<ApiResponse<Schedule>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[SchedulingService] Failed to fetch schedule ${id}:`, error);
      throw error;
    }
  }

  async updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<ApiResponse<Schedule>> {
    try {
      return await apiClient.put<ApiResponse<Schedule>>(`${this.basePath}/${id}`, payload);
    } catch (error) {
      console.error(`[SchedulingService] Failed to update schedule ${id}:`, error);
      throw error;
    }
  }

  async publishSchedule(id: string): Promise<ApiResponse<Schedule>> {
    try {
      return await apiClient.post<ApiResponse<Schedule>>(`${this.basePath}/${id}/publish`);
    } catch (error) {
      console.error(`[SchedulingService] Failed to publish schedule ${id}:`, error);
      throw error;
    }
  }

  async detectConflicts(id: string): Promise<ApiResponse<ScheduleConflict[]>> {
    try {
      return await apiClient.post<ApiResponse<ScheduleConflict[]>>(`${this.basePath}/${id}/detect-conflicts`);
    } catch (error) {
      console.error(`[SchedulingService] Failed to detect conflicts for schedule ${id}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// BOOKING SERVICE
// ============================================================================

class BookingService {
  private basePath = '/bookings';

  async getBookings(params?: GetBookingsParams): Promise<PaginatedResponse<Booking>> {
    try {
      return await apiClient.get<PaginatedResponse<Booking>>(this.basePath, { params });
    } catch (error) {
      console.error('[BookingService] Failed to fetch bookings:', error);
      throw error;
    }
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.get<ApiResponse<Booking>>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`[BookingService] Failed to fetch booking ${id}:`, error);
      throw error;
    }
  }

  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.post<ApiResponse<Booking>>(this.basePath, payload);
    } catch (error) {
      console.error('[BookingService] Failed to create booking:', error);
      throw error;
    }
  }

  async cancelBooking(id: string): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.patch<ApiResponse<Booking>>(`${this.basePath}/${id}/cancel`);
    } catch (error) {
      console.error(`[BookingService] Failed to cancel booking ${id}:`, error);
      throw error;
    }
  }

  async getStatistics(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<BookingStatistics>> {
    try {
      return await apiClient.get<ApiResponse<BookingStatistics>>(`${this.basePath}/statistics`, { params });
    } catch (error) {
      console.error('[BookingService] Failed to fetch booking statistics:', error);
      throw error;
    }
  }
}

// ============================================================================
// STAFF SERVICE
// ============================================================================

class StaffService {
  private basePath = '/staff';

  async getStaff(params?: GetStaffParams): Promise<PaginatedResponse<Staff>> {
    try {
      return await apiClient.get<PaginatedResponse<Staff>>(this.basePath, { params });
    } catch (error) {
      console.error('[StaffService] Failed to fetch staff:', error);
      throw error;
    }
  }

  async getStaffById(staffId: string): Promise<ApiResponse<Staff>> {
    try {
      return await apiClient.get<ApiResponse<Staff>>(`${this.basePath}/${staffId}`);
    } catch (error) {
      console.error(`[StaffService] Failed to fetch staff member ${staffId}:`, error);
      throw error;
    }
  }

  async createStaff(payload: CreateStaffPayload): Promise<ApiResponse<Staff>> {
    try {
      return await apiClient.post<ApiResponse<Staff>>(this.basePath, payload);
    } catch (error) {
      console.error('[StaffService] Failed to create staff member:', error);
      throw error;
    }
  }

  async updateStaff(staffId: string, payload: UpdateStaffPayload): Promise<ApiResponse<Staff>> {
    try {
      return await apiClient.put<ApiResponse<Staff>>(`${this.basePath}/${staffId}`, payload);
    } catch (error) {
      console.error(`[StaffService] Failed to update staff member ${staffId}:`, error);
      throw error;
    }
  }

  async getStatisticsOverview(): Promise<ApiResponse<StaffStatisticsOverview>> {
    try {
      return await apiClient.get<ApiResponse<StaffStatisticsOverview>>(`${this.basePath}/statistics/overview`);
    } catch (error) {
      console.error('[StaffService] Failed to fetch staff statistics:', error);
      throw error;
    }
  }
}

// ============================================================================
// ATTENDANCE SERVICE
// ============================================================================

class AttendanceService {
  private basePath = '/attendance';

  async checkIn(payload: CheckInPayload): Promise<ApiResponse<AttendanceRecord>> {
    try {
      return await apiClient.post<ApiResponse<AttendanceRecord>>(`${this.basePath}/check-in`, payload);
    } catch (error) {
      console.error('[AttendanceService] Failed to check in:', error);
      throw error;
    }
  }

  async getRecords(params?: GetAttendanceParams): Promise<PaginatedResponse<AttendanceRecord>> {
    try {
      return await apiClient.get<PaginatedResponse<AttendanceRecord>>(`${this.basePath}/records`, { params });
    } catch (error) {
      console.error('[AttendanceService] Failed to fetch attendance records:', error);
      throw error;
    }
  }

  async getStatistics(params?: { startDate?: string; endDate?: string; locationId?: string }): Promise<ApiResponse<AttendanceStatistics>> {
    try {
      return await apiClient.get<ApiResponse<AttendanceStatistics>>(`${this.basePath}/statistics`, { params });
    } catch (error) {
      console.error('[AttendanceService] Failed to fetch attendance statistics:', error);
      throw error;
    }
  }
}

// ============================================================================
// FEATURE FLAG SERVICE
// ============================================================================

class FeatureFlagService {
  private basePath = '/feature-flags/flags';

  async getFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    try {
      return await apiClient.get<ApiResponse<FeatureFlag[]>>(this.basePath);
    } catch (error) {
      console.error('[FeatureFlagService] Failed to fetch feature flags:', error);
      throw error;
    }
  }

  async createFlag(payload: CreateFeatureFlagPayload): Promise<ApiResponse<FeatureFlag>> {
    try {
      return await apiClient.post<ApiResponse<FeatureFlag>>(this.basePath, payload);
    } catch (error) {
      console.error('[FeatureFlagService] Failed to create feature flag:', error);
      throw error;
    }
  }

  async updateFlag(flagKey: string, payload: UpdateFeatureFlagPayload): Promise<ApiResponse<FeatureFlag>> {
    try {
      return await apiClient.put<ApiResponse<FeatureFlag>>(`${this.basePath}/${flagKey}`, payload);
    } catch (error) {
      console.error(`[FeatureFlagService] Failed to update feature flag ${flagKey}:`, error);
      throw error;
    }
  }

  async deleteFlag(flagKey: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`${this.basePath}/${flagKey}`);
    } catch (error) {
      console.error(`[FeatureFlagService] Failed to delete feature flag ${flagKey}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON EXPORTS
// ============================================================================

export const userService = new UserService();
export const bcmsService = new BCMSService();
export const programService = new ProgramService();
export const schedulingService = new SchedulingService();
export const bookingService = new BookingService();
export const staffService = new StaffService();
export const attendanceService = new AttendanceService();
export const featureFlagService = new FeatureFlagService();

// Named class exports for testing or custom instantiation
export {
  UserService,
  BCMSService,
  ProgramService,
  SchedulingService,
  BookingService,
  StaffService,
  AttendanceService,
  FeatureFlagService,
};
