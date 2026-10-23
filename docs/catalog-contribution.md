# Como ampliar o catálogo

O schema `src/domain/catalog.ts` valida **registros de pesquisa**, não operações executáveis. Os campos aceitos são estritos; adicionar `command`, `script` ou qualquer chave livre causa rejeição. Não interpretar textos como comandos.

1. Pesquisar o mecanismo em fontes primárias atuais. Confirmar fabricante, versão, API, licença e casos em que a conclusão não se aplica. Comparar alternativa mais conservadora. Registrar commit quando a fonte for código.
2. Procurar IDs, sintomas e mecanismos já existentes para evitar duplicação. Escolher uma categoria principal e nível por profundidade, sem usar o nível como aprovação de segurança. Adicionar tags PT/EN para referências cruzadas.
3. Criar ID estável e preencher todos os campos de `recordSchema`: objetivo, mecanismo, pré-requisitos, riscos, verificações futuras, restauração prevista, aplicabilidade, fontes HTTPS, data, classe de evidência e estado.
4. Classificar 2=efeito documentado condicional; 3=diagnóstico/prevenção; 4=experimento insuficiente; 5=rejeitado. Classe 1 exige medições reproduzíveis e será adicionada ao contrato somente quando existir essa evidência. Nunca promover um texto a classe 1 porque um fabricante anuncia ganho.
5. `manual` é orientação sujeita a requisitos; `integration-pending` é dependência ainda não integrada; `research` é investigação; `rejected` fica fora da seleção. Classe 5 e rejeitado devem corresponder.
6. Rodar `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm catalog:report` e os E2E afetados. Revisar a matriz e atualizar `catalog-findings.md` sem inflar contagens.

Antes de criar uma implementação de ajuste, definir contrato versionado separado: detecção, parâmetros limitados, fabricante/modelos/Windows, origem/licença/auditor, permissões, arquivos/chaves/serviços afetados, pré-condições, estado anterior e desejado, dependências/conflitos, risco, reinício, pós-condições, critérios de falha, mensagens, cancelamento, retomada, idempotência e rollback. Campos desconhecidos bloqueiam a execução quando pertinentes à segurança; campos não aplicáveis devem declarar essa condição.

Testar adaptador isolado, entradas inválidas, execução repetida/concorrente, permissão negada, perda de conexão, alteração externa concorrente, falha parcial e crash. Restaurar o valor original real, inclusive ausência/tipo, nunca um valor “padrão” presumido. Integração nativa só pode ser declarada funcional depois de teste na plataforma suportada. Firmware e estabilidade física exigem procedimento próprio em hardware de teste.

O catálogo original sintetiza mecanismos técnicos e cita fontes; não contém código de EXM, FR33THY ou utilitários. Não copiar scripts, screenshots, SDKs ou binários sem revisar seus direitos. Antes de distribuir, preservar licenças/avisos de todos os componentes efetivamente incorporados.
