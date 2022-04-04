const fs = require('fs');
require('events').EventEmitter.defaultMaxListeners = 0;

const readFile = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data.json', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve([]);
                }
            }
        });
    });
}

const writeFile = async (data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile('./data.json', JSON.stringify(data), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const getFromBuffer = async (buffer) => {
    return new Promise((resolve, reject) => {
        process.stdin.on('data', (data) => {
            resolve(data.toString().trim());
        });
    });
}

const logger = (item) => {
    console.log('Chave: ', item.key, 'Nome: ', item.name);
    console.log('----------------------------------------');
}

(async () => {
    let addNew = 'y';
    let data   = [];

    while( addNew === 'y' ){
        console.clear();

        data = await readFile();
        
        if( !data.length ){
            console.log('Ainda não existem registros');
        } else {
            console.log('Registros existentes:');
            data.forEach(logger);
        }

        console.log('Digite o nome do novo registro:');
        const name = await getFromBuffer();

        console.log('Digite a chave do novo registro:');
        const key = await getFromBuffer();

        if( data.find(item => item.key === key) ){
            console.log('Chave já existente');
        } else {
            data.push({
                key,
                name
            });
    
            data.sort((a, b) => {
                return a.key - b.key;
            });

            await writeFile(data);
        }

        console.log('Deseja adicionar outro registro? (y/n)');
        addNew = await getFromBuffer();
    }

    console.log('Registros existentes:');
    data.forEach(logger);
    process.exit();
})();