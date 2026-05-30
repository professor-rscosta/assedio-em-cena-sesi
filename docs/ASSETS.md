# 🎨 Guia de Imagens e Assets — Assédio em Cena (SESI)

Este documento explica **onde cada imagem fica** e **como substituí-las**.

## Onde salvar os arquivos

```
client/
├── images/
│   ├── logo-sesi.png          ← logo oficial SESI (fundo transparente)
│   ├── favicon.png            ← ícone da aba do navegador (64×64)
│   ├── personagem-teo.png     ← mascote masculino, corpo inteiro (transparente)
│   └── personagem-bia.png     ← mascote feminino, corpo inteiro (transparente)
└── avatars/
    ├── teo.png                ← rosto do Téo, recorte circular (256×256)
    └── bia.png                ← rosta da Bia, recorte circular (256×256)
```

Todos já estão incluídos e processados (fundo branco removido, recortados e otimizados).

## Como os personagens aparecem no jogo

Cada cena tem um personagem que fala. O mapeamento de **nome do personagem → imagem** fica em:

```
client/js/views/game.js  →  const PERSONAGEM_IMG = { ... }
```

Mapeamento atual:

| Personagem (no banco) | Avatar + corpo usados |
|---|---|
| Narrador, Téo, Diego, Marcos | **Téo** (mascote masculino) |
| Bia, Júlia, Renata | **Bia** (mascote feminino) |

- O **avatar circular** (`avatars/`) aparece no badge de fala, no topo-esquerdo da caixa de diálogo.
- O **corpo inteiro** (`images/personagem-*.png`) aparece em pé, à direita da cena, deslizando ao entrar (animação GSAP).

### Para adicionar um novo personagem com imagem própria
1. Salve o corpo inteiro em `client/images/SEU-NOME.png` e o rosto circular em `client/avatars/seu-nome.png`.
2. Adicione a entrada no `PERSONAGEM_IMG` de `game.js`:
   ```js
   'NomeNoBanco': { av: '/avatars/seu-nome.png', full: '/images/SEU-NOME.png' },
   ```

## Como trocar a logo
Substitua `client/images/logo-sesi.png` por outra PNG com **fundo transparente**. Ela aparece na topbar, na tela de login e no rodapé (sempre sobre um retângulo branco, então a versão colorida funciona bem).

## Dicas de processamento
- Personagens devem ter **fundo transparente** (PNG com alfa). Os enviados tinham fundo branco e foram recortados automaticamente.
- Tamanho recomendado do corpo inteiro: altura ~760px. Avatares: 256×256 quadrado.
- Otimize com TinyPNG ou similar para reduzir o peso antes de publicar.
