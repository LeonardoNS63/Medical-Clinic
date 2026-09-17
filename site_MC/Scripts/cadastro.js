window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

window.addEventListener("load", () => {
    document.getElementById("app").classList.add("show");
});

document.getElementById("telefone").addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, ""); 

    if (valor.length <= 10) {

        valor = valor
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    } else {

        valor = valor
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    }

    this.value = valor;
});

async function cadastrar() {

    const nome           = document.getElementById("nome").value.trim();
    const email          = document.getElementById("email").value.trim();
    const telefone       = document.getElementById("telefone").value.trim();
    const senha          = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;
    const role           = document.querySelector('input[name="role"]:checked')?.value;
    const btnCadastrar   = document.getElementById("btn-cadastrar");
    const feedbackEl     = document.getElementById("mensagem-feedback");

    limparTodosErros();
    esconderFeedback(feedbackEl);

    let temErro = false;

    if (nome === "") {
        mostrarErroCampo("erro-nome", "O nome é obrigatório.");
        temErro = true;
    } else if (nome.length < 3) {
        mostrarErroCampo("erro-nome", "Nome deve ter ao menos 3 caracteres.");
        temErro = true;
    }

    if (email === "") {
        mostrarErroCampo("erro-email", "O email é obrigatório.");
        temErro = true;
    } else if (!validarFormatoEmail(email)) {
        mostrarErroCampo("erro-email", "Digite um email válido.");
        temErro = true;
    }

    const telefoneSomenteNumeros = telefone.replace(/\D/g, "");
    if (telefone === "") {
        mostrarErroCampo("erro-telefone", "O telefone é obrigatório.");
        temErro = true;
    } else if (telefoneSomenteNumeros.length < 10 || telefoneSomenteNumeros.length > 11) {
        mostrarErroCampo("erro-telefone", "Telefone deve ter DDD + 8 ou 9 dígitos.");
        temErro = true;
    }

    if (senha === "") {
        mostrarErroCampo("erro-senha", "A senha é obrigatória.");
        temErro = true;
    } else if (senha.length < 6) {
        mostrarErroCampo("erro-senha", "A senha deve ter ao menos 6 caracteres.");
        temErro = true;
    }

    if (confirmarSenha === "") {
        mostrarErroCampo("erro-confirmar-senha", "Confirme sua senha.");
        temErro = true;
    } else if (senha !== confirmarSenha) {
        mostrarErroCampo("erro-confirmar-senha", "As senhas não coincidem.");
        temErro = true;
    }

    if (!role) {
        mostrarErroCampo("erro-role", "Selecione um tipo de perfil.");
        temErro = true;
    }

    if (temErro) return;

    btnCadastrar.disabled = true;
    btnCadastrar.textContent = "Cadastrando...";

    const body = {
        nome,
        email,
        telefone: telefoneSomenteNumeros,
        senha,
        role
    };

    try {
        const resposta = await fetch("http://localhost:8080/auth/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (resposta.status === 409) {
            mostrarErroCampo("erro-email", "Este email já está cadastrado.");
            return;
        }

        if (!resposta.ok) {
            mostrarFeedback(feedbackEl, `Erro inesperado (status ${resposta.status}). Tente novamente.`, "erro");
            return;
        }

        mostrarFeedback(feedbackEl, "Conta criada com sucesso! Redirecionando para o login...", "sucesso");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (erro) {
        mostrarFeedback(feedbackEl, "Não foi possível conectar ao servidor. Verifique sua conexão.", "erro");
        console.error("Erro no cadastro:", erro);
    } finally {
        btnCadastrar.disabled = false;
        btnCadastrar.textContent = "Criar conta";
    }
}

function mostrarErroCampo(idErro, mensagem) {
    const el = document.getElementById(idErro);
    if (el) el.textContent = mensagem;
}

function limparTodosErros() {
    document.querySelectorAll(".campo-erro").forEach(el => el.textContent = "");
}

function mostrarFeedback(elemento, mensagem, tipo) {
    elemento.textContent = mensagem;
    elemento.className = tipo; 
    elemento.style.display = "block";
}

function esconderFeedback(elemento) {
    elemento.textContent = "";
    elemento.style.display = "none";
}

function validarFormatoEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}