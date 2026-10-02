package com.personal.medical_clinic.dto;

import com.personal.medical_clinic.entities.Appointments;
import com.personal.medical_clinic.entities.enums.AppointmentTipe;
import com.personal.medical_clinic.entities.enums.AppointmentsStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponseDTO(
        Long id,
        AppointmentTipe tipo,
        AppointmentsStatus status,
        String descricao,
        String patientName,
        String doctorName,
        LocalDate dataAgendada,
        LocalTime horaAgendada,
        String local
) {
    //Construtor que converte a entidade pro DTO automaticamente
    public static AppointmentResponseDTO from(Appointments a) {
        return new AppointmentResponseDTO(
                a.getId(),
                a.getTipo(),
                a.getStatus(),
                a.getDescricao(),
                a.getPatientName(),
                a.getDoctorName(),
                a.getDataAgendada(),
                a.getHoraAgendada(),
                a.getLocal()
        );
    }
}
