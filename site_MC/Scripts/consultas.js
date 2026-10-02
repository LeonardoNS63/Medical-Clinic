const BASE_URL = "http://localhost:8080/appointments";

// ID da consulta pendente selecionada pelo médico para agendar
let consultaSelecionadaId = null;

// ═══════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════
window.addEventListener("load", () => {
    const token = TokenManager.obterToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    document.body.classList.add("loaded");
    configurarLogoutAutomatico();

    const payload = TokenManager.decodificarToken(token);
    const role = payload.role;

    if (role === "ROLE_PACIENTE") {
        document.getElementById("secao-paciente").style.display = "block";
        carregarConsultasPaciente();

    } else if (role === "ROLE_MEDICO") {
        document.getElementById("secao-medico").style.display = "block";
        carregarConsultasPendentes();
        carregarConsultasAgendadas();

    } else {
        document.getElementById("secao-admin").style.display = "block";
    }
});

// ═══════════════════════════════════════════════════════════
// PACIENTE — SOLICITAR CONSULTA
// ═══════════════════════════════════════════════════════════
async function solicitarConsulta() {
    const tipo = document.getElementById("tipo-consulta").value;
    const descricao = document.getElementById("descricao").value.trim();
    const feedbackEl = document.getElementById("feedback-solicitar");
    const erroTipoEl = document.getElementById("erro-tipo");
    const btnSolicitar = document.getElementById("btn-solicitar");

    erroTipoEl.textContent = "";
    esconderFeedback(feedbackEl);

    if (!tipo) {
        erroTipoEl.textContent = "Selecione o tipo de consulta.";
        return;
    }

    btnSolicitar.disabled = true;
    btnSolicitar.textContent = "Solicitando...";

    try {
        const resposta = await fazerRequisicaoAutenticada(`${BASE_URL}`, {
            method: "POST",
            body: JSON.stringify({ tipo, descricao: descricao || null })
        });

        if (!resposta) return;

        if (!resposta.ok) {
            mostrarFeedback(feedbackEl, "Erro ao solicitar consulta. Tente novamente.", "erro");
            return;
        }

        // Limpa o formulário
        document.getElementById("tipo-consulta").value = "";
        document.getElementById("descricao").value = "";

        mostrarFeedback(feedbackEl, "Consulta solicitada com sucesso!", "sucesso");

        // Recarrega a lista de consultas do paciente
        await carregarConsultasPaciente();

    } catch (erro) {
        mostrarFeedback(feedbackEl, "Erro ao conectar com o servidor.", "erro");
        console.error(erro);
    } finally {
        btnSolicitar.disabled = false;
        btnSolicitar.textContent = "Solicitar Consulta";
    }
}

// ═══════════════════════════════════════════════════════════
// PACIENTE — LISTAR SUAS CONSULTAS
// ═══════════════════════════════════════════════════════════
async function carregarConsultasPaciente() {
    const listaEl = document.getElementById("lista-paciente");
    listaEl.innerHTML = "<p>Carregando...</p>";

    const resposta = await fazerRequisicaoAutenticada(`${BASE_URL}/me`);
    if (!resposta) return;

    const body = await resposta.json();

    // Garante que sempre trabalhamos com um array
    const consultas = Array.isArray(body) ? body : (body.content ?? []);

    if (consultas.length === 0) {
        listaEl.innerHTML = "<p>Você ainda não tem consultas solicitadas.</p>";
        return;
    }

    listaEl.innerHTML = consultas.map(c => cardConsultaPaciente(c)).join("");
}

function cardConsultaPaciente(c) {
    const statusInfo = traduzirStatus(c.status);
    const dataInfo = c.dataAgendada
        ? `<p><strong>Data:</strong> ${formatarData(c.dataAgendada)} às ${c.horaAgendada}</p>
           <p><strong>Local:</strong> ${c.local}</p>
           <p><strong>Médico:</strong> ${c.doctorName ?? "A definir"}</p>`
        : `<p>Aguardando médico disponível...</p>`;

    const botaoCancelar = c.status === "PENDENTE"
        ? `<button class="btn-cancelar" onclick="cancelarConsulta(${c.id})">Cancelar</button>`
        : "";

    return `
        <div class="card-consulta status-${c.status.toLowerCase()}">
            <div class="card-header">
                <span class="badge-status">${statusInfo.icone} ${statusInfo.texto}</span>
                <span class="tipo-consulta">${traduzirTipo(c.tipo)}</span>
            </div>
            ${c.descricao ? `<p class="descricao-consulta">"${c.descricao}"</p>` : ""}
            ${dataInfo}
            ${botaoCancelar}
        </div>
    `;
}

async function cancelarConsulta(id) {
    if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;

    const resposta = await fazerRequisicaoAutenticada(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    if (!resposta) return;

    if (resposta.ok) {
        await carregarConsultasPaciente();
    } else {
        const erro = await resposta.text();
        alert("Erro ao cancelar: " + erro);
    }
}

// ═══════════════════════════════════════════════════════════
// MÉDICO — LISTAR CONSULTAS PENDENTES
// ═══════════════════════════════════════════════════════════
async function carregarConsultasPendentes() {
    const listaEl = document.getElementById("lista-pendentes");
    listaEl.innerHTML = "<p>Carregando...</p>";

    const resposta = await fazerRequisicaoAutenticada(`${BASE_URL}/pendentes`);
    if (!resposta) return;

    const consultas = await resposta.json();

    if (consultas.length === 0) {
        listaEl.innerHTML = "<p>Nenhuma consulta pendente no momento.</p>";
        return;
    }

    listaEl.innerHTML = consultas.map(c => cardConsultaPendente(c)).join("");
}

function cardConsultaPendente(c) {
    return `
        <div class="card-consulta status-pendente">
            <div class="card-header">
                <span class="tipo-consulta">${traduzirTipo(c.tipo)}</span>
            </div>
            <p><strong>Paciente:</strong> ${c.patientName ?? "Não informado"}</p>
            ${c.descricao ? `<p class="descricao-consulta">"${c.descricao}"</p>` : "<p>Sem descrição.</p>"}
            <button class="btn-agendar" onclick="abrirModal(${c.id}, '${c.patientName}', '${traduzirTipo(c.tipo)}')">
                Agendar esta consulta
            </button>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════
// MÉDICO — MODAL DE AGENDAMENTO
// ═══════════════════════════════════════════════════════════
function abrirModal(id, nomePaciente, tipoConsulta) {
    consultaSelecionadaId = id;

    document.getElementById("modal-info-consulta").textContent =
        `Paciente: ${nomePaciente} — ${tipoConsulta}`;

    // Define data mínima como hoje
    const hoje = new Date().toISOString().split("T")[0];
    document.getElementById("data-agendada").min = hoje;
    document.getElementById("data-agendada").value = "";
    document.getElementById("hora-agendada").value = "";
    document.getElementById("local-consulta").value = "";

    limparErrosModal();
    esconderFeedback(document.getElementById("feedback-agendar"));

    document.getElementById("modal-agendar").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modal-agendar").style.display = "none";
    consultaSelecionadaId = null;
}

async function confirmarAgendamento() {
    const dataAgendada = document.getElementById("data-agendada").value;
    const horaAgendada = document.getElementById("hora-agendada").value;
    const local = document.getElementById("local-consulta").value.trim();
    const feedbackEl = document.getElementById("feedback-agendar");
    const btnConfirmar = document.getElementById("btn-confirmar-agendamento");

    limparErrosModal();
    esconderFeedback(feedbackEl);

    let temErro = false;

    if (!dataAgendada) {
        document.getElementById("erro-data").textContent = "Selecione uma data.";
        temErro = true;
    }
    if (!horaAgendada) {
        document.getElementById("erro-hora").textContent = "Selecione um horário.";
        temErro = true;
    }
    if (!local) {
        document.getElementById("erro-local").textContent = "Informe o local.";
        temErro = true;
    }
    if (temErro) return;

    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Agendando...";

    try {
        const resposta = await fazerRequisicaoAutenticada(
            `${BASE_URL}/${consultaSelecionadaId}/aprovar`,
            {
                method: "PUT",
                body: JSON.stringify({ dataAgendada, horaAgendada, local })
            }
        );

        if (!resposta) return;

        if (!resposta.ok) {
            mostrarFeedback(feedbackEl, "Erro ao agendar. Tente novamente.", "erro");
            return;
        }

        fecharModal();

        // Recarrega as duas listas
        await carregarConsultasPendentes();
        await carregarConsultasAgendadas();

    } catch (erro) {
        mostrarFeedback(feedbackEl, "Erro ao conectar com o servidor.", "erro");
        console.error(erro);
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Confirmar";
    }
}

function limparErrosModal() {
    document.getElementById("erro-data").textContent = "";
    document.getElementById("erro-hora").textContent = "";
    document.getElementById("erro-local").textContent = "";
}

// ═══════════════════════════════════════════════════════════
// MÉDICO — LISTAR CONSULTAS AGENDADAS
// ═══════════════════════════════════════════════════════════
async function carregarConsultasAgendadas() {
    const listaEl = document.getElementById("lista-agendadas");
    listaEl.innerHTML = "<p>Carregando...</p>";

    const resposta = await fazerRequisicaoAutenticada(`${BASE_URL}/agendadas`);
    if (!resposta) return;

    const consultas = await resposta.json();

    if (consultas.length === 0) {
        listaEl.innerHTML = "<p>Você ainda não agendou nenhuma consulta.</p>";
        return;
    }

    listaEl.innerHTML = consultas.map(c => cardConsultaAgendada(c)).join("");
}

function cardConsultaAgendada(c) {
    return `
        <div class="card-consulta status-aprovada">
            <div class="card-header">
                <span class="badge-status">✅ Agendada</span>
                <span class="tipo-consulta">${traduzirTipo(c.tipo)}</span>
            </div>
            <p><strong>Paciente:</strong> ${c.patientName ?? "Não informado"}</p>
            <p><strong>Data:</strong> ${formatarData(c.dataAgendada)} às ${c.horaAgendada}</p>
            <p><strong>Local:</strong> ${c.local}</p>
            ${c.descricao ? `<p class="descricao-consulta">"${c.descricao}"</p>` : ""}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════
function traduzirTipo(tipo) {
    const tipos = {
        MEDICO_GERAL:    "Médico Geral",
        ORTOPEDIA:       "Ortopedia",
        ENDOCRINOLOGIA:  "Endocrinologia",
        CARDIOLOGIA:     "Cardiologia",
        DERMATOLOGIA:    "Dermatologia",
        GINECOLOGIA:     "Ginecologia",
        PEDIATRIA:       "Pediatria"
    };
    return tipos[tipo] ?? tipo;
}

function traduzirStatus(status) {
    const statusMap = {
        PENDENTE:  { texto: "Pendente",  icone: "🟡" },
        APROVADA:  { texto: "Aprovada",  icone: "✅" },
        CANCELADA: { texto: "Cancelada", icone: "❌" }
    };
    return statusMap[status] ?? { texto: status, icone: "❓" };
}

function formatarData(data) {
    if (!data) return "A definir";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function mostrarFeedback(elemento, mensagem, tipo) {
    elemento.textContent = mensagem;
    elemento.className = `feedback ${tipo}`;
    elemento.style.display = "block";
}

function esconderFeedback(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.style.display = "none";
}