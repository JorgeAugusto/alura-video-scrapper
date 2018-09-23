# Alura Video Scrapper
Baixe seus cursos e assista offline em dispositivos que não suportam a aplicação Alura ou em zonas de bloqueio de dns como em seu trabalho ou escola. Ou seja, em qualquer lugar!

## !!! ALERTA:  Não utilize para fins de pirataria.

#### Funcionalidades

- Baixa apenas um curso
- Baixa lista de cursos
- Fila com cursos a baixar

#### Instalando

  Primeiro clone o repositório do projeto

`$ git clone https://github.com/ceelsoin/alura-video-scrapper
`

   E então instale os modulos necessários

```$ npm install
```

Para começar a baixar as aulas basta rodar o comando

`$ node scrap.js [args]`

#### Lista de argumentos disponíveis
- --username=email@alura.com (Define o nome de usuario)
- --pass="sua senha" (Deve estar entre aspas duplas)
- --mode=list (ou single, são os modos disponiveis de atuação da aplicação)

#####Utilizando --mode=list
1. Caso precise baixar diversos cursos, adicione o URL de cada curso em um arquivo de texto e salve-o. Exemplo: https://cursos.alura.com.br/course/android-testes-automatizados-tdd
2. Em seguida carregue o comando --mode=list e logo após o comando --course=arquivo.txt

Exemplo:
`$ node scrap.js --username=eu@email.com --pass="minhasenha" --mode=list --course=arquivo.txt`

#####Utilizando --mode=single
1. Neste modo você baixa apenas um curso por execução, então pegue o link do curso. Exemplo: https://cursos.alura.com.br/course/android-testes-automatizados-tdd
2. Carregue o comando --mode=single course=https://cursos.alura.com.br/course/android-testes-automatizados-tdd

Ficando no final:
`$ node scrap.js --username=eu@email.com --pass="minhasenha" --mode=single --course=https://cursos.alura.com.br/course/android-testes-automatizados-tdd`

### Contribuições
Se você gostou do projeto e quer contribuir com seu código ou com os desenvolvedores, envie um pull request ou um email para falecom@celsoinacio.com.br

Desenvolvido com :heart: no vale tecnológico da Baixada Fluminense




