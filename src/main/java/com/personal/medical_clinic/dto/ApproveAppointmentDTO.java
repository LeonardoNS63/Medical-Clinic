package com.personal.medical_clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record ApproveAppointmentDTO(
        @NotNull(message = "A data é obrigatória")
        LocalDate dataAgendada,

        @NotNull(message = "O horário é obrigatório")
        LocalTime horaAgendada,

        @NotBlank(message = "O local é obrigatório")
        String local
) {}
