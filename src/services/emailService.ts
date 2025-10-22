import emailjs from '@emailjs/browser';
import { Complaint } from '@/types/complaint';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@college.edu';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailTemplate {
  to_email: string;
  to_name?: string;
  complaint_title: string;
  student_name: string;
  department: string;
  complaint_description: string;
  complaint_id: string;
  created_date: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Send email notification to admin when a new complaint is registered
 */
export const sendAdminNotification = async (complaint: Complaint): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Skipping admin notification.');
      return false;
    }

    const templateParams: EmailTemplate = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      complaint_title: complaint.title,
      student_name: complaint.name,
      department: complaint.department,
      complaint_description: complaint.description,
      complaint_id: complaint.id,
      created_date: new Date(complaint.createdAt).toLocaleDateString('en-IN'),
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'admin_alert', // Template ID for admin notifications
      templateParams
    );

    console.log('Admin notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
};

/**
 * Send email notification to user when their complaint is resolved
 */
export const sendUserNotification = async (complaint: Complaint, userEmail: string): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Skipping user notification.');
      return false;
    }

    const templateParams: EmailTemplate = {
      to_email: userEmail,
      to_name: complaint.name,
      complaint_title: complaint.title,
      student_name: complaint.name,
      department: complaint.department,
      complaint_description: complaint.description,
      complaint_id: complaint.id,
      created_date: new Date(complaint.createdAt).toLocaleDateString('en-IN'),
      status: complaint.status,
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'user_alert', // Template ID for user notifications
      templateParams
    );

    console.log('User notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send user notification:', error);
    return false;
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing');
      return false;
    }

    const testParams = {
      to_email: ADMIN_EMAIL,
      to_name: 'Test Admin',
      complaint_title: 'Test Complaint',
      student_name: 'Test Student',
      department: 'Test Department',
      complaint_description: 'This is a test email to verify EmailJS configuration.',
      complaint_id: 'test-123',
      created_date: new Date().toLocaleDateString('en-IN'),
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'admin_alert',
      testParams
    );

    console.log('Test email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Test email failed:', error);
    return false;
  }
};
