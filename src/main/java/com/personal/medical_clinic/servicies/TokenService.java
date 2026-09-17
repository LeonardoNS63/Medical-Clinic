package com.personal.medical_clinic.servicies;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.personal.medical_clinic.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    @Value("${jwt.secret}")
    private String secret;

    public String gerarToken(User usuario) {
        return JWT.create()
                .withIssuer("medical-clinic")
                .withSubject(usuario.getEmail())
                .withClaim("role", usuario.getRole().getValor())
                .withExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .sign(Algorithm.HMAC256(secret));
    }

    public String validarToken(String token) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);

            return JWT.require(algoritmo)
                    .withIssuer("medical-clinic")
                    .build()
                    .verify(token)
                    .getSubject();

        } catch (JWTVerificationException e) {
            return null;
        }
    }
}
