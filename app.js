'use strict';
const cents = v => Math.round(v * 100);
const tiers = CONFIG_PRECOS.faixas.map(f => ({
    ate: f.ate,
    pb: { frente: cents(f.pb.frente), frenteVerso: cents(f.pb.frenteVerso) },
    color: { frente: cents(f.color.frente), frenteVerso: cents(f.color.frenteVerso) }
})).sort((a, b) => a.ate - b.ate);
const papers = CONFIG_PRECOS.papeis.map(p => ({
    name: p.nome,
    extra: cents(p.adicional)
}));
const bindingTiers = CONFIG_PRECOS.encadernacao.map(e => ({
    ate: e.ate,
    preco: cents(e.preco)
})).sort((a, b) => a.ate - b.ate);
const money = cents => (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});
const rangeLabel = i => {
    const from = i === 0 ? 1 : tiers[i - 1].ate + 1;
    return tiers[i].ate === Infinity ? `${from} ou mais` : `${from} a ${tiers[i].ate}`;
};
const bindingPrice = sheets => bindingTiers.find(t => sheets <= t.ate).preco;

function calculate(pages, color, duplex, paper, binding = false) {
    if (!Number.isInteger(pages) || pages < 1 || pages > 100000 || (color !== 'pb' && color !== 'color') || typeof duplex !== 'boolean' || !Number.isInteger(paper) || !papers[paper]) throw new Error('Configuração inválida');
    const index = tiers.findIndex(t => pages <= t.ate),
        rate = tiers[index][color][duplex ? 'frenteVerso' : 'frente'],
        sheets = duplex ? Math.ceil(pages / 2) : pages,
        print = pages * rate,
        extra = sheets * papers[paper].extra;
    const finishing = binding ? bindingPrice(sheets) : 0;
    return {
        pages,
        color,
        duplex,
        paper,
        index,
        rate,
        sheets,
        print,
        extra,
        finishing,
        total: print + extra + finishing
    };
}
let color = 'pb',
    quote = '';
const $ = id => document.getElementById(id);

function update() {
    const pages = Number($('pages').value),
        duplex = $('duplex').checked,
        paper = Number($('paper').value);
    let r;
    try {
        r = calculate(pages, color, duplex, paper, $('binding').checked)
    } catch {
        $('error').hidden = false;
        $('pages').setAttribute('aria-invalid', 'true');
        $('total').textContent = '—';
        $('whatsapp').removeAttribute('href');
        $('whatsapp').setAttribute('aria-disabled', 'true');
        $('copy').disabled = true;
        for (const id of ['range', 'rate', 'print', 'sheets', 'extra', 'binding-price']) $(id).textContent = '—';
        return null;
    }
    $('error').hidden = true;
    $('pages').removeAttribute('aria-invalid');
    $('copy').disabled = false;
    $('whatsapp').removeAttribute('aria-disabled');
    $('minus').disabled = pages === 1;
    $('plus').disabled = pages === 100000;
    $('total').textContent = money(r.total);
    $('range').textContent = rangeLabel(r.index) + ' páginas';
    $('rate').textContent = money(r.rate) + ' por página';
    $('print').textContent = `${pages} × ${money(r.rate)} = ${money(r.print)}`;
    $('sheets').textContent = r.sheets.toLocaleString('pt-BR');
    $('extra-row').hidden = r.extra === 0;
    $('extra').textContent = `${r.sheets} × ${money(papers[paper].extra)} = ${money(r.extra)}`;
    $('feedback').textContent = '';
    $('print-type').textContent = color === 'pb' ? 'Preto e branco (P&B) · A4' : 'Colorida · A4';
    $('binding-row').hidden = !$('binding').checked;
    $('binding-price').textContent = money(r.finishing);
    $('lamination-row').hidden = !$('lamination').checked;
    quote = `Olá, Campus Copy! Calculei este orçamento:\n\n• Impressão A4 ${color==='pb'?'preto e branco':'colorida'}\n• ${pages} páginas — ${duplex?'frente e verso':'somente frente'}\n• Papel: ${papers[paper].name}\n• ${r.sheets} folhas\n• Impressão: ${money(r.print)} (${money(r.rate)}/página)${r.extra?'\n• Adicional do papel: '+money(r.extra):''}${r.finishing?'\n• Encadernação espiral: 1 unidade ('+r.sheets+' folhas) — '+money(r.finishing):''}${$('lamination').checked?'\n• Solicito plastificação: preço sob consulta, não incluído no total':''}\n\nTotal${$('lamination').checked?' (sem plastificação)':''}: ${money(r.total)}\n\nGostaria de enviar o arquivo para confirmar o pedido.`;
    $('whatsapp').href = 'https://wa.me/5587991024607?text=' + encodeURIComponent(quote);
    document.querySelectorAll('[data-pages]').forEach(b => b.classList.toggle('selected', Number(b.dataset.pages) === pages));
    return r;
}

