import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types/Doctor';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Plus, Edit2, Trash2, Phone, MapPin, Building2 } from 'lucide-react';

export default function DoctorsPage() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const openAddDoctor = () => {
    setEditingDoctor(null);
    setName(''); setSpecialty(''); setClinic(''); setLocation(''); setContact(''); setNotes('');
    setShowModal(true);
  };

  const openEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setName(doctor.name); setSpecialty(doctor.specialty); setClinic(doctor.clinic);
    setLocation(doctor.location || ''); setContact(doctor.contact_number || ''); setNotes(doctor.notes || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name || !specialty) return;

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, { name, specialty, clinic, location, contact_number: contact, notes });
    } else {
      addDoctor({ name, specialty, clinic, location, contact_number: contact, notes, is_active: true });
    }
    setShowModal(false);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <button
          onClick={openAddDoctor}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">👨‍⚕️</div>
          <p className="text-base text-gray-500 mb-4">No doctors added yet</p>
          <button
            onClick={openAddDoctor}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            + Add First Doctor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-base text-indigo-600 font-medium">{doctor.specialty}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditDoctor(doctor)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(doctor.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {doctor.clinic && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>{doctor.clinic}</span>
                </div>
              )}

              {doctor.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              )}

              {doctor.contact_number && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${doctor.contact_number}`} className="text-indigo-600 font-medium">
                    {doctor.contact_number}
                  </a>
                </div>
              )}

              {doctor.notes && (
                <p className="text-sm text-gray-500 mt-2 italic">📝 {doctor.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Doctor Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="Dr. John Smith"
            />
          </div>

          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Specialty *</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Cardiologist, Diabetologist"
            />
          </div>

          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Clinic/Hospital</label>
            <input
              type="text"
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="City Hospital"
            />
          </div>

          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Contact Number</label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-base border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl"
            >
              {editingDoctor ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) deleteDoctor(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Delete Doctor?"
        message="This will remove the doctor from your list. Medicines linked to this doctor will not be deleted."
      />
    </div>
  );
}
