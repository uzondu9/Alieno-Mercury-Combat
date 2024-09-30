const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.style.backgroundImage = 'url(images/Mecury.jpg)';
canvas.style.backgroundRepeat = 'no-repeat';
canvas.style.backgroundSize = 'cover';
canvas.width = 900;
canvas.height = 600;

//global variables
let cellSize = 100;
let cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

let winningScore;
let freeze = false;
let numOfResoures = 250;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let kills = 0;
let chosenDefender = 1;


//interface
function displayMenu(id) {
    let menu = document.getElementsByClassName('menu')[0];
    menu.style.display = 'flex';
    canvas.style.opacity = '0.4';
    freeze = true;
}

let enter = document.getElementById('enter');
function e() {
    enter.addEventListener('click', (e) => {
        let input = document.getElementById('targetScore');
        winningScore = input.value;
        let menu = document.getElementsByClassName('menu')[0];
        menu.style.display = 'none';
        canvas.style.opacity = '1';
        freeze = false;
    });
    
}
function reload(id) {
    window.location.reload();
}
setTimeout(displayMenu, 100);
setTimeout(e, 100)


// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false,
}
canvas.addEventListener('mousedown', function (e) {
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function () {
   mouse.clicked = false;
})


let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function () {
    mouse.x = undefined;
    mouse.y = undefined;
})

// game board
const controlBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

//projectile
const bullet = new Image();
bullet.src = 'images/bulletB.png';
class Projectiles {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 45;
        this.height = 45;
        this.power = 10;
        this.speed = 5;
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.minFrame = 0;
        this.maxFrame = 36;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.drawImage(bullet, this.frameX * this.spriteWidth, 0, this.spriteWidth,
            this.spriteHeight, this.x, this.y, this.width, this.height);   
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        if(chosenDefender === 2){
            projectiles[i].power = 15;
        }

        if(chosenDefender === 3){
            projectiles[i].power = 25;
        }

        for (let j = 0; j < projectiles.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }

    }
}


//defenders
const defTypes = [];
const def1 = new Image();
def1.src = 'images/defender1.png';
defTypes.push(def1);
const def2 = new Image();
def2.src = 'images/defender2.png';
defTypes.push(def2);
const def3 = new Image();
def3.src = 'images/Ship5.png';
defTypes.push(def3);

class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 50;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 128;
        this.spriteHeight = 128
        this.minFrame = 0;
        this.maxFrame = 36;
        this.chosenDefender = chosenDefender;
    }
    draw() {
        ctx.font = '30px Monospace';
        ctx.fillStyle = 'white';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 25);
        if (this.chosenDefender === 1){
            ctx.drawImage(def1, this.frameX * this.spriteWidth, 0, this.spriteWidth,
                this.spriteHeight, this.x, this.y, this.width, this.height);   
        }
        if (this.chosenDefender === 2){
            ctx.drawImage(def2, this.frameX * this.spriteWidth, 0, this.spriteWidth,
                this.spriteHeight, this.x, this.y, this.width, this.height);   
        }
        if (this.chosenDefender === 3){
            ctx.drawImage(def3, this.frameX * this.spriteWidth, 0, this.spriteWidth,
                this.spriteHeight, this.x, this.y, this.width, this.height);   
        }

    }
    update() {
        if (this.chosenDefender === 1){
            if (frame % 12 === 0) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = this.minFrame;
                if (this.frameX % 15 === 0) this.shootNow = true;
            }
            if (this.shooting) {
                this.minFrame = 15;
                this.maxFrame = 23;
            } else {
                this.minFrame = 1;
                this.maxFrame = 14;
            }   
        }else if(this.chosenDefender === 2){
            if (frame % 12 === 0) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = this.minFrame;
                if (this.frameX % 10 === 0) this.shootNow = true;
            }
            if (this.shooting) {
                this.minFrame = 10;
                this.maxFrame = 17;
            } else {
                this.minFrame = 1;
                this.maxFrame = 9;
            }   
        }
       if(this.chosenDefender === 3){
           this.health = 100;
            if (frame % 50 === 0) this.shootNow = true; 
        }

        if (this.shooting && this.shootNow) {
            const gunShot = new Audio();
            gunShot.src = 'images/gunAudio.mp3';
            gunShot.play();
            if(gunShot.isPaused){
                gunShot.play();
            }
            projectiles.push(new Projectiles(this.x + 70, this.y + 40));
            this.shootNow = false;
        }
    }
}

