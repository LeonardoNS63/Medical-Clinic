package com.personal.medical_clinic.repository;

import com.personal.medical_clinic.entities.Medic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MedicRepository extends JpaRepository<Medic, Long> {

    Optional<Medic> findByUsuarioId(Long usuarioId);

}
