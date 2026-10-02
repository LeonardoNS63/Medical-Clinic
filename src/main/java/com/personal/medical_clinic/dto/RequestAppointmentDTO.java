package com.personal.medical_clinic.dto;

import com.personal.medical_clinic.entities.enums.AppointmentTipe;
import jakarta.validation.constraints.NotNull;

public record RequestAppointmentDTO(
    @NotNull(message = "O tipo de consulta é obrigatório")
    AppointmentTipe tipo,
    String descricao
) {}
