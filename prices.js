'use strict';
// ============================================================
//  TABELA DE PREÇOS — Campus Copy
//  Valores em REAIS (ex.: 0.90 = R$ 0,90). Não mexa no app.js.
// ============================================================
const CONFIG_PRECOS = {
    // Preço POR PÁGINA em cada faixa de quantidade.
    // "ate" = limite da faixa (inclusive). A última usa Infinity = "ou mais".
    // "frente" = só frente | "frenteVerso" = frente e verso.
    faixas: [
        { ate: 3,        pb: { frente: 1.00, frenteVerso: 0.90 }, color: { frente: 1.30, frenteVerso: 1.20 } },
        { ate: 10,       pb: { frente: 0.80, frenteVerso: 0.75 }, color: { frente: 1.20, frenteVerso: 1.15 } },
        { ate: 20,       pb: { frente: 0.70, frenteVerso: 0.65 }, color: { frente: 1.10, frenteVerso: 1.05 } },
        { ate: 30,       pb: { frente: 0.65, frenteVerso: 0.60 }, color: { frente: 1.00, frenteVerso: 0.95 } },
        { ate: 50,       pb: { frente: 0.60, frenteVerso: 0.55 }, color: { frente: 0.90, frenteVerso: 0.85 } },
        { ate: 100,      pb: { frente: 0.50, frenteVerso: 0.45 }, color: { frente: 0.80, frenteVerso: 0.75 } },
        { ate: 250,      pb: { frente: 0.40, frenteVerso: 0.35 }, color: { frente: 0.75, frenteVerso: 0.70 } },
        { ate: 500,      pb: { frente: 0.35, frenteVerso: 0.30 }, color: { frente: 0.60, frenteVerso: 0.57 } },
        { ate: Infinity, pb: { frente: 0.30, frenteVerso: 0.25 }, color: { frente: 0.55, frenteVerso: 0.52 } }
    ],
    // Acréscimo por FOLHA de papel. O primeiro é o papel padrão.
    papeis: [
        { nome: 'Sulfite 75 g',     adicional: 0    },
        { nome: 'Sulfite 90 g',     adicional: 0.10 },
        { nome: 'Sulfite 120 g',    adicional: 0.15 },
        { nome: 'Monolúcido 90 g',  adicional: 0.30 },
        { nome: 'Monolúcido 120 g', adicional: 0.40 },
        { nome: 'Offset 180 g',     adicional: 0.40 }
    ],
    // Preço da encadernação espiral (1 unidade) por quantidade de folhas.
    encadernacao: [
        { ate: 50,       preco: 6.00  },
        { ate: 100,      preco: 10.00 },
        { ate: 250,      preco: 15.00 },
        { ate: Infinity, preco: 20.00 }
    ]
};