function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        }
        else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
        if (freeze) {
            defenders.splice(i, defenders.length);
            numOfResoures = 250;
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85,
}
const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85,
}
const card3 = {
    x: 170,
    y: 10,
    width: 70,
    height: 85,
}



function chooseDef() {
    let card1stroke = 'black';
    let card2stroke = 'black';
    let card3stroke = 'black';

    if (collision(mouse, card1) && mouse.clicked) {
        chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked) {
        chosenDefender = 2;
    } else if (collision(mouse, card3) && mouse.clicked) {
        chosenDefender = 3;
    }

    if (chosenDefender === 1) {
        card1stroke = 'teal';
        card2stroke = 'black';
        card3stroke = 'black';

    } else if (chosenDefender === 2) {
        card1stroke = 'black';
        card2stroke = 'teal';
        card3stroke = 'black';

    } else if (chosenDefender === 3) {
        card1stroke = 'black';
        card2stroke = 'black';
        card3stroke = 'teal';

    } else {
        card1stroke = 'black';
        card2stroke = 'black';
        card3stroke = 'black';
    }

    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0, 0, 0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(def1, 0, 0, 128, 128, 10, 5, 128 / 2, 128 / 2);
    ctx.font = '15px cursive';
    ctx.fillStyle = 'green';
    ctx.fillText('50', 40, 30);
    
    ctx.fillStyle = 'rgba(0, 0, 0,0.2)';
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(def2, 0, 0, 128, 128, 90, 5, 128 / 2, 128 / 2);
    ctx.fillStyle = 'green';
    ctx.fillText('75', 120, 30);
    ctx.font = '15px cursive';

    ctx.fillStyle = 'rgba(0, 0, 0,0.2)';
    ctx.fillRect(card3.x, card3.y, card3.width, card3.height);
    ctx.strokeStyle = card3stroke;
    ctx.strokeRect(card3.x, card3.y, card3.width, card3.height);
    ctx.drawImage(def3, 0, 0, 128, 128, 170, 20, 128 / 2, 128 / 2);
    ctx.fillStyle = 'green';
    ctx.fillText('100', 200, 30);
    ctx.font = '15px cursive';
} 

//floating Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.05) this.opacity -= 0.05;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px monospace';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

function handlefloatingMessages() {
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'images/enemy1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'images/enemy2.png';
enemyTypes.push(enemy2);
const boss = new Image();
boss.src = 'images/UFO.png';
enemyTypes.push(boss);

class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.6 + 0.2;
        this.movement = this.speed;
        this.health = 50;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        if(this.enemyType === enemy1){
            this.health = 50;
            this.maxHealth = this.health;
            this.speed = Math.random() * 0.8 + 0.2;
        } else if(this.enemyType === enemy2){
            this.health = 75;
            this.maxHealth = this.health;
            this.speed = Math.random() * 0.6 + 0.2;
        }else if(this.enemyType === boss){
           this.health = 100;
           this.maxHealth = this.health;
           this.speed = Math.random() * 0.4 + 0.1;
        }
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 4;
        this.spriteWidth = 256;
        this.spriteHeight = 256;
    }
    update() {
        this.x -= this.movement;
        if (this.enemyType === enemy1){
            if (frame % 10 === 0) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = this.minFrame;
            }
        }
        if (this.enemyType === enemy2){
            if (frame % 8 === 0) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = this.minFrame;
            }
        }
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.font = '30px Monospace';
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y,
            this.width, this.height);
        if(this.enemyType === enemy2 || this.enemyType === boss){
            ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 5);
        }
        if (this.enemyType === enemy1){
                ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        }
    }
}
function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResourses = enemies[i].maxHealth / 5;
            floatingMessages.push(new floatingMessage('+' + gainedResourses, enemies[i].x,
                enemies[i].y, 30, 'green'));
            floatingMessages.push(new floatingMessage('+' + gainedResourses,
                250, 50, 30, 'green'));
            numOfResoures += gainedResourses;
            kills += Math.floor(gainedResourses / 10);
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
        if (freeze) {
            enemies.splice(i, enemies.length);
        }
    }
    if (frame % enemiesInterval === 0 && kills <= winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 200 ) enemiesInterval -= 25;
    }
}

