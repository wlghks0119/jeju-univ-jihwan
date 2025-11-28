function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}


// 별 배경 그리기 (이미지 없이)
function drawStarBackground(ctx, canvas, starCount = 200) {
    // 배경 검정색
    ctx.fillStyle = '#2a003d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 색상과 랜덤 위치
    ctx.fillStyle = 'white';
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1; // 별 크기 랜덤
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}


// 플레이어와 보조 우주선 그리기
function drawPlayer(ctx, canvas, heroImg) {
    const playerX = canvas.width / 2 - 45;
    const playerY = canvas.height - canvas.height / 4;

    // 메인 우주선
    ctx.drawImage(heroImg, playerX, playerY);

    // 보조 우주선 크기 조정 (50% 축소)
    const auxWidth = heroImg.width * 0.5;
    const auxHeight = heroImg.height * 0.5;

    // 좌측 보조 우주선
    ctx.drawImage(heroImg, playerX - auxWidth - 10, playerY + 20, auxWidth, auxHeight);
    // 우측 보조 우주선
    ctx.drawImage(heroImg, playerX + heroImg.width + 10, playerY + 20, auxWidth, auxHeight);
}

// 적군 피라미드 배치
function createEnemies2(ctx, canvas, enemyImg) {
    const rows = 5; // 행 수
    const startY =  280; // 아래쪽에서 시작

    for (let row = 0; row < rows; row++) {
        const numInRow = row + 1;
        const offsetX = canvas.width / 2 - (numInRow * enemyImg.width) / 2;

        // 아래에서 위로 올라가도록 y 계산
        const y = startY - row * (enemyImg.height + 10);

        for (let col = 0; col < numInRow; col++) {
            const x = offsetX + col * enemyImg.width;
            ctx.drawImage(enemyImg, x, y);
        }
    }
}


window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    const heroImg = await loadTexture('assets/player.png');
    const enemyImg = await loadTexture('assets/enemyShip.png');

    // 이미지 없이 별 배경
    drawStarBackground(ctx, canvas);

    drawPlayer(ctx, canvas, heroImg);
    createEnemies2(ctx, canvas, enemyImg);
};

