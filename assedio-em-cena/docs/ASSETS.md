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
Substitua `client/images/logo-sesi.png` por outra PNG com **fundo transparente**. Ela aparece na topbar, na tela de login, no rodapé e nos PDFs (certificado e relatório).

## Vídeos do YouTube nas cenas
Cenas do tipo `video` exibem um player do YouTube. O link fica no banco, na coluna **`video_url`** da tabela `cenarios`.

Onde editar: `database/seed_modulo1.sql` — procure as cenas `m1_video` e `m1_video2`:

```sql
-- cena já configurada com o vídeo que você enviou:
(2, 1, 'm1_video', 'video', 'Assista: Você sabe o que é assédio?',
 'Antes de decidir, assista...', 1, FALSE, 2,
 'https://www.youtube.com/embed/uAT3LjrW9cU?si=M_4IEVFnG11-ElTO'),

-- cena com PLACEHOLDER — troque pelo seu vídeo:
(7, 1, 'm1_video2', 'video', 'Assista: impactos do assédio na saúde',
 'Assista ao vídeo...', 2, FALSE, 7,
 'COLOQUE_AQUI_O_EMBED_DO_YOUTUBE'),
```

Use sempre a URL no formato **embed**: `https://www.youtube.com/embed/SEU_ID`. Enquanto o valor não for uma URL válida (ex.: o placeholder), a cena mostra um aviso verde indicando onde colar o link. Para já configurado no banco em produção, dá para atualizar direto: `UPDATE cenarios SET video_url='https://www.youtube.com/embed/SEU_ID' WHERE chave='m1_video2';`

## Personagem e badge no certificado
O certificado (PDF) usa automaticamente a **logo SESI**, um dos **personagens** (Téo para a maioria dos perfis; Bia para os perfis RH e Vítima), o **nível de maturidade** e a **insígnia conquistada**. As imagens vêm de `client/images/` — as mesmas do jogo. Para trocar o personagem do certificado, é só substituir os PNGs.

## Dicas de processamento
- Personagens devem ter **fundo transparente** (PNG com alfa). Os enviados tinham fundo branco e foram recortados automaticamente.
- Tamanho recomendado do corpo inteiro: altura ~760px. Avatares: 256×256 quadrado.
- Otimize com TinyPNG ou similar para reduzir o peso antes de publicar.
