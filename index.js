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

const hashSearch = async (haystack) => {
    const needle = await getFromBuffer();
    console.time('hashSearch');
    const index = haystack.findIndex(item => item.key == needle);

    console.log( index == -1 ? 'Not found' : `Found at index ${index}`);
    console.timeEnd('hashSearch');
}

const sequencialSearch = async (haystack) => {
    const needle = await getFromBuffer();
    console.time('sequencialSearch');
    let index = 0;
    while (index < haystack.length) {
        if (haystack[index].key == needle) {
            console.log(`Found at index ${index}`);
            console.timeEnd('sequencialSearch');
            return;
        }
        ++index;
    }
    console.timeEnd('sequencialSearch');
    console.log('Not found');
}

const binarySearch = async (haystack) => {
    const needle = await getFromBuffer();
    console.time('binarySearch');
    let low = 0;
    let high = haystack.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (haystack[mid].key == needle) {
            console.log(`Found at index ${mid}`);
            console.timeEnd('binarySearch');
            return;
        } else if (haystack[mid].key < needle) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log('Not found');
    console.timeEnd('binarySearch');
}

const logger = (item) => {
    console.log('Chave: ', item.key, 'Nome: ', item.name);
    console.log('----------------------------------------');
}

const pause = async () => {
    console.log('Press any key to continue...');
    return new Promise((resolve, reject) => {
        process.stdin.on('data', (data) => {
            resolve();
        });
    });
}

const mainMenu = async () => {
    const data = await readFile();
    console.clear();

    if( !data.length ){
        console.log('Ainda não existem registros');
    } else {
        console.log('Registros existentes:');
        data.forEach(logger);
    }

    console.log('1 - Inserir novo registro');
    console.log('2 - Buscar registro por chave (hash)');
    console.log('3 - Buscar registro por chave (sequencial)');
    console.log('4 - Buscar registro por chave (binário)');
    console.log('5 - Popular arquivo');
    console.log('6 - Sair');

    const option = await getFromBuffer();
    switch (option) {
        case '1':
            console.log('Digite o nome do novo registro:');
            const name = await getFromBuffer();

            console.log('Digite a chave do novo registro:');
            const key = await getFromBuffer();
            
            data.push({
                key: key,
                name: name
            });

            data.sort((a, b) => {
                return a.key - b.key;
            });

            await writeFile(data);
            break;
        case '2':
            console.log('Digite a chave do registro que deseja buscar:');
            await hashSearch(data);
            await pause();
            break;
        case '3':
            console.log('Digite a chave do registro que deseja buscar:');
            await sequencialSearch(data);
            await pause();
            break;
        case '4':
            console.log('Digite a chave do registro que deseja buscar:');
            await binarySearch(data);
            await pause();
            break;
        case '5':
            for( let i = 0; i < 1000000; i++ ){
                data.push({
                    key: i,
                    name: `Nome ${i}`
                });
            }
            
            await writeFile(data);
            break;
        case '6':
            process.exit();
        default:
            console.log('Opção inválida');
            break;
    }
    await mainMenu();
}

(async () => {
    await mainMenu();
})();