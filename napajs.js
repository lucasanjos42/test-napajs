const napa = require("napajs");

// Mude esse valor para controler o número de napa workers inicializados
const NUMBER_OF_WORKERS = 4;

// Cria um napa zone com number_of_workers de napa workers
const zone = napa.zone.create('zone', { workers: NUMBER_OF_WORKERS });

/*
A sequência de Fibonacci começa com 0 e 1,
que vamos considerar sendo o  0º e o 1º números do Fibonacci,
e cada numero que se sucede é a soma dos dois números que precede os números Fibonacci.
Então, o segundo número é 0 + 1 = 1.
E para descobrir o terceiro número do Fibonacci, nós somamos o primeiro (1) e o segundo (1) para conseguir 2.
E o quarto é a soma do segundo (1) e do terceiro (2), que é 3.
E assim por diante.
Num:              |   0   1   2   3   4   5   6   7   8   9   10  11  ...
-------------------------------------------------------------------------
Num Fibonacci:    |   0   1   1   2   3   5   8   13  21  34  55  89  ...
*/

// why this could be useful?

function fibonacci(n) {
    if (n <= 1) {
        return n;
    }

    const p1 = zone.execute("", "fibonacci", [n - 1]);
    const p2 = zone.execute("", "fibonacci", [n - 2]);

    // Retornando promise para evitar bloquear cada worker
    return Promise.all([p1, p2]).then(([result1, result2]) => {
        return result1.value + result2.value;
    });
}

function run(n) {
    const start = Date.now();

    return zone.execute('', "fibonacci", [n])
        .then(result => {
            printResult(n, result.value, Date.now() - start);
            return result.value;
        });
}

function printResult(nth, fibonacci, ms) {
    console.log('\t' + nth +
        '\t' + fibonacci +
        '\t\t' + NUMBER_OF_WORKERS +
        '\t\t' + ms);
}

console.log();
console.log('\tNum\tFibonacci\t# de workers\tLatência em MS');
console.log('\t------------------------------------------------------');

// Broadcast para os napa workers a declaração de 'napa' e 'zone'
zone.broadcast(' \
    var napa = require("napajs"); \
    var zone = napa.zone.get("zone"); \
');

// Broadcast para os napa workers a declaração da função 'fibonacci'
zone.broadcast(fibonacci.toString());

// Run fibonacci em sequencia
run(0)
    .then(result => run(1))
    .then(result => run(2))
    .then(result => run(3))
    .then(result => run(4))
    .then(result => run(5))
    .then(result => run(6))
    .then(result => run(7))
    .then(result => run(8))
    .then(result => run(9))
    .then(result => run(10))
