package com.personal.medical_clinic.repository;

import com.personal.medical_clinic.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUsuarioId(Long usuarioId);

}