function renderTable() {
    $('caption').textContent = color === 'pb' ? 'Preto e branco · A4' : 'Colorida · A4';
    $('table').innerHTML = tiers.map((t, i) => `<tr><td>${rangeLabel(i)}</td><td>${money(t[color].frente)}</td><td>${money(t[color].frenteVerso)}</td></tr>`).join('');
}

function renderPapers() {
    $('paper').innerHTML = papers.map((p, i) => `<option value="${i}">${p.name} · ${p.extra === 0 ? 'sem acréscimo' : `+ ${money(p.extra)}/folha`}</option>`).join('');
}

function renderBindingTable() {
    document.querySelector('.binding-table tbody').innerHTML = bindingTiers.map((t, i) => {
        const label = t.ate === Infinity ? `${bindingTiers[i - 1].ate + 1} folhas ou mais` : i === 0 ? `Até ${t.ate} folhas` : `${bindingTiers[i - 1].ate + 1} a ${t.ate} folhas`;
        return `<tr><th scope="row">${label}</th><td>${money(t.preco)}</td></tr>`;
    }).join('');
}

function setColor(value) {
    color = value;
    document.body.dataset.printType = value;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'color' ? '#191430' : '#0e1424');
    document.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === color)));
    renderTable();
}
document.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => {
    setColor(b.dataset.color);
    update()
}));
document.querySelectorAll('[data-pages]').forEach(b => b.addEventListener('click', () => {
    $('pages').value = b.dataset.pages;
    update()
}));
$('pages').addEventListener('input', update);
$('duplex').addEventListener('change', update);
$('paper').addEventListener('change', update);
$('binding').addEventListener('change', update);
$('lamination').addEventListener('change', update);
$('minus').addEventListener('click', () => {
    $('pages').value = Math.max(1, (Number($('pages').value) || 1) - 1);
    update()
});
$('plus').addEventListener('click', () => {
    $('pages').value = Math.min(100000, (Number($('pages').value) || 0) + 1);
    update()
});
$('copy').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(quote);
        $('feedback').textContent = 'Orçamento copiado!'
    } catch {
        $('feedback').textContent = 'Não foi possível copiar. Use o botão do WhatsApp.'
    }
});
renderPapers();
renderBindingTable();
renderTable();
update();
if (document.modelContext?.registerTool) {
    try {
        Promise.resolve(document.modelContext.registerTool({
            name: 'configure_print_quote',
            title: 'Calcular impressão',
            description: 'Configura a calculadora e retorna o orçamento; não envia mensagens.',
            inputSchema: {
                type: 'object',
                properties: {
                    pages: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100000
                    },
                    color: {
                        type: 'string',
                        enum: ['pb', 'color']
                    },
                    duplex: {
                        type: 'boolean'
                    },
                    paper: {
                        type: 'integer',
                        minimum: 0,
                        maximum: papers.length - 1
                    },
                    binding: {
                        type: 'boolean'
                    },
                    lamination: {
                        type: 'boolean'
                    }
                },
                required: ['pages', 'color', 'duplex', 'paper'],
                additionalProperties: false
            },
            annotations: {
                readOnlyHint: false
            },
            execute(input) {
                calculate(input.pages, input.color, input.duplex, input.paper);
                $('pages').value = input.pages;
                $('duplex').checked = input.duplex;
                $('paper').value = input.paper;
                $('binding').checked = input.binding === true;
                $('lamination').checked = input.lamination === true;
                setColor(input.color);
                return update();
            }
        })).catch(() => {});
    } catch {}
}
