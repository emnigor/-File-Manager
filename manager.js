
import fs from "node:fs";
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'url';
import { createHash } from "node:crypto";
import zlib from 'node:zlib';
import {pipeline} from 'node:stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const [command, arg, ...res] = process.argv.slice(2);

switch (command) {
    case 'cat':
        cat(arg);
        break;
    case 'add':
        add(arg)
        break;
    case 'rn':
        rn(arg, res[0])
        break;
    case 'cp':
        cp(arg, res[0])
        break;
    case 'mv':
        mv(arg, res[0])
        break;
    case 'rm':
        rm(arg)
        break;
    case 'hash':
        hash(arg)
        break;
    case 'compress':
        compress(arg, res[0])
        break;
    case 'decompress':
        decompress(arg, res[0])
        break;
    case 'os':
        switch (`${arg}`){
            case '--EOL':
                eol();
                break
            case '--cpus':
                cpus();
                break
            case '--homedir':
                homedir();
                break
            case '--username':
                username();
                break
            case '--architecture':
                arch();
                break
            default: console.log('Неизвестная команда');
        }
        break;
    default: console.log('Неизвестная команда');
 }

 function cat(arg) {
    const stream = fs.createReadStream(path.join(__dirname, `${arg}`), 'utf-8');
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => console.log(data));
    stream.on('error', error => console.log('Error', error.message));
 }

 function add (arg){
    fs.readdir(path.join(__dirname), (err,files)=> { 
        if (err) throw err;  
        if (files.includes(arg)) try {
            throw new Error('FS operation failed')
           }
          catch (e) {
           console.log(e.name + ': ' + e.message);
         } else {
            fs.writeFile(path.join(__dirname, `${arg}`), '', 'utf8', (err) => {
                if (err) throw err;
              });    
        }
    })
  };

  function rn (arg, res) {
    fs.rename(path.join(__dirname, `${arg}`), path.join(__dirname, `${res}`), err=> {if (err) throw err})
  }

  function cp (file, dir) {
    const stream = fs.createReadStream(path.join(__dirname, `${file}`), 'utf-8');
    const output = fs.createWriteStream(path.join(__dirname, `${dir}`,`${file}`));
    stream.on('data', chunk => output.write(chunk));;
    stream.on('error', error => console.log('Error', error.message));
  }

  function mv (file, dir) {
    const stream = fs.createReadStream(path.join(__dirname, `${file}`), 'utf-8');
    const output = fs.createWriteStream(path.join(__dirname, `${dir}`,`${file}`));
    stream.on('data', chunk => output.write(chunk));
    stream.on('end', () => fs.rm(path.join(__dirname, `${file}`), (err) => {
        if (err) throw err;
      }));
    stream.on('error', error => console.log('Error', error.message));
  }

  function rm (file) {
    fs.rm(path.join(__dirname, `${file}`),{recursive:true}, (err) => {
        if (err) throw err;
      })
    }
  
    function eol () {
     console.log(os.EOL)
        }

    function cpus () {
        let numberCPU = os.cpus().length;

        console.log('number CPU:',numberCPU);
        os.cpus().forEach((value)=>{
            console.log(value.model)
        })
        }

    function homedir () {
     console.log(os.homedir())
        }
        
    function username() {
     console.log(os.hostname())
        }   

    function arch() {
     console.log(os.arch())
        } 

    function hash(arg){
        fs.readFile(path.join(__dirname, `${arg}`), (err, data) => {
            if (err) throw err;
          const hash = createHash("sha256").update(data).digest("hex");
          console.log(hash);
        });
    }

    function compress(file, destination='') {
        const readStream = fs.createReadStream(path.join(__dirname, `${file}`), 'utf-8');
        const writeStream = fs.createWriteStream(path.join(__dirname, `${destination}`, `${file}.br`));
        const brotli = zlib.createBrotliCompress();
        //const stream = readStream.pipe(brotli).pipe(writeStream);
        pipeline(
            readStream,
            brotli,
            writeStream,
            err => {
                if (err) throw err;
            }
        );
    }


    function decompress (file, destination='') {
        const readStream = fs.createReadStream(path.join(__dirname, `${file}`));
        const writeStream = fs.createWriteStream(path.join(__dirname, `${destination}`, `${file.substr(0, file.length-3)}`));
        const brotli = zlib.createBrotliDecompress();
        pipeline(
            readStream,
            brotli,
            writeStream,
            err => {
                if (err) throw err;
            }
        );
    }
