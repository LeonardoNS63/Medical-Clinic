package com.personal.medical_clinic.security;

import com.personal.medical_clinic.repository.UserRepository;
import com.personal.medical_clinic.servicies.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository usuarioRepository;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        var token = recuperarToken(request);
        System.out.println("=== SecurityFilter ===");
        System.out.println("URL: " + request.getRequestURI());
        System.out.println("Token recebido: " + (token != null ? "SIM" : "NÃO"));

        if (token != null) {
            var email = tokenService.validarToken(token);
            System.out.println("Email do token: " + email);

            if (email != null) {
                var usuario = usuarioRepository.findByEmail(email).orElse(null);
                System.out.println("Usuário encontrado: " + (usuario != null ? "SIM" : "NÃO"));

                if (usuario != null) {
                    System.out.println("Authorities: " + usuario.getAuthorities());

                    var authentication = new UsernamePasswordAuthenticationToken(
                            usuario, null, usuario.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Usuário autenticado no contexto ✅");
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var header = request.getHeader("Authorization");
        if (header == null) return null;
        return header.replace("Bearer ", "");
    }
}
