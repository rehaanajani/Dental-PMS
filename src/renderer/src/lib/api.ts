import type {
  Patient, Visit, VisitWithMedicines, Appointment, ClinicSettings, MedicineItem,
  VisitListItem, PrescriptionListItem
} from './types'

declare global {
  interface Window {
    api: {
      patients: {
        create: (data: Partial<Patient>) => Promise<Patient>
        update: (id: string, data: Partial<Patient>) => Promise<Patient>
        getById: (id: string) => Promise<Patient | null>
        search: (query: string) => Promise<Patient[]>
        listRecent: () => Promise<Patient[]>
        count: () => Promise<number>
        delete: (id: string) => Promise<void>
      }
      visits: {
        create: (data: unknown) => Promise<Visit>
        update: (id: string, data: unknown) => Promise<Visit>
        getById: (id: string) => Promise<Visit | null>
        getWithMedicines: (id: string) => Promise<VisitWithMedicines | null>
        listByPatient: (patientId: string) => Promise<Visit[]>
        listRecent: () => Promise<(Visit & { full_name: string })[]>
        getMedicines: (visitId: string) => Promise<MedicineItem[]>
        listAll: () => Promise<VisitListItem[]>
        listPrescriptions: () => Promise<PrescriptionListItem[]>
        getDashboardStats: () => Promise<{ totalPrescriptions: number; pendingBalance: number }>
        delete: (id: string) => Promise<void>
      }
      appointments: {
        create: (data: unknown) => Promise<Appointment>
        update: (id: string, data: unknown) => Promise<Appointment>
        getById: (id: string) => Promise<Appointment | null>
        listByDate: (date: string) => Promise<Appointment[]>
        listUpcoming: () => Promise<Appointment[]>
        listAll: () => Promise<Appointment[]>
        markCompleted: (id: string) => Promise<Appointment>
        cancel: (id: string) => Promise<Appointment>
        delete: (id: string) => Promise<void>
      }
      settings: {
        get: () => Promise<ClinicSettings | null>
        update: (data: Partial<ClinicSettings>) => Promise<ClinicSettings>
      }
      print: {
        generateAndOpen: () => Promise<{ success: boolean; path: string }>
      }
      backup: {
        create: () => Promise<{ success: boolean; path?: string; error?: string }>
        getLast: () => Promise<{ id: string; backup_path: string; backup_date: string; status: string } | null>
      }
    }
  }
}

export const api = window.api
