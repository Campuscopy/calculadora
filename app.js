'use strict';
const ranges = [3, 10, 20, 30, 50, 100, 250, 500, Infinity];
const prices = {
    pb: [
        [100, 90],
        [80, 75],
        [70, 65],
        [65, 60],
        [60, 55],
        [50, 45],
        [40, 35],
        [35, 30],
        [30, 25]
    ],
    color: [
        [130, 120],
        [120, 115],
        [110, 105],
        [100, 95],
        [90, 85],
        [80, 75],
        [75, 70],
        [60, 57],
        [55, 52]
    ]
};
const papers = [{
    name: 'Sulfite 75 g',
    extra: 0
}, {
    name: 'Sulfite 90 g',
    extra: 10
}, {
    name: 'Sulfite 120 g',
    extra: 15
}, {
    name: 'Monolúcido 90 g',
    extra: 30
}, {
    name: 'Monolúcido 120 g',
    extra: 40
}, {
    name: 'Offset 180 g',
    extra: 40
}];
const money = cents => (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});
const rangeLabel = i => i === 8 ? '501 ou mais' : `${i===0?1:ranges[i-1]+1} a ${ranges[i]}`;
const bindingPrice = sheets => sheets <= 50 ? 600 : sheets <= 100 ? 1000 : sheets <= 250 ? 1500 : 2000;

function calculate(pages, color, duplex, paper, binding = false) {
    if (!Number.isInteger(pages) || pages < 1 || pages > 100000 || !Object.hasOwn(prices, color) || typeof duplex !== 'boolean' || !Number.isInteger(paper) || !papers[paper]) throw new Error('Configuração inválida');
    const index = ranges.findIndex(max => pages <= max),
        rate = prices[color][index][duplex ? 1 : 0],
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
    $('table').innerHTML = prices[color].map((p, i) => `<tr><td>${rangeLabel(i)}</td><td>${money(p[0])}</td><td>${money(p[1])}</td></tr>`).join('');
}

function setColor(value) {
    color = value;
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
                        maximum: 5
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
