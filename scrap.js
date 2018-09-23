const puppeteer = require('puppeteer');
var fs = require('fs');
const Axios = require('axios')
var stayAwake = require('stay-awake');

var username;
var password;

const GLOBAL_CONFIG = {ignoreHTTPSErrors:true, headless: true};

const USERNAME_SELECTOR = '#login-email';
const PASSWORD_SELECTOR = '#password';
const BUTTON_SELECTOR = 'body > div.container > section > section.signin > form > button';

var URL_COURSE;

var QUEUE_AULAS = [];
var COUNT_AULAS = 0;
var TOTAL_AULAS = 0;

var QUEUE_ATIVIDADES = [];
var COUNT_ATIVIDADES = 0;
var TOTAL_ATIVIDADES = 0;

var LIST_VIDEOS = [];
var COUNT_VIDEOS = 0
var TOTAL_VIDEOS = 0;

var OPERATION_MODE;
var COUNT_OPERATION;
var LIST_OPERATION = [];
var TOTAL_OPERATION;


async function run() {
  QUEUE_AULAS = [];
  COUNT_AULAS = 0;
  TOTAL_AULAS = 0;

  QUEUE_ATIVIDADES = [];
  COUNT_ATIVIDADES = 0;
  TOTAL_ATIVIDADES = 0;

  LIST_VIDEOS = [];
  COUNT_VIDEOS = 0
  TOTAL_VIDEOS = 0;

  scrap_aulas();
}

async function scrap_aulas(){
  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  

  if(OPERATION_MODE == 'single'){
    await page.goto(args.course);
    URL_COURSE = args.course;
  }else if(OPERATION_MODE == 'list'){
    await page.goto(LIST_OPERATION[COUNT_OPERATION]);
    URL_COURSE = LIST_OPERATION[COUNT_OPERATION];
    
    COUNT_OPERATION++;
  }

  console.log("[STATUS]: Acessando a página do curso: " + URL_COURSE);
  
  try{
    await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
      console.log('[WARNING] : URL TIMEOUT - Falha ao obter conteudo da pagina, tentando novamente...');
      //scrap_video();
    });
  }catch(e){
    scrap_aulas();
  } 

  console.log("[STATUS]: Capturando lista de aulas...");

  const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('div.course-content-sectionList > ul > li > a[href]'), ({ href }) => href)
  );
  
  for(var i in hrefs) {
    QUEUE_AULAS.push(hrefs[i]);
  }
  TOTAL_AULAS = QUEUE_AULAS.length;
  console.log('[STATUS]: Total de Aulas encontradas: ' + TOTAL_AULAS);

  browser.close();
  scrap_atividades();
}

async function scrap_atividades(){
  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  console.log('[STATUS]: Acessando aula: ' + QUEUE_AULAS[COUNT_AULAS]);

  await page.goto(QUEUE_AULAS[COUNT_AULAS]);

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);

  console.log("[STATUS]: Tentando fazer login...");
  await page.click(BUTTON_SELECTOR);

  try{
    await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
      console.log('[WARNING]: URL TIMEOUT - Tentando obter conteudo da pagina...');
      //scrap_video();
    });
  }catch(e){
    scrap_atividades();
  }
  

  console.log('[STATUS]: Capturando lista de atividades da aula...');

  let atividades = await page.evaluate((sel) => {
    return Array.from(document.getElementsByClassName(sel)).map(node => node.href);
  }, 'task-menu-nav-item-link-VIDEO')

  for(var i in atividades) {
    QUEUE_ATIVIDADES.push(atividades[i]);
  }
  TOTAL_ATIVIDADES = QUEUE_ATIVIDADES.length;
  console.log('[STATUS]: Total de Aulas encontradas: ' + TOTAL_ATIVIDADES);

  browser.close();
  scrap_video();

  if(COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
    COUNT_AULAS++;
    //QUEUE_AULAS = [];
  }

}

async function scrap_video(){

  stayAwake.prevent(function() {}); // prevent system sleep

  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  if(COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
    COUNT_AULAS++;
    scrap_atividades();
  }else{
    console.log('[STATUS]: Acessando aula: ' + QUEUE_ATIVIDADES[COUNT_ATIVIDADES]);

    await page.goto(QUEUE_ATIVIDADES[COUNT_ATIVIDADES]);

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(password);

    console.log("[STATUS]: Tentando fazer login...");
    await page.click(BUTTON_SELECTOR);

    console.log('[STATUS]: Obtendo o URL do vídeo...');

    try{
      await page.waitForNavigation({timeout:30000}).then(()=>{},()=>{
        console.log('[WARNING]: URL TIMEOUT Tentando pegar conteudo da página...');
      });
    }catch(e){
      scrap_video();
    }
    

    try {
      const video = await page.evaluate(() => document.querySelector('#video-player-frame_html5_api > source:nth-child(1)').src);
      LIST_VIDEOS.push(video);
      console.log("[STATUS]: Video encontrado "/*+video*/);

      var final_name = video.split('/')[4];

      real_aula = COUNT_AULAS + 1;

      real_atividades = COUNT_ATIVIDADES + 1;

      var file_path = __dirname+"/downloads/"+URL_COURSE.split('/')[4]+"/Aula-"+real_aula;

      var mkdirp = await require('mkdirp');
      mkdirp(file_path, function(err) {});

      var path = file_path+"/Video-"+real_atividades+"-"+final_name.split('=')[5];

      console.log("[STATUS]: Baixando Video: " + final_name.split('=')[5]);
      
      await downloadVideo(path, video);

      await browser.close();
      
      var FIX_TOTAL_AULAS = TOTAL_AULAS - 1; //Fixa total de aulas de acordo com contagem do array, evitando sobra de 1 elemento.
      
      //console.log('[STATUS]: ATIVIDADES: '+COUNT_ATIVIDADES+'/'+TOTAL_ATIVIDADES + ' AULAS: '+COUNT_AULAS+'/'+TOTAL_AULAS);
      
      if(COUNT_AULAS >= FIX_TOTAL_AULAS && COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
        if(OPERATION_MODE == 'single'){
          console.log('[STATUS]: Nada para fazer, tarefas concluidas!');
          process.exit();        
        }else if(OPERATION_MODE == 'list'){
          if(COUNT_OPERATION >= TOTAL_OPERATION){
            console.log('[STATUS]: Nada para fazer, tarefas concluidas!');
            process.exit();   
          }else{
            run();
          }
        }
        
      }else{
        scrap_video();
      }
     
    } catch (e) {
      console.log('[ERROR] : Não foi possivel obter o vídeo, tentando novamente... ');
      scrap_video();
    }
  }

}

async function downloadVideo(path, url) {
  // axios image download with response type "stream"
  const response = await Axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  // pipe the result stream into a file on disc
  response.data.pipe(fs.createWriteStream(path))

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      COUNT_ATIVIDADES++;
      resolve()
    })

    response.data.on('error', () => {
      reject()
    })
  })
}

// prevent auto sleep 
stayAwake.prevent(function(err, data) {
  //console.log('%d routines are preventing sleep', data);
});

//run();

function helper(){
  console.log('Você esqueceu de definir algum argumento...')
  console.log('Use por exemplo:')
  console.log('node scrap.js --username=eu@email.com ');
  console.log('              --pass="123" ');
  console.log('              --mode=single or list');
  console.log('              --course=https://cursos.alura.com.br/course/android-...');
  console.log('              OR');
  console.log('              --course=listOfCourses.txt');
}



'use strict';

const args = require('yargs').argv;
async function get_args(){
  if(args.username == null || args.username == "" || args.username == 'undefinied' || args.pass == null || args.pass == "" || args.pass == 'undefinied' || args.mode == null || args.mode == "" || args.mode == 'undefinied'){
    helper();
  }else{
      console.log('[STATUS]: Definindo usuario: ' + args.username);  
      console.log('[STATUS]: Definindo senha: ' + args.pass); 
      console.log('[STATUS]: Definindo alvo: ' + args.course); 
      
      URL_COURSE = args.course;
      username = args.username;
      password = args.pass;
  
      if(args.mode == 'single'){
        console.log('[STATUS]: Selecionado modo para apenas um curso');
        run();
      }else if(args.mode == 'list'){
        console.log('[STATUS]: Selecionado modo para lista de cursos');
  
        var lineReader = require('readline').createInterface({
          input: fs.createReadStream(args.course)
        });
        
        await lineReader.on('line', function (line) {
          LIST_OPERATION.push(line.toString());
        }).on('close', function() {
          console.log('[STATUS]: Lista carregada com sucesso');
          TOTAL_OPERATION = LIST_OPERATION.length;
          COUNT_OPERATION = 0;
          OPERATION_MODE = args.mode;
          run();
        });
  
       
      }else{
        helper();
      }
      //run();
  }
}
get_args();

