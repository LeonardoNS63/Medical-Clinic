package com.personal.medical_clinic.resources;

import com.personal.medical_clinic.dto.CadastroDTO;
import com.personal.medical_clinic.dto.LoginDTO;
import com.personal.medical_clinic.dto.PerfilDTO;
import com.personal.medical_clinic.dto.TokenDTO;
import com.personal.medical_clinic.entities.User;
import com.personal.medical_clinic.servicies.TokenService;
import com.personal.medical_clinic.servicies.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var usuario = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        var dto = new PerfilDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPhone(),
                usuario.getRole().name()
        );

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginDTO dados) {
        try {
            var credenciais = new UsernamePasswordAuthenticationToken(
                    dados.email(),
                    dados.senha()
            );

            var auth = authenticationManager.authenticate(credenciais);

            var token = tokenService.gerarToken((User) auth.getPrincipal());

            return ResponseEntity.ok(new TokenDTO(token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Email ou senha incorretos.");
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody @Valid CadastroDTO dados) {
        try {
            User novoUsuario = usuarioService.cadastrar(dados);
            return ResponseEntity.status(201).body("Usuário cadastrado com sucesso.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
