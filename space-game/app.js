function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

let stars = [];

function initStars(starCount = 200) {
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1
        });
    }
}

function drawStarBackground(ctx, canvas) {
    ctx.fillStyle = '#2a003d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 적군 생성 (WAVE 1)
function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}


function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

// 점수 표시 함수
function drawPoints(ctx, canvas) {
    ctx.font = "bold 30px Arial"; 
    ctx.fillStyle = "red";
    ctx.textAlign = "left"; 

    ctx.fillText(`SCORE: ${score}`, 10, canvas.height - 10); 
}

// 생명 및 실드 상태 표시 함수
function drawLife(ctx, canvas) {
    const iconWidth = 30;
    const iconHeight = 30;
    const padding = 10;
    const startX = 20; 
    
    const startY = canvas.height - 40; 

    // 1. Life 아이콘 그리기
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(
            lifeImg, 
            startX + i * (iconWidth + padding),
            690,
            iconWidth, 
            iconHeight
        );
    }
    
    // 2. Shield 아이콘 그리기
    if (hasShield) {
        // Life 아이콘 다음 위치에 실드 아이콘 배치
        const shieldX = startX + lives * (iconWidth + padding) + 10;
        ctx.drawImage(
            shieldImg,
            shieldX,
            690,
            iconWidth,
            iconHeight
        );
        
        ctx.font = "bold 15px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "left"; 
        ctx.fillText("SHIELD", shieldX, startY - 5);
    }
}

function initGame() {
    gameObjects = [];
    score = 0; 
    lives = 3; 
    hasShield = true; // ★ [수정] 실드 장착 상태로 시작
    gameLive = true; 
    gamePhase = GamePhase.WAVE_1; 

    createEnemies();
    createHero();
    
    // 키 입력 리스너
    eventEmitter.on(Messages.KEY_EVENT_UP, () => { if (gameLive) hero.y -= 5; });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => { if (gameLive) hero.y += 5; });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => { if (gameLive) hero.x -= 5; });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => { if (gameLive) hero.x += 5; });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (gameLive && hero.canFire()) hero.fire(); 
    });

    // --- 충돌 처리 함수 ---
    
    // 히어로가 적군 데미지 처리 로직
    const handleHeroDamage = (objectToExplode) => {
        if (!gameLive) return; 
        
        if (hasShield) {
            hasShield = false; // 실드가 있으면 실드만 소멸
        } else {
            // 실드가 없으면 생명 감소 및 폭발
            gameObjects.push(new Explosion(hero.x, hero.y, hero.width, hero.height)); 
            lives--; 
            
            if (lives <= 0) {
                 hero.dead = true; 
            } else {
                 // 충돌 후 잠시 위치 초기화
                 hero.x = canvas.width / 2 - hero.width / 2;
                 hero.y = canvas.height - canvas.height / 4;
            }
        }
        
        // 충돌한 오브젝트 제거 (일반 적군만 해당)
        if (objectToExplode && objectToExplode.type === 'Enemy') {
             objectToExplode.dead = true; 
        }
    };
    
    // 충돌 처리: 일반 적군 + 레이저
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;   
        second.dead = true;  
        gameObjects.push(new Explosion(second.x, second.y, second.width, second.height)); 
        score += 100; 
    });
    
    // 충돌 처리: 일반 적군 + 히어로 (적군 제거 후 데미지 처리)
    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        handleHeroDamage(enemy);
    });
}

// --------------------------------
// 클래스들
// --------------------------------
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;

    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        if (this.img) {
             ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}
class Meteor extends GameObject { // ★ GameObject 상속
    constructor(x, y) {
        super(x, y); // x, y, dead, type 초기화
        this.width = 80; // 크기 조정
        this.height = 80;
        this.type = "Meteor";
        this.speed = 8;
        this.img = meteorImg; // 이미지 사용 (draw에서 처리됨)
    }

    update() { // update 메서드는 그대로 유지
        this.y -= this.speed; // 위로 이동
        if (this.y + this.height < 0) {
            this.dead = true;
        }
    }
    
    // draw 메서드는 GameObject의 draw(ctx.drawImage(this.img, ...))를 사용
}



class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";

        let id = setInterval(() => {
            if (gameLive) {
                if (this.y < canvas.height - this.height) {
                    this.y += 5;
                } else {
                    clearInterval(id);
                }
            } else {
                 clearInterval(id); 
            }
        }, 300);
        this.id = id; 
    }
}


