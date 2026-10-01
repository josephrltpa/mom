// Notification Service for Medication Reminders

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  schedule: 'morning' | 'afternoon' | 'night';
  reminderTime: string; // HH:MM format
  enabled: boolean;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Send a notification
export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'medication-reminder',
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close after 30 seconds
  setTimeout(() => notification.close(), 30000);
}

// Schedule medication reminders
export class MedicationReminderService {
  private reminders: Map<string, NodeJS.Timeout> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startChecking();
  }

  private startChecking() {
    // Check every minute if it's time for a reminder
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // Check every minute

    // Also check immediately
    setTimeout(() => this.checkReminders(), 1000);
  }

  private checkReminders() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    // Get reminders from localStorage
    const savedReminders = localStorage.getItem('medication_reminders');
    if (!savedReminders) return;

    const reminders: Reminder[] = JSON.parse(savedReminders);

    reminders.forEach(reminder => {
      if (!reminder.enabled) return;

      // Check if it's time for this reminder
      if (reminder.reminderTime === currentTime) {
        // Check if we already sent this reminder today
        const lastSentKey = `reminder_sent_${reminder.id}_${today}`;
        const alreadySent = localStorage.getItem(lastSentKey);

        if (!alreadySent) {
          // Send notification
          sendNotification(
            '💊 Time to take medicine',
            `${reminder.medicineName} ${reminder.dosage}`,
          );

          // Mark as sent for today
          localStorage.setItem(lastSentKey, 'true');
        }
      }
    });
  }

  // Add or update a reminder
  addReminder(reminder: Reminder) {
    const savedReminders = localStorage.getItem('medication_reminders');
    const reminders: Reminder[] = savedReminders ? JSON.parse(savedReminders) : [];

    // Remove existing reminder for this medicine+schedule
    const filtered = reminders.filter(r => 
      !(r.medicineId === reminder.medicineId && r.schedule === reminder.schedule)
    );

    // Add new reminder
    filtered.push(reminder);

    localStorage.setItem('medication_reminders', JSON.stringify(filtered));
  }

  // Remove a reminder
  removeReminder(medicineId: string, schedule: string) {
    const savedReminders = localStorage.getItem('medication_reminders');
    if (!savedReminders) return;

    const reminders: Reminder[] = JSON.parse(savedReminders);
    const filtered = reminders.filter(r => 
      !(r.medicineId === medicineId && r.schedule === schedule)
    );

    localStorage.setItem('medication_reminders', JSON.stringify(filtered));
  }

  // Get all reminders
  getReminders(): Reminder[] {
    const savedReminders = localStorage.getItem('medication_reminders');
    return savedReminders ? JSON.parse(savedReminders) : [];
  }

  // Stop the service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.reminders.forEach(timeout => clearTimeout(timeout));
    this.reminders.clear();
  }
}

// Singleton instance
export const reminderService = new MedicationReminderService();

// Helper to get default reminder times
export function getDefaultReminderTime(schedule: 'morning' | 'afternoon' | 'night'): string {
  switch (schedule) {
    case 'morning': return '08:00';
    case 'afternoon': return '13:00';
    case 'night': return '20:00';
  }
}
