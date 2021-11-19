const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// pour mettre a l'échelle les éléments du jeu notamment les tétrominos
context.scale(20, 20);


// prog d'une pièce : 0 transparent, 1 c'est un bloc affiché
const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

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

//surface de jeu de 12 block de large et 20 block de haut
const arena = createMatrix(12, 20);

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
                context.fillStyle = 'red';
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
        player.pos.y = 0;
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


// pour gérer la position du tétromino sur la grille
const player = {
    pos: {x: 5, y: 5},
    matrix: matrix,
}

// controles clavier
document.addEventListener('keydown', event => {
    if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowRight"){
        playerMove(1);
    } else if (event.key === "ArrowDown"){
        playerDrop();
    }
})

update();