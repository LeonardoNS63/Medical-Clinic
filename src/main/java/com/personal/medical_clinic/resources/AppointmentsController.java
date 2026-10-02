package com.personal.medical_clinic.resources;

import com.personal.medical_clinic.dto.AppointmentResponseDTO;
import com.personal.medical_clinic.dto.ApproveAppointmentDTO;
import com.personal.medical_clinic.dto.RequestAppointmentDTO;
import com.personal.medical_clinic.servicies.AppointmentsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    @Autowired
    private AppointmentsService appointmentsService;

    // ── Paciente ────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> solicitar(
            @RequestBody @Valid RequestAppointmentDTO dto) {
        return ResponseEntity.status(201).body(appointmentsService.solicitar(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AppointmentResponseDTO>> minhasConsultas() {
        return ResponseEntity.ok(appointmentsService.minhasConsultas());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        appointmentsService.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Médico ──────────────────────────────────────────────────

    @GetMapping("/pendentes")
    public ResponseEntity<List<AppointmentResponseDTO>> pendentes() {
        return ResponseEntity.ok(appointmentsService.consultasPendentes());
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<AppointmentResponseDTO> aprovar(
            @PathVariable Long id,
            @RequestBody @Valid ApproveAppointmentDTO dto) {
        return ResponseEntity.ok(appointmentsService.aprovar(id, dto));
    }

    @GetMapping("/agendadas")
    public ResponseEntity<List<AppointmentResponseDTO>> agendadas() {
        return ResponseEntity.ok(appointmentsService.consultasAgendadas());
    }
}