//resources
const amounts = [5, 15, 20];
const resource = new Image();
resource.src = 'images/Resource.png'
class Resource {
    constructor() {
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.frameX = 0;
        this.frameX = 0;
        this.spriteWidth = 200;
        this.spriteHeight = 200;

    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.font = '20px Monospace';
        ctx.fillText(this.amount, this.x + 10, this.y - 5);
        ctx.drawImage(resource, this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y,
            this.width, this.height);
    }
}

function handleResources() {
    if (frame % 500 === 0 && kills < winningScore) {
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numOfResoures += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'green'));
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 250, 50, 30, 'blue'));
            resources.splice(i, 1);
            i--;
        }
        if (freeze) {
            resources.splice(i, resources.length);
        }
    }
}

//utilities
function handleGameStatus() {
    let enemyStrength = winningScore - kills;
    if (enemyStrength <= 0) {
        enemyStrength = 'Diminished!';
    }
    ctx.font = '20px Ariel';
    ctx.fillStyle = 'blue';
    ctx.fillText('Kills: ' + kills, 280, 60);
    ctx.fillStyle = 'brown';
    ctx.fillText(`Enemy Strength:  ${enemyStrength}`, 380, 60);
    ctx.fillStyle = 'indigo';
    ctx.fillText('Resources: ' + numOfResoures, 580, 60);
    if (gameOver) {
        let gameOverWidget = document.getElementsByClassName('gameOver')[0];
        let targetValue = document.getElementById('target');
        gameOverWidget.style.display = 'block';
        numOfKills.innerText = 'Number of Kills: ' + kills;
        targetValue.innerText = 'Target Kills: ' + winningScore;
        targetValue.style.color = 'red';
        canvas.style.opacity = '0.4';
    }
    if (winningScore == 0 || winningScore == NaN || winningScore == 'null' || winningScore == undefined) {
        winningScore = 10;
    }

    if (kills >= winningScore && (enemies.length === 0)) {
        let gameOverWidgetH2 = document.getElementById('caption');
        let gameOverWidget = document.getElementsByClassName('gameOver')[0];
        let numOfKills = document.getElementById('numOfKills');
        let targetValue = document.getElementById('target');
        gameOverWidget.style.display = 'block';
        gameOverWidgetH2.innerText = 'You Win';
        numOfKills.innerText = 'Number of Kills: ' + kills;
        targetValue.innerText = 'Target Kills: ' + winningScore;
        targetValue.style.color = 'black';
        canvas.style.opacity = '0.4';
        gameOver = true;
    }
}

canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
            return;
        }
    }
    
    if (chosenDefender === 1){
        defCost = 50;
    }
    if (chosenDefender === 2){
        defCost = 75;
    }
    if (chosenDefender === 3){
        defCost = 100;
    }

    if (numOfResoures >= defCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numOfResoures -= defCost;
    } else {
        floatingMessages.push(new floatingMessage('insufficient resources', mouse.x, mouse.y, 20, 'red'));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'silver';
    ctx.fillRect(0, 0, controlBar.width, controlBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDef();
    handleGameStatus();
    handlefloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)

    ) {
        return true;
    };
}


//responsive
window.addEventListener('resize', () => {
    canvasPosition = canvas.getBoundingClientRect();
})
