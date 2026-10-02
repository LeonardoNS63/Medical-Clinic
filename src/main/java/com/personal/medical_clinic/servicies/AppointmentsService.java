package com.personal.medical_clinic.servicies;

import com.personal.medical_clinic.dto.AppointmentResponseDTO;
import com.personal.medical_clinic.dto.ApproveAppointmentDTO;
import com.personal.medical_clinic.dto.RequestAppointmentDTO;
import com.personal.medical_clinic.entities.Appointments;
import com.personal.medical_clinic.entities.Medic;
import com.personal.medical_clinic.entities.Patient;
import com.personal.medical_clinic.entities.User;
import com.personal.medical_clinic.entities.enums.AppointmentsStatus;
import com.personal.medical_clinic.repository.AppointmentsRepository;
import com.personal.medical_clinic.repository.MedicRepository;
import com.personal.medical_clinic.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AppointmentsService {

    @Autowired private AppointmentsRepository appointmentsRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private MedicRepository medicRepository;

    // ── Métodos auxiliares ──────────────────────────────────────

    private User usuarioLogado() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private Patient pacienteLogado() {
        User user = usuarioLogado();
        return patientRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
    }

    private Medic medicoLogado() {
        User user = usuarioLogado();
        return medicRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
    }

    // ── Endpoints do Paciente ───────────────────────────────────

    public AppointmentResponseDTO solicitar(RequestAppointmentDTO dto) {
        Patient patient = pacienteLogado();

        Appointments consulta = new Appointments(
                null,
                Instant.now(),
                dto.tipo(),
                dto.descricao(),
                patient
        );

        return AppointmentResponseDTO.from(appointmentsRepository.save(consulta));
    }

    public List<AppointmentResponseDTO> minhasConsultas() {
        Patient patient = pacienteLogado();
        return appointmentsRepository.findByPatientId(patient.getId())
                .stream()
                .map(AppointmentResponseDTO::from)
                .toList();
    }

    public void cancelar(Long id) {
        Patient patient = pacienteLogado();

        Appointments consulta = appointmentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        if (!consulta.getPatient().getId().equals(patient.getId())) {
            throw new RuntimeException("Você não tem permissão para cancelar esta consulta");
        }

        if (consulta.getStatus() == AppointmentsStatus.APROVADA) {
            throw new RuntimeException("Não é possível cancelar uma consulta já aprovada");
        }

        consulta.setStatus(AppointmentsStatus.CANCELADA);
        appointmentsRepository.save(consulta);
    }

    // ── Endpoints do Médico ─────────────────────────────────────

    public List<AppointmentResponseDTO> consultasPendentes() {
        return appointmentsRepository.findByStatus(AppointmentsStatus.PENDENTE)
                .stream()
                .map(AppointmentResponseDTO::from)
                .toList();
    }

    public AppointmentResponseDTO aprovar(Long id, ApproveAppointmentDTO dto) {
        Medic medic = medicoLogado();

        Appointments consulta = appointmentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        if (consulta.getStatus() != AppointmentsStatus.PENDENTE) {
            throw new RuntimeException("Só é possível aprovar consultas PENDENTES");
        }

        consulta.setMedic(medic);
        consulta.setStatus(AppointmentsStatus.APROVADA);
        consulta.setDataAgendada(dto.dataAgendada());
        consulta.setHoraAgendada(dto.horaAgendada());
        consulta.setLocal(dto.local());

        return AppointmentResponseDTO.from(appointmentsRepository.save(consulta));
    }

    public List<AppointmentResponseDTO> consultasAgendadas() {
        Medic medic = medicoLogado();
        return appointmentsRepository.findByMedicIdAndStatus(medic.getId(), AppointmentsStatus.APROVADA)
                .stream()
                .map(AppointmentResponseDTO::from)
                .toList();
    }
}