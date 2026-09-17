window.addEventListener("load", () => {
    const token = TokenManager.obterToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    configurarLogoutAutomatico(); 
    carregarDados();
});

async function carregarDados() {
    const resposta = await fazerRequisicaoAutenticada(
        "http://localhost:8080/doctors/1"
    );

    if (!resposta) return;

    const dados = await resposta.json();
    document.getElementById("nome").textContent = dados.nome;
}

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

async function buscarConsulta() {
    const resultadoEl = document.getElementById("p_result");
    const input = document.getElementById("input");
    const id = input.value.trim();

    resultadoEl.textContent = "";

    if (id === "") {
        resultadoEl.textContent = "Campo em branco: digite um id";
        return;
    }

    resultadoEl.textContent = "Buscando...";

    try {
        const resposta = await fetch(`http://localhost:8080/appointments/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            resultadoEl.textContent = `Erro: consulta não encontrada (status ${resposta.status})`;
            return;
        }

        if (resposta.status === 403 || resposta.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const dados = await resposta.json();
        resultadoEl.textContent = JSON.stringify(dados, null, 2);

    } catch (erro) {
        resultadoEl.textContent = "Erro ao buscar: " + erro.message;
    }


}