let heroLeftImg, heroRightImg;

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.cooldown = 0;

        let auxFireId = setInterval(() => {
            if (gameLive) { 
                 this.fireAuxiliary();
            } else {
                 clearInterval(auxFireId);
            }
        }, 500); 
        this.auxFireId = auxFireId;
    }

    draw(ctx) {
        // 중앙 플레이어
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

        // 왼쪽 보조
        const auxWidth = this.width * 0.5;
        const auxHeight = this.height * 0.5;
        ctx.drawImage(heroLeftImg, this.x - auxWidth - 10, this.y + 20, auxWidth, auxHeight);

        // 오른쪽 보조
        ctx.drawImage(heroRightImg, this.x + this.width + 10, this.y + 20, auxWidth, auxHeight);
        
        // 실드 상태일 때 실드 이미지 효과를 그림
        if (hasShield) {
            ctx.save();
            const shieldSize = this.width * 1.5; 
            ctx.globalAlpha = 0.5; // 반투명하게
            ctx.drawImage(
                shieldImg,
                this.x - (shieldSize - this.width) / 2, 
                this.y - (shieldSize - this.height) / 2,
                shieldSize,
                shieldSize
            );
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 500;

            let id = setInterval(() => {
                if (!gameLive || this.cooldown <= 0) {
                    clearInterval(id);
                } else {
                    this.cooldown -= 100;
                }
            }, 100);
        }
    }

    fireAuxiliary() {
        const auxWidth = this.width * 0.5;
        gameObjects.push(new Laser(this.x - auxWidth - 10 + auxWidth/2, this.y + 20));
        gameObjects.push(new Laser(this.x + this.width + 10 + auxWidth/2, this.y + 20));
    }

    canFire() {
        return this.cooldown === 0;
    }
}


// 히어로 레이저
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg; 

        let id = setInterval(() => {
            if (!gameLive || this.y <= 0) { 
                this.dead = true;
                clearInterval(id);
            } else {
                this.y -= 15; // 위로 이동
            }
        }, 100);
    }
}


class Explosion extends GameObject {
    constructor(x, y, width = 98, height = 50) { 
        super(x, y);
        this.width = width; 
        this.height = height; 
        this.type = 'Explosion';
        this.img = explosionImg; 

        setTimeout(() => {
            this.dead = true;
        }, 500); // 0.5초 후 제거
    }
}


class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) {
            [...this.listeners[message]].forEach((l) => l(message, payload));
        }
    }
    
    clear() {
        this.listeners = {};
    }
}
//DURL
function fireMeteor() {
    // Meteor 클래스의 인스턴스 생성
    const meteor = new Meteor(
        hero.x + hero.width / 2 - 40, // 중앙 위치 계산 (Meteor 크기 80 기준)
        hero.y - 80 
    );
    gameObjects.push(meteor);
}



