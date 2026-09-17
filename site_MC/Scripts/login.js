window.addEventListener("load", () => {
    document.getElementById("app").classList.add("show");

     if (TokenManager.tokenExpirou()) {
        TokenManager.limparToken();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
});


async function login() {
    const emailEl  = document.getElementById("email");
    const senhaEl  = document.getElementById("senha");
    const erroEl   = document.getElementById("mensagem-erro");
    const btnLogin = document.getElementById("btn-login");

    const email = emailEl.value.trim();
    const senha = senhaEl.value;

    esconderErro(erroEl);

    if (email === "") {
        mostrarErro(erroEl, "Por favor, digite seu email.");
        emailEl.focus();
        return;
    }
    if (!validarFormatoEmail(email)) {
        mostrarErro(erroEl, "Digite um email válido.");
        emailEl.focus();
        return;
    }
    if (senha === "") {
        mostrarErro(erroEl, "Por favor, digite sua senha.");
        senhaEl.focus();
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    try {
        const resposta = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (resposta.status === 401) {
            mostrarErro(erroEl, "Email ou senha incorretos.");
            senhaEl.value = ""; 
            senhaEl.focus();
            return;
        }

        if (!resposta.ok) {
            mostrarErro(erroEl, `Erro inesperado (status ${resposta.status}). Tente novamente.`);
            return;
        }

        const dados = await resposta.json();

        TokenManager.limparToken();
        TokenManager.salvarToken(dados.token);
        
        window.location.href = "perfil.html";

    } catch (erro) {
        mostrarErro(erroEl, "Não foi possível conectar ao servidor.");
        console.error("Erro no login:", erro);
    } finally {

        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
    }
}

function mostrarErro(elemento, mensagem) {
    elemento.textContent = mensagem;
    elemento.style.display = "block";
}

function esconderErro(elemento) {
    elemento.textContent = "";
    elemento.style.display = "none";
}

function validarFormatoEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}