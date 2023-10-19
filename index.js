const prompt = require('prompt-sync')();
const chalk = require('chalk');
const makeDir = require('make-dir');
const v = require('voca');
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

try {
    require('dotenv').config()
} catch (e) {
    console.log('No hay dotenv')
}

const { fastAnswerMessages } = require('./helpers/openai.helper')


const log = console.log;

let lm_ = function (text) {
    return chalk.bgYellow(chalk.blue(text))
}
let lq_ = function (text) {
    return chalk.bgGreen(chalk.whiteBright(text))
}

let exampleJSON = require('./example.json')


let about = `Eres un desarrollador senior NodeJS, experto en crear sistemas API rest, tu tarea es crear un archivo de configuracion que sera de ayuda para crear uns sistema robusto, de un cliente, para tareas especificas. 
debes recabar una serie de datos entre los cuales se encuentran  que subdpath tendra la URL, por defecto es (/api/), la URL de MongoDB completa para establecer la conexion, El nombre del usuario y la contraseña del sistema.

`

let main = async function () {
    log(lm_(" Hello my name is BOT-ecito 🤖, and Im a bot that helps you to create software (API rest and panel de control) in an easy way. "))

    const name = prompt(lq_('What is your name? '));
    log(lm_(`Hi ${name} is a big pleasure to me help you.`));
    log(lm_(`Tell me all about your Application and I will help you to make it real `));

    let descriptionInitial = []
    descriptionInitial.push(prompt(lq_('Give me a detailed description about your APP')));

    let askAgain = true
    let JSON_f = {}

    do {

        log(lm_('🤖💬... Thinking....'))

        let answer = await fastAnswerMessages([
            {
                "role": "system",
                "content": about
            },
            {
                "role": "user",
                "content": `Basado en el JSON de ejemplo que aparece a continuacion,
                
                ${JSON.stringify(exampleJSON)} 
                
                Es importante que la respuesta la devuelvas en formato JSON para crear un sistema con las siguientes caracteristicas
                ${descriptionInitial.join(', ')}, si tienes los elementos completos para generar el sistema en el JSON de la respuesta en el parametro isComplete devuelve un true, en caso contrario regresa un false y 
                en el parametro response_to_user agrega una descirpcion detallada de lo que te falta para completar la generación de dicho JSON. 

                A continuacion te muestro una descriocion de cada  parametro del JSON.

                name: Es el nombre del proyecto (string)
                description: Una breve descripcion del proyecto (string)
                api_path: la url base del path de la API (string) por defecto /api/
                system_user: nombre del primer  administrador por defecto del sistema (string) por defecto admin
                password: contraseña del primer adinistrador por defecto del sistema (string) por defecto 1234567890
                database: Un objeto JSON que describe a detalle las coleccione sy campos para mongodb -> Note: dont return this parameter until you have all the information about the datablase, and isComplete parameter is in true
                -- <collection name > :  el nombre de la coleccion 
                ----- operation: define que se activaran todas las operaciones siempre tiene que ser  objeto(  { "all": true } )
                ----- definition: detalle de los campos de la base de datos (objeto)
                --------- <field name> : nombre del campo
                -------------- type: es obligatorio puede ser cualquiera de los siguientes elementos  string,boolean,number,oid,any,date,array_oid   (string) | Nota: oid y array_oid, representa la relacion  con otras colecciones, siempre va acompañado del elemento rel < nobre del modelo relacionado >|
                -------------- mandatory: si es obliagtorio o no (boolean)
                -------------- default: si incluye un valor por defecto (any)
                -------------- rel: Relacion con coleccion externa (string)
                ----- datatable_search_fields : campos sobre los cuales puede buscar  (array of strings)
                isComplete: si el JSON esta copleto para desarrollar el sistema (boolean)
                response_to_user: que detalles se requieren para completar el JSON, mensaje en ingles hacia el usuario, el usuario es una persona que no tiene conocimeinto de bases de datos o temas tecnicos, la respuesta debe ser simple y amigalble para solicitar mas informacion (String)

                unicamente devuelve el JSON, simple y minificado sin mas texto solo el puro JSON 

                `
            },
        ])


        let response = JSON.parse(answer.data)
        //console.log('ELANSWER', response)

        if (response.isComplete) {
            askAgain = false
            JSON_f = response
            log(lm_(response.response_to_user))
        } else {
            askAgain = true
            log(lm_('Need more information, be detailed please.'))
            log(lm_('*******************************************'))
            log(lm_(response.response_to_user))
            descriptionInitial.push(prompt(lq_('tell me .... ')));
        }



    } while (askAgain)

    let fordername = v.camelCase(JSON_f.name)
    const path_x = await makeDir(fordername + '/');
    fs.writeFileSync(path_x + '/definition.json', JSON.stringify(JSON_f.database, null, '\t'));
    fs.writeFileSync(path_x + '/full.json', JSON.stringify(JSON_f, null, '\t'));

    log('\t')
    log('\t')
    log(lm_(`${name}  lets gona construct the API`))

    log(lm_('Installing big head .... '))
    exec("npm i -g big-head", { cwd: path_x + '/' }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);



        setTimeout(async function () {
            log(lm_('Creating the server API REST  .... '))
            exec(`bighead service  -d "${path.join(__dirname, fordername, 'definition.json')}"   `, { cwd: path_x + '/' }, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);

                log(lm_('Starting server API REST  .... '))
                exec(`npm start  `, { cwd: path_x + '/apied_piper_server' }, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);

                });



                setTimeout(async function () {
                    log(lm_('Creating the admin panel  .... '))
                    exec(`bighead console  -d "${path.join(__dirname, fordername, 'definition.json')}"   `, { cwd: path_x + '/' }, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);

                        log(lm_('Godbye .... '))

                        log('\t')
                        log('\t')
                        log(lm_(`${name}  Si deseas conocer informacion de como esta constituido el proyecto visita https://www.npmjs.com/package/big-head y https://www.npmjs.com/package/apied-piper `))

                    });

                }, 2000)




            });
        }, 5000)


    });



}

main()