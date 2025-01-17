import * as THREE from 'three';

let scene, camera, renderer;
let paddle1, paddle2, ball;
let paddle1Speed = 0, paddle2Speed = 0;
let ballSpeedX = 0.1, ballSpeedY = 0.1;
let score1 = 0, score2 = 0;
let isPaused = false;
let winScore = 10;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ajouter les raquettes
    const geometry = new THREE.BoxGeometry(1, 4, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    paddle1 = new THREE.Mesh(geometry, material);
    paddle1.position.x = -15;
    scene.add(paddle1);

    paddle2 = new THREE.Mesh(geometry, material);
    paddle2.position.x = 15;
    scene.add(paddle2);

    // Ajouter la balle
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const ballMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('pokeball.png') });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.rotateY(Math.PI*1.5);
    scene.add(ball);

    // Ajouter les murs
    const wallGeometry = new THREE.BoxGeometry(37, 1, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('wood.png') });

    const topWall = new THREE.Mesh(wallGeometry, wallMaterial); // Mur du haut
    topWall.position.y = 11;
    scene.add(topWall);

    const bottomWall = new THREE.Mesh(wallGeometry, wallMaterial); // Mur du bas
    bottomWall.position.y = -11;
    scene.add(bottomWall);

    const sideWallGeometry = new THREE.BoxGeometry(1, 22, 1);
    
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial); // Mur de gauche
    leftWall.position.x = -18;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial); // Mur de droite
    rightWall.position.x = 18;
    scene.add(rightWall);

    // Ajouter le sol
    const floorGeometry = new THREE.PlaneGeometry(37, 22);
    const floorMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('pelouse.png'), side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    camera.position.z = 20;

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);

    // Afficher le score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    document.body.appendChild(scoreDisplay);
    updateScoreDisplay();

    // Afficher le bouton pause
    const pauseButton = document.createElement('button');
    pauseButton.innerHTML = 'Pause';
    pauseButton.id = 'pauseButton';

    pauseButton.onclick = togglePause;
    document.body.appendChild(pauseButton);

    animate();
}

// Controleurs pour les raquettes (joueur 1 : Z et S, joueur 2 : Flèche haut et Flèche bas)
function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 90: // Z
            paddle1Speed = 0.2;
            break;
        case 83: // S
            paddle1Speed = -0.2;
            break;
        case 38: // Flèche haut
            paddle2Speed = 0.2;
            break;
        case 40: // Flèche bas
            paddle2Speed = -0.2;
            break;
    }
}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 90: // Z
        case 83: // S
            paddle1Speed = 0;
            break;
        case 38: // Flèche haut
        case 40: // Flèche bas
            paddle2Speed = 0;
            break;
    }
}

// Fonction pour mettre à jour l'affichage du score
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.innerHTML = `Joueur 1 : ${score1} - Joueur 2 : ${score2}`;
}

// Fonction pour vérifier si un joueur a gagné
function checkWinner() {
    if (score1 === winScore || score2 === winScore) {
        const winner = score1 > score2 ? 'Joueur 1' : 'Joueur 2';
        const winnerDisplay = document.createElement('div');
        winnerDisplay.id = 'winnerDisplay';
        winnerDisplay.innerHTML = `${winner} a gagné !`;
        document.body.appendChild(winnerDisplay);

        const restartButton = document.createElement('button');
        restartButton.innerHTML = 'Rejouer';
        restartButton.id = 'restartButton';
        restartButton.onclick = () => {
            document.body.removeChild(winnerDisplay);
            document.body.removeChild(restartButton);
            score1 = 0;
            score2 = 0;
            updateScoreDisplay();
            ball.position.x = 0;
            ball.position.y = 0;
            animate();
        };
        document.body.appendChild(restartButton);
        return true;
    }
    return false;
}

// Fonction pour mettre en pause le jeu
function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.innerHTML = 'Pause';
        animate();
    } else {
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.innerHTML = 'Reprendre';
    }
}

function animate() {
    if (checkWinner() || isPaused) return; // Arrêter le jeu si un joueur a gagné ou si le jeu est en pause

    requestAnimationFrame(animate);

    paddle1.position.y += paddle1Speed;
    paddle2.position.y += paddle2Speed;

    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;

    if (ball.position.y > 10 || ball.position.y < -10) {
        ballSpeedY = -ballSpeedY;
    }

    if (ball.position.x > 14 && ball.position.x < 16 && ball.position.y < paddle2.position.y + 2 && ball.position.y > paddle2.position.y - 2) {
        ballSpeedX = -(ballSpeedX + 0.01);
    }

    if (ball.position.x < -14 && ball.position.x > -16 && ball.position.y < paddle1.position.y + 2 && ball.position.y > paddle1.position.y - 2) {
        ballSpeedX = -(ballSpeedX - 0.01);
    }

    if (ball.position.x > 17) {
        score1++;
        ball.position.x = 0;
        ball.position.y = 0;
        ballSpeedX = 0.1;
        updateScoreDisplay();
    }

    if (ball.position.x < -17) {
        score2++;
        ball.position.x = 0;
        ball.position.y = 0;
        ballSpeedX = -0.1;
        updateScoreDisplay();
    }
    
    if (paddle1.position.y > 9) paddle1.position.y = 9;
    if (paddle1.position.y < -9) paddle1.position.y = -9;
    if (paddle2.position.y > 9) paddle2.position.y = 9;
    if (paddle2.position.y < -9) paddle2.position.y = -9;

    renderer.render(scene, camera);
}

init();