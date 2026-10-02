package com.personal.medical_clinic.repository;

import com.personal.medical_clinic.entities.Appointments;
import com.personal.medical_clinic.entities.enums.AppointmentsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentsRepository extends JpaRepository<Appointments, Long> {

    // Todas as consultas de um paciente específico
    List<Appointments> findByPatientId(Long patientId);

    // Todas as consultas PENDENTES (lista pra médicos escolherem)
    List<Appointments> findByStatus(AppointmentsStatus status);

    // Consultas agendadas por um médico específico
    List<Appointments> findByMedicIdAndStatus(Long medicId, AppointmentsStatus status);
}