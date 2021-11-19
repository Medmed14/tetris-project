const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// pour mettre a l'échelle les éléments du jeu notamment les tétrominos
context.scale(20, 20);

function arenaSweep() {
    let rowCount = 1;
   outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


// fonction de detection de collision
function collide(arena, player)  {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                     return true;
                 } 
        }
    }
    return false;
}


// fonction de création la matrice de jeu
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// fonction de création de pièces (tétrominos) 
// 0 transparet, 1,2,3... c'est un bloc coloré, le chiffre définit la couleur
function createPiece(type) {
    if (type === "T") {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === "O") {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

const colors = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'cyan',
    'lime',
    'red',
]

//surface de jeu de 12 block de large et 20 block de haut
const arena = createMatrix(10, 20);

//design du tetromino
function draw() {
    context.fillStyle = "#000"; // définit la couleur de remplissage du rectangle
    context.fillRect(0, 0, canvas.clientWidth, canvas.height); // dessine le rectangle à la position 0, 0 d'une largeur de celle du canvas et d'une hauteur de 50celle du canvas
    
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                y + offset.y,
                                1, 1);
            }
        });
    });
}

// fonction de fusion, elle va copier toutes les valeurs de player, dans notre arène, à la bonne position.
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


// paramétrage appui touche "bas" et drop
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

//fonction qui empeche les tetrominos de sortir des bords (gauche/droit) de la matrice de jeu
function playerMove(dir){
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// pour que la pièce descende a chaque seconde (1000ms)
let dropCounter = 0;
let dropInterval = 1000;

// fonction d'update continuelle
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    // la pièce descend à chaque seconde avec l'incrémentation de y
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        player.pos.y++;
        dropCounter = 0;
    }
   
    draw();
    requestAnimationFrame(update);
}

// SCORE
function updateScore() {
    document.getElementById('score').innerText = player.score;
}


// fonction de ccréation de tétrominos aléatoire
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// fonction de rotation des tétrominos
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]

            ] = [
                matrix[y][x],
                matrix[x][y]

            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


// pour gérer les différents items de la grille de jeu
const player = {
    pos: {x: 5, y: 5},
    matrix: null,
    score: 0,
}

// controles clavier
document.addEventListener('keydown', event => {
    if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowRight") {
        playerMove(1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.key === "a" || event.key === "A") {
        playerRotate(1);
    } else if (event.key === "z" || event.key === "Z") {
        playerRotate(-1);
    }
})

playerReset();
updateScore();
update();