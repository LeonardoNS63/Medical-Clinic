window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

class TokenManager {
    static STORAGE_KEY = "token";

    static decodificarToken(token) {
        try {
            const partes = token.split(".");
            if (partes.length !== 3) throw new Error("Token inválido");
            return JSON.parse(atob(partes[1]));
        } catch (erro) {
            console.error("Erro ao decodificar token:", erro);
            return null;
        }
    }


    static tokenExpirou() {
        const token = localStorage.getItem(this.STORAGE_KEY);
        if (!token) return true;

        const payload = this.decodificarToken(token);
        if (!payload || !payload.exp) return true;

        const agora = Math.floor(Date.now() / 1000);
        return payload.exp < agora;
    }

    static obterToken() {
        if (this.tokenExpirou()) {
            this.limparToken(); 
            return null;
        }
        return localStorage.getItem(this.STORAGE_KEY);
    }

    static salvarToken(token) {
        localStorage.setItem(this.STORAGE_KEY, token);
    }

    static limparToken() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static tempoAteExpiracao() {
        const token = localStorage.getItem(this.STORAGE_KEY);
        if (!token) return 0;
        const payload = this.decodificarToken(token);
        if (!payload || !payload.exp) return 0;
        const agora = Math.floor(Date.now() / 1000);
        return Math.max(0, payload.exp - agora);
    }
}

async function fazerRequisicaoAutenticada(url, opcoes = {}) {
    const token = TokenManager.obterToken();

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    const headers = {
        "Content-Type": "application/json", 
        ...opcoes.headers,                  
        "Authorization": `Bearer ${token}` 
    };

    try {
        const resposta = await fetch(url, { ...opcoes, headers });

        if (resposta.status === 401) {
            TokenManager.limparToken();
            window.location.href = "login.html";
            return null;
        }

        if (resposta.status === 403) {
            console.error("Sem permissão para acessar este recurso.");
            return null;
        }

        return resposta;

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        return null;
    }
}

function fazerLogout() {
    TokenManager.limparToken();
    window.location.href = "login.html";
}

function configurarLogoutAutomatico() {

    setInterval(() => {
        const tempoRestante = TokenManager.tempoAteExpiracao();

        if (tempoRestante <= 120 && tempoRestante > 60) {
            const avisoEl = document.getElementById("aviso-sessao");
            if (avisoEl) {
                avisoEl.textContent = "Sua sessão expira em menos de 2 minutos.";
                avisoEl.style.display = "block";
            }
        }

        if (tempoRestante <= 60) {
            console.warn("Token expirado, realizando logout automático...");
            TokenManager.limparToken();
            window.location.href = "login.html";
        }
    }, 30000);
}