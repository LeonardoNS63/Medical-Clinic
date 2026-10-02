package com.personal.medical_clinic.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.personal.medical_clinic.entities.enums.AppointmentsStatus;
import com.personal.medical_clinic.entities.enums.AppointmentTipe;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "tb_medical_appointments")
public class Appointments implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Instant moment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentTipe tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentsStatus status = AppointmentsStatus.PENDENTE;

    private String descricao;

    private LocalDate dataAgendada;
    private LocalTime horaAgendada;
    private String local;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "medic_id", nullable = true)
    private Medic medic;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "patient_id", nullable = true)
    private Patient patient;

    private String doctorName;
    private String patientName;

    public Appointments() {}

    public Appointments(Long id, Instant moment, AppointmentTipe tipo, String descricao, Patient patient) {
        this.id = id;
        this.moment = moment;
        this.tipo = tipo;
        this.descricao = descricao;
        this.status = AppointmentsStatus.PENDENTE;
        this.patient = patient;
        this.patientName = patient != null ? patient.getUsuario().getNome() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instant getMoment() { return moment; }
    public void setMoment(Instant moment) { this.moment = moment; }

    public AppointmentTipe getTipo() { return tipo; }
    public void setTipo(AppointmentTipe tipo) { this.tipo = tipo; }

    public AppointmentsStatus getStatus() { return status; }
    public void setStatus(AppointmentsStatus status) { this.status = status; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getDataAgendada() { return dataAgendada; }
    public void setDataAgendada(LocalDate dataAgendada) { this.dataAgendada = dataAgendada; }

    public LocalTime getHoraAgendada() { return horaAgendada; }
    public void setHoraAgendada(LocalTime horaAgendada) { this.horaAgendada = horaAgendada; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) {
        this.patient = patient;
        this.patientName = patient != null ? patient.getUsuario().getNome() : null;
    }

    public Medic getMedic() { return medic; }
    public void setMedic(Medic medic) {
        this.medic = medic;
        this.doctorName = medic != null ? medic.getUsuario().getNome() : null;
    }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Appointments that = (Appointments) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