function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function updateGameObjects() {
    if (!gameLive) return;

    // ---- 오브젝트 분류 ----
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const lasers = gameObjects.filter(go => go.type === "Laser");
    const meteors = gameObjects.filter(go => go.type === "Meteor");   // ★ 메테오
    const heroRect = hero.rectFromGameObject();


    // ============================================
    // [STEP 2] 히어로 레이저 → 적군 충돌 처리
    // ============================================
    lasers.forEach(l => {
        // 일반 적군 충돌
        if (gamePhase === GamePhase.WAVE_1) {
            enemies.forEach(m => {
                if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                    eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, { first: l, second: m });
                }
            });
        }

    });


    // ============================================
    // ★ [STEP 2.5] 메테오 충돌 처리 (광역기)
    // ============================================
    meteors.forEach(meteor => {
        // 오브젝트 업데이트 메서드 호출 (움직임 처리)
        if (meteor.update) { 
            meteor.update();
        }
    });
        meteors.forEach(meteor => {
        enemies.forEach((enemy, idx) => {
            if (intersectRect(meteor.rectFromGameObject(), enemy.rectFromGameObject())) {

                // 메테오 충돌 → 중심 + 양쪽 3마리 = 총 7마리 제거
                const start = Math.max(0, idx - 3);
                const end = Math.min(enemies.length - 1, idx + 3);

                for (let i = start; i <= end; i++) {
                    // 폭발 효과 추가 (옵션)
                    gameObjects.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height));
                    enemies[i].dead = true;
                }

                meteor.dead = true; // 메테오 제거
            }
        });
    });


    // ============================================
    // [STEP 4] 히어로 → 적군 몸체 충돌 처리
    // ============================================
    // 일반 적군
    enemies.forEach(enemy => {
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    // ============================================
    // [마지막] 죽은 오브젝트 정리
    // ============================================
    gameObjects = gameObjects.filter(go => !go.dead);
}



// 메시지 표시 함수
function displayMessage(message, color = 'red') {
    // 배경을 검정색으로 덮기
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";   // 약간 투명한 검정 (0.8)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 텍스트 스타일
    ctx.font = "bold 25px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 가운데 정렬 메시지 출력
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// 게임 오버 체크 함수
function checkGameOver() {
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const livingEnemies = enemies.length > 0;

    // --------------------------
    // ★ 승리 조건 추가 !!!
    // --------------------------
    if (gameLive && !livingEnemies) {
        gameLive = false;

        setTimeout(() => {
            displayMessage(
                "Victory!!! Pew Pew - Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        }, 200);

        return;
    }

    // 기존 패배 처리
    if (gameLive && (lives <= 0)) {
        gameLive = false;

        setTimeout(() => {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }, 200);

        return;
    }

    // 게임이 이미 종료된 상태 — 메시지 유지
    if (!gameLive) {
        if (lives <= 0) {
            displayMessage("You died !!! Press [Enter] to start a new game Captain Pew Pew");
        } else {
            displayMessage("Victory!!! Pew Pew - Press [Enter] to start a new game Captain Pew Pew", "green");
        }
    }
}



// --------------------------------
// 메시지 상수 및 게임 단계
// --------------------------------
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO", 
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",           
};

const GamePhase = {
    WAVE_1: 'WAVE_1'
};

let heroImg, enemyImg, laserImg, lifeImg, shieldImg; 
let canvas, ctx;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

let score = 0;
let lives = 3;
let hasShield = false; 
let gameLive = true;
let gameLoopId; 
let gamePhase = GamePhase.WAVE_1; 

// --------------------------------
// 키 입력 처리
// --------------------------------
let onKeyDown = function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
    }
};
window.addEventListener('keydown', onKeyDown);

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") eventEmitter.emit(Messages.KEY_EVENT_UP);
    else if (evt.key === "ArrowDown") eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    else if (evt.key === "ArrowLeft") eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    else if (evt.key === "ArrowRight") eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    else if (evt.key === " ") eventEmitter.emit(Messages.KEY_EVENT_SPACE); 
    else if (evt.key === "Enter") eventEmitter.emit(Messages.KEY_EVENT_ENTER); 
    else if (evt.key === "r" || evt.key === "R") {
    fireMeteor();
}

});

// 게임 루프 시작 함수 
function startGameLoop() {
    gameLoopId = setInterval(() => { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStarBackground(ctx, canvas);
        
        drawLife(ctx, canvas); 
        drawPoints(ctx, canvas); 
        
        updateGameObjects();
        drawGameObjects(ctx);
        
        checkGameOver();

    }, 100);
}

// 재시작 로직
function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); 
    }
    
    eventEmitter.clear(); 

    // Enter 키 리스너를 다시 등록 
    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        if (!gameLive) {
            resetGame();
        }
    });
    
    initGame(); 
    startGameLoop(); 
}

    
// --------------------------------
// window.onload → 유일한 게임 루프
// --------------------------------
let explosionImg;

window.onload = async () => {
    // 캔버스 초기화
    canvas = document.getElementById("myCanvas");
    if (!canvas) {
        console.error("Canvas element with id 'myCanvas' not found.");
        return;
    }
    ctx = canvas.getContext("2d");
    
    // 이미지 로드
    heroImg = await loadTexture("assets/player.png"); 
    heroLeftImg = await loadTexture("png/playerLeft.png"); 
    heroRightImg = await loadTexture("png/playerRight.png"); 
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("png/laserRed.png");
    lifeImg = await loadTexture("png/life.png");
    explosionImg = await loadTexture("png/laserRedShot.png");
    shieldImg = await loadTexture("png/Shield.png"); 
    meteorImg = await loadTexture("png/meteorBig.png");


    initStars();    
    
    resetGame();
};