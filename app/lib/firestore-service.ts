import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-config';

// Types
export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  image?: string;
  availability: string[];
  bio: string;
  createdAt?: any;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: any;
}

// Admin Operations
export const adminService = {
  async getById(id: string): Promise<Admin | null> {
    const docRef = doc(db, 'admins', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Admin;
    }
    return null;
  },

  async getByEmail(email: string): Promise<Admin | null> {
    const q = query(collection(db, 'admins'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Admin;
    }
    return null;
  },

  async getAll(): Promise<Admin[]> {
    const querySnapshot = await getDocs(collection(db, 'admins'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Admin));
  },

  async create(data: Omit<Admin, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'admins'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Admin>): Promise<void> {
    const docRef = doc(db, 'admins', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'admins', id));
  }
};

// Doctor Operations
export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  },

  async getById(id: string): Promise<Doctor | null> {
    const docRef = doc(db, 'doctors', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Doctor;
    }
    return null;
  },

  async create(data: Omit<Doctor, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'doctors'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Doctor>): Promise<void> {
    const docRef = doc(db, 'doctors', id);
    await updateDoc(docRef, data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'doctors', id));
  }
};

// Appointment Operations
export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  },

  async getById(id: string): Promise<Appointment | null> {
    const docRef = doc(db, 'appointments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
  },

  async getByStatus(status: string): Promise<Appointment[]> {
    const q = query(
      collection(db, 'appointments'),
      where('status', '==', status),
      orderBy('appointmentDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  },

  async create(data: Omit<Appointment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Appointment>): Promise<void> {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'appointments', id));
  },

  async updateStatus(id: string, status: Appointment['status']): Promise<void> {
    await this.update(id, { status });
  }
};

// Patient Operations
export const patientService = {
  async getAll(): Promise<Patient[]> {
    const querySnapshot = await getDocs(collection(db, 'patients'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
  },

  async getById(id: string): Promise<Patient | null> {
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Patient;
    }
    return null;
  },

  async getByEmail(email: string): Promise<Patient | null> {
    const q = query(collection(db, 'patients'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Patient;
    }
    return null;
  },

  async create(data: Omit<Patient, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Patient>): Promise<void> {
    const docRef = doc(db, 'patients', id);
    await updateDoc(docRef, data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'patients', id));
  }
};

// Stats Operations
export const statsService = {
  async getDashboardStats() {
    const [appointments, patients, doctors] = await Promise.all([
      appointmentService.getAll(),
      patientService.getAll(),
      doctorService.getAll()
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointmentDate === today);

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
      confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length
    };
  }
};
