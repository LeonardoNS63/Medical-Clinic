window.addEventListener("load", () => {
    const token = TokenManager.obterToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    document.body.classList.add("loaded");
    configurarLogoutAutomatico();
    exibirPerfil();
});


async function carregarDados() {
    const resposta = await fazerRequisicaoAutenticada(
        "http://localhost:8080/doctors/1"
    );

    if (!resposta) return;

    const dados = await resposta.json();
    document.getElementById("nome").textContent = dados.nome;
}

async function exibirPerfil() {
    const token = TokenManager.obterToken();
    const payload = TokenManager.decodificarToken(token);

    document.getElementById("email").textContent = payload.sub;
    document.getElementById("tipo-usuario").textContent = traduzirRole(payload.role);
    document.getElementById("saudacao").textContent = "Carregando...";

    const resposta = await fazerRequisicaoAutenticada("http://localhost:8080/auth/me");
    if (!resposta) return;

    const dados = await resposta.json();

    document.getElementById("saudacao").textContent = "Olá, " + (dados.nome ?? dados.name);
    document.getElementById("nome").textContent = dados.nome ?? dados.name ?? "Não informado";
    document.getElementById("tel").textContent = dados.telefone ?? dados.phone ?? "Não informado";
}

function traduzirRole(role) {
    const roles = {
        "ROLE_MEDICO":   "Médico",
        "ROLE_PACIENTE": "Paciente",
        "ROLE_ADMIN":    "Administrador"
    };
    return roles[role] ?? role;